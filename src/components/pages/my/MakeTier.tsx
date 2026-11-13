import { signOut } from 'next-auth/react';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useEffectEvent,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SyncIcon from '@mui/icons-material/Sync';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import { getTierImage, getTierText } from '@/utils/getTier';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TierImage } from '@/components/organisms/my/TierImage';
import { TierController } from '@/components/organisms/my/TierController';
import { useLanguage } from '@/i18n/LanguageContext';
import { useMyAccount } from '@/components/pages/my/MyAccountContext';
import { CardType, DEFAULT_IMAGE_OPTIONS, TextVisibility } from '@/types/api';
import { Color } from '@/styles/color';

/** 옵션을 바꾼 뒤 이 시간 동안 추가 변경이 없으면 저장한다(색상 피커 드래그 중 연속 저장 방지). */
const AUTO_SAVE_DELAY_MS = 700;

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const META_ICON_SX = { fontSize: 14 } as const;

const SAVE_STATUS_ICONS = {
  idle: CloudDoneOutlinedIcon,
  saving: SyncIcon,
  saved: CheckCircleOutlineIcon,
  error: ErrorOutlineIcon,
} as const;

const TIER_TABLE_URL = 'https://github.com/git-tiers/gittiers?tab=readme-ov-file#tier-table';

export const MakeTier = () => {
  const { loginId, isPreview, previewData } = useMyAccount();
  const { t } = useLanguage();
  // 개발 미리보기는 불러온 값으로 시작한다(페이지가 데이터를 다 받은 뒤에 이 컴포넌트를 그린다).
  const initialOptions = previewData?.imageSettings ?? DEFAULT_IMAGE_OPTIONS;
  const [contributeCount, setContributeCount] = useState<number>(
    previewData?.contributions ?? 0
  );
  const [isCard, setIsCard] = useState<CardType>(initialOptions.isCard);
  const [isText, setIsText] = useState<TextVisibility>(initialOptions.isText);
  const [isMode, setIsMode] = useState<string>(initialOptions.isMode);
  const [loading, setLoading] = useState<boolean>(true);
  // 사용자가 옵션을 바꾼 횟수. 0 이면(불러오기만 한 상태) 저장하지 않는다.
  const [editVersion, setEditVersion] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // 기여 수에서 바로 계산한다(0 이어도 Iron 4 가 보이도록).
  const tierImage = getTierImage(contributeCount);
  const tierText = getTierText(contributeCount);

  // 개발 모드에서 로그인 없이 /my 를 열거나 미리보기(?preview=아이디)로 열면 로딩 화면 없이 보여준다.
  const isDevPreview =
    process.env.NODE_ENV === 'development' && (!loginId || isPreview);

  // effect 의존성에 t(언어)를 넣지 않기 위해 Effect Event 로 분리한다.
  const handleLoadError = useEffectEvent(async () => {
    toast.error(t.toast.error);
    await signOut({ callbackUrl: '/' });
  });
  const handleSaveError = useEffectEvent(() => {
    toast.error(t.toast.saveFailed);
  });

  /** 사용자가 바꾼 옵션만 자동 저장 대상으로 표시한다. */
  const editable =
    <T,>(setter: Dispatch<SetStateAction<T>>): Dispatch<SetStateAction<T>> =>
    (value) => {
      setter(value);
      setEditVersion((version) => version + 1);
    };

  const copyToClipboard = () => {
    if (!loginId) return;
    const userImageUrl = `${window.location.origin}/api/tier/${loginId}`;
    navigator.clipboard.writeText(
      `<a href="https://github.com/git-tiers/gittiers"><img src="${userImageUrl}" alt="Git-TIERS" /></a>`
    );
    toast.success(t.toast.tagCopied);
  };

  // 기여 수 조회(배지와 같은 값)
  useEffect(() => {
    if (!loginId || isPreview) return undefined;

    let cancelled = false;
    let spinnerTimer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        const res = await fetch('/api/github/contributions');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (!cancelled) setContributeCount(data.contributions);
      } catch {
        if (!cancelled) await handleLoadError();
        return;
      }
      // 스피너가 깜빡이지 않게 잠깐 유지한다.
      spinnerTimer = setTimeout(() => {
        if (!cancelled) setLoading(false);
      }, 500);
    };

    load();

    return () => {
      cancelled = true;
      clearTimeout(spinnerTimer);
    };
  }, [loginId, isPreview]);

  // 저장된 표시 옵션 불러오기
  useEffect(() => {
    if (!loginId || isPreview) return undefined;

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/api/tier/settings');
        if (!res.ok) return;
        const data = await res.json();
        const settings = data.imageSettings;

        if (settings && !cancelled) {
          setIsCard(settings.isCard as CardType);
          setIsText(settings.isText as TextVisibility);
          setIsMode(settings.isMode);
        }
      } catch {
        // 설정을 못 불러와도 기본값으로 쓸 수 있으므로 무시한다.
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [loginId, isPreview]);

  // 옵션을 바꾸면 잠시 뒤 자동 저장한다. README 배지에도 이 옵션이 쓰인다.
  useEffect(() => {
    // 개발 미리보기는 다른 사람의 설정이므로 저장하지 않는다.
    if (!loginId || isPreview || editVersion === 0) return undefined;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const res = await fetch('/api/tier/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageSettings: { isCard, isText, isMode } }),
        });
        if (!res.ok) throw new Error('Failed to save');
        if (!cancelled) setSaveStatus('saved');
      } catch {
        if (!cancelled) {
          setSaveStatus('error');
          handleSaveError();
        }
      }
    }, AUTO_SAVE_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [loginId, isPreview, editVersion, isCard, isText, isMode]);

  const saveStatusText = isPreview
    ? '미리보기라 저장되지 않음'
    : {
        idle: t.myPage.autoSaveHint,
        saving: t.myPage.saving,
        saved: t.myPage.saved,
        error: t.myPage.saveError,
      }[saveStatus];

  const SaveStatusIcon = isPreview ? VisibilityOutlinedIcon : SAVE_STATUS_ICONS[saveStatus];

  return (
    <>
      <S.Card>
        <S.ContribLabel>{t.myPage.totalContributions}</S.ContribLabel>

        <S.TierWrap>
          <TierImage
            isMode={isMode}
            isCard={isCard}
            isText={isText}
            tierImage={tierImage}
            tierText={tierText}
            contributeCount={contributeCount}
          />
          <TierController
            isCard={isCard}
            isText={isText}
            isMode={isMode}
            setIsCard={editable(setIsCard)}
            setIsText={editable(setIsText)}
            setIsMode={editable(setIsMode)}
          />
        </S.TierWrap>

        <S.Actions>
          <S.PrimaryButton onClick={copyToClipboard} disabled={!loginId}>
            {t.myPage.copyTag}
          </S.PrimaryButton>
          <S.SecondaryButton href={TIER_TABLE_URL} rel="noopener noreferrer" target="_blank">
            {t.myPage.viewTierTable}
            <OpenInNewIcon sx={META_ICON_SX} aria-hidden />
          </S.SecondaryButton>
        </S.Actions>

        <S.MetaRow>
          <S.MetaItem role="status" aria-live="polite" data-status={isPreview ? 'preview' : saveStatus}>
            <SaveStatusIcon sx={META_ICON_SX} aria-hidden />
            {saveStatusText}
          </S.MetaItem>
          <S.MetaItem>
            <AutorenewIcon sx={META_ICON_SX} aria-hidden />
            {t.myPage.autoUpdateNote}
          </S.MetaItem>
        </S.MetaRow>
      </S.Card>
      <LoadingSpinner loading={loading && !isDevPreview} />
    </>
  );
};

const S = {
  Card: styled.div`
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 32px;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    text-align: center;

    @media (max-width: 768px) {
      padding: 24px;
    }
  `,

  ContribLabel: styled.p`
    font-size: 17px;
    font-weight: 400;
    color: ${Color.Gray300};
  `,

  TierWrap: styled.div`
    margin: 24px auto;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  `,

  Actions: styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 10px;
  `,

  PrimaryButton: styled.button`
    padding: 10px 28px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: ${Color.Link};
    border: none;
    border-radius: 980px;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: ${Color.LinkHover};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,

  SecondaryButton: styled.a`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    color: ${Color.TextLight};
    text-decoration: none;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 980px;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.14);
    }
  `,

  MetaRow: styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 16px;
    margin-top: 16px;
  `,

  MetaItem: styled.p`
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    line-height: 1.4;
    color: ${Color.Gray300};

    &[data-status='saved'] {
      color: #30d158;
    }

    &[data-status='error'] {
      color: ${Color.Red100};
    }

    &[data-status='preview'] {
      color: ${Color.Orange100};
    }

    &[data-status='saving'] svg {
      animation: ${spin} 1s linear infinite;
    }
  `,
};
