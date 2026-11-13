import { signOut, useSession } from 'next-auth/react';
import React, { useEffect, useEffectEvent, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import styled from '@emotion/styled';

import { getTierImage, getTierText } from '@/utils/getTier';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TierImage } from '@/components/organisms/my/TierImage';
import { TierController } from '@/components/organisms/my/TierController';
import { useLanguage } from '@/i18n/LanguageContext';
import { CardType, TextVisibility } from '@/types/api';
import { Color } from '@/styles/color';

export const MakeTier = () => {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const loginId = session?.loginId;
  const [contributeCount, setContributeCount] = useState<number>(0);
  const [isCard, setIsCard] = useState<CardType>('card');
  const [isText, setIsText] = useState<TextVisibility>('exist');
  const [isMode, setIsMode] = useState<string>('light');
  const [loading, setLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [hasSaved, setHasSaved] = useState<boolean>(false);

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

  const handleSaveImage = async () => {
    if (!loginId) {
      toast.error(t.toast.loginFirst);
      return;
    }

    setSaveLoading(true);
    try {
      const res = await fetch('/api/tier/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageSettings: {
            isCard,
            isText,
            isMode,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save');
      }

      // 서버가 GitHub 에서 다시 조회해 저장한 값으로 화면을 맞춘다.
      const data: { contributeCount?: number } = await res.json();
      if (typeof data.contributeCount === 'number') {
        setContributeCount(data.contributeCount);
      }

      setHasSaved(true);
      toast.success(t.toast.imageSaved);
    } catch {
      toast.error(t.toast.saveFailed);
    } finally {
      setSaveLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!loginId) return;
    const userImageUrl = `${window.location.origin}/api/tier/${loginId}`;
    navigator.clipboard.writeText(
      `<a href="https://github.com/git-tiers/gittiers"><img src="${userImageUrl}" alt="Git-TIERS" /></a>`,
    );
    toast.success(t.toast.tagCopied);
  };

  // 기여 수 조회
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
          setHasSaved(true);
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

  return (
    <>
    <S.Card>
      <S.ContribLabel>
        {t.myPage.totalContributions} <S.ContribCount>{contributeCount || 0}</S.ContribCount>
      </S.ContribLabel>

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
          setIsCard={setIsCard}
          setIsText={setIsText}
          setIsMode={setIsMode}
        />
      </S.TierWrap>

      <S.Actions>
        <S.PrimaryButton onClick={handleSaveImage} disabled={saveLoading}>
          {saveLoading ? t.myPage.saving : t.myPage.saveImage}
        </S.PrimaryButton>
        <S.SecondaryButton onClick={copyToClipboard} disabled={!hasSaved}>
          {t.myPage.copyTag}
        </S.SecondaryButton>
      </S.Actions>

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

  ContribCount: styled.span`
    font-weight: 700;
    color: ${Color.TextLight};
    font-size: 20px;
    letter-spacing: -0.02em;
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

  SecondaryButton: styled.button`
    padding: 10px 28px;
    font-size: 14px;
    font-weight: 600;
    color: ${Color.Gray300};
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 980px;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;

    &:hover:not(:disabled) {
      border-color: rgba(255, 255, 255, 0.25);
      color: ${Color.TextLight};
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
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
