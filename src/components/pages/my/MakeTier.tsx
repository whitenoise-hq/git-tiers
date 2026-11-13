import { signOut, useSession } from 'next-auth/react';
import React, { Dispatch, SetStateAction, useEffect, useEffectEvent, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import styled from '@emotion/styled';

import { getTierImage, getTierText } from '@/utils/getTier';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TierImage } from '@/components/organisms/my/TierImage';
import { TierController } from '@/components/organisms/my/TierController';
import { useLanguage } from '@/i18n/LanguageContext';
import { CardType, DEFAULT_IMAGE_OPTIONS, TextVisibility } from '@/types/api';
import { Color } from '@/styles/color';

/** 옵션을 바꾼 뒤 이 시간 동안 추가 변경이 없으면 저장한다(색상 피커 드래그 중 연속 저장 방지). */
const AUTO_SAVE_DELAY_MS = 700;

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const MakeTier = () => {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const loginId = session?.loginId;
  const [contributeCount, setContributeCount] = useState<number>(0);
  const [isCard, setIsCard] = useState<CardType>(DEFAULT_IMAGE_OPTIONS.isCard);
  const [isText, setIsText] = useState<TextVisibility>(DEFAULT_IMAGE_OPTIONS.isText);
  const [isMode, setIsMode] = useState<string>(DEFAULT_IMAGE_OPTIONS.isMode);
  const [loading, setLoading] = useState<boolean>(true);
  // 사용자가 옵션을 바꾼 횟수. 0 이면(불러오기만 한 상태) 저장하지 않는다.
  const [editVersion, setEditVersion] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // 기여 수에서 바로 계산한다(0 이어도 Iron 4 가 보이도록).
  const tierImage = getTierImage(contributeCount);
  const tierText = getTierText(contributeCount);

  // 개발 모드에서 로그인 없이 /my 를 열면 로딩 화면 없이 기본값으로 보여준다.
  const isDevPreview = process.env.NODE_ENV === 'development' && !loginId;

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
      `<a href="https://github.com/git-tiers/gittiers"><img src="${userImageUrl}" alt="Git-TIERS" /></a>`,
    );
    toast.success(t.toast.tagCopied);
  };

  // 기여 수 조회(배지와 같은 값)
  useEffect(() => {
    if (!loginId) return undefined;

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
  }, [loginId]);

  // 저장된 표시 옵션 불러오기
  useEffect(() => {
    if (!loginId) return undefined;

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
  }, [loginId]);

  // 옵션을 바꾸면 잠시 뒤 자동 저장한다. README 배지에도 이 옵션이 쓰인다.
  useEffect(() => {
    if (!loginId || editVersion === 0) return undefined;

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
  }, [loginId, editVersion, isCard, isText, isMode]);

  const saveStatusText = {
    idle: t.myPage.autoSaveHint,
    saving: t.myPage.saving,
    saved: t.myPage.saved,
    error: t.myPage.saveError,
  }[saveStatus];

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

      <S.SaveStatus role="status" aria-live="polite" data-status={saveStatus}>
        {saveStatusText}
      </S.SaveStatus>

      <S.Actions>
        <S.PrimaryButton onClick={copyToClipboard} disabled={!loginId}>
          {t.myPage.copyTag}
        </S.PrimaryButton>
      </S.Actions>

      <S.AutoUpdateNote>{t.myPage.autoUpdateNote}</S.AutoUpdateNote>

      <S.TableLink>
        <Link
          href="https://github.com/git-tiers/gittiers?tab=readme-ov-file#tier-table"
          rel="noopener noreferrer"
          target="_blank">
          {t.myPage.viewTierTable} &rarr;
        </Link>
      </S.TableLink>

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
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05);
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
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 8px;
    margin-bottom: 16px;
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

  SaveStatus: styled.p`
    margin: 0 0 12px;
    font-size: 13px;
    color: ${Color.Gray300};

    &[data-status='error'] {
      color: ${Color.Red100};
    }
  `,

  AutoUpdateNote: styled.p`
    margin: 0 0 16px;
    font-size: 13px;
    line-height: 1.5;
    color: ${Color.Gray300};
  `,

  TableLink: styled.div`
    a {
      font-size: 14px;
      font-weight: 600;
      color: ${Color.Link};
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        text-decoration: underline;
      }
    }
  `,
};
