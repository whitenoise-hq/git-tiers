import { signOut, useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
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
  const [contributeCount, setContributeCount] = useState<number>(0);
  const [tierImage, setTierImage] = useState<string>('');
  const [tierText, setTierText] = useState<string>('');
  const [isCard, setIsCard] = useState<CardType>('card');
  const [isText, setIsText] = useState<TextVisibility>('exist');
  const [isMode, setIsMode] = useState<string>('light');
  const [loading, setLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [userImageUrl, setUserImageUrl] = useState<string>('');

  const handleGithubData = async () => {
    if (session?.loginId) {
      setLoading(true);
      try {
        const res = await fetch('/api/github/contributions');
        if (!res.ok) {
          throw new Error('Failed to fetch');
        }
        const data = await res.json();
        setContributeCount(data.contributions);
      } catch {
        toast.error(t.toast.error);
        await signOut({ callbackUrl: '/' });
        return;
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
  };

  const handleSaveImage = async () => {
    if (!session?.loginId) {
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
            contributeCount,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save');
      }

      const baseUrl = window.location.origin;
      setUserImageUrl(`${baseUrl}/api/tier/${session.loginId}`);

      toast.success(t.toast.imageSaved);
    } catch {
      toast.error(t.toast.saveFailed);
    } finally {
      setSaveLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (userImageUrl) {
      navigator.clipboard.writeText(
        `<a href="https://github.com/git-tiers/gittiers"><img src="${userImageUrl}" alt="Git-TIERS" /></a>`,
      );
      toast.success(t.toast.tagCopied);
    }
  };

  const handleController = async () => {
    try {
      const res = await fetch('/api/tier/settings');
      if (!res.ok) return;
      const data = await res.json();
      const settings = data.imageSettings;

      if (settings) {
        setIsCard(settings.isCard as CardType);
        setIsText(settings.isText as TextVisibility);
        setIsMode(settings.isMode);
      }
    } catch {
      // Settings load failure is non-critical, use defaults
    }
  };

  useEffect(() => {
    handleGithubData();
  }, [session?.loginId]);

  useEffect(() => {
    if (contributeCount) {
      const imgUrl = getTierImage(contributeCount);
      const text = getTierText(contributeCount);
      setTierImage(imgUrl);
      setTierText(text);
    }
  }, [contributeCount]);

  useEffect(() => {
    if (session?.loginId) {
      handleController();
      const baseUrl = window.location.origin;
      setUserImageUrl(`${baseUrl}/api/tier/${session.loginId}`);
    }
  }, [session?.loginId]);

  return (
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
        <S.SecondaryButton onClick={copyToClipboard}>
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

      <LoadingSpinner loading={loading} />
    </S.Card>
  );
};

const S = {
  Card: styled.div`
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    text-align: center;

    @media (max-width: 768px) {
      padding: 24px;
    }
  `,

  ContribLabel: styled.p`
    font-size: 17px;
    font-weight: 400;
    color: ${Color.TextSecondary};
  `,

  ContribCount: styled.span`
    font-weight: 700;
    color: ${Color.TextPrimary};
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
    color: ${Color.TextSecondary};
    background: transparent;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 980px;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;

    &:hover {
      border-color: rgba(0, 0, 0, 0.25);
      color: ${Color.TextPrimary};
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
