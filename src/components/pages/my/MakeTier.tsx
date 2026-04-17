import { signOut, useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import styled from '@emotion/styled';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { getContributeCount } from '@/utils/github';
import { getTierImage, getTierText } from '@/utils/getTier';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { firestore } from '../../../../firebase/firebase';
import { TierImage } from '@/components/organisms/my/TierImage';
import { TierController } from '@/components/organisms/my/TierController';
import { UserData } from '@/types/api';

export const MakeTier = () => {
  const { data: session } = useSession();
  const [contributeCount, setContributeCount] = useState<number>(0);
  const [tierImage, setTierImage] = useState<string>('');
  const [tierText, setTierText] = useState<string>('');
  const [isCard, setIsCard] = useState<string>('card');
  const [isText, setIsText] = useState<string>('exist');
  const [isMode, setIsMode] = useState<string>('light');
  const [loading, setLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [userImageUrl, setUserImageUrl] = useState<string>('');

  const handleGithubData = async () => {
    if (session?.accessToken && session?.loginId) {
      setLoading(true);
      const res = await getContributeCount({
        accessToken: session?.accessToken,
        loginId: session?.loginId,
      });
      setTimeout(() => {
        setLoading(false);
      }, 500);
      if (res === 'ERROR') {
        setTimeout(() => {
          setLoading(false);
        }, 500);
        toast.error('An error occurred. Please try again later.');

        await signOut({
          callbackUrl: '/',
        });
        return;
      }
      setContributeCount(res);
    }
  };

  const handleSaveImage = async () => {
    if (!session?.loginId) {
      toast.error('Please log in first.');
      return;
    }

    setSaveLoading(true);
    try {
      const element = document.getElementById('tierCard');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
        scale: 1,
        useCORS: true,
      });

      const base64Image = canvas.toDataURL('image/jpeg', 0.8);

      const imageSizeInBytes = (base64Image.length * 3) / 4;
      if (imageSizeInBytes > 900000) {
        toast.error('Image is too large. Please try with simpler settings.');
        return;
      }

      const userRef = doc(firestore, 'users', session.loginId);
      await setDoc(
        userRef,
        {
          tierImageBase64: base64Image,
          lastUpdated: new Date().toISOString(),
          imageSettings: {
            isCard,
            isText,
            isMode,
            contributeCount,
          },
        },
        { merge: true },
      );

      const baseUrl = window.location.origin;
      setUserImageUrl(`${baseUrl}/api/tier/${session.loginId}`);

      toast.success('Image saved successfully!');
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('Failed to save image. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (userImageUrl) {
      navigator.clipboard.writeText(
        `<a href="https://github.com/git-tiers/gittiers"><img src="${userImageUrl}" alt="Git-TIERS" /></a>`,
      );
      toast.success('Image tag copied to clipboard!');
    }
  };

  const handleController = async () => {
    const userRef = doc(firestore, 'users', session?.loginId || '');
    const userDoc = await getDoc(userRef);
    const userData: UserData = userDoc.data() as UserData;
    const controller = userData.imageSettings;

    if (controller) {
      setIsCard(controller?.isCard);
      setIsText(controller?.isText);
      setIsMode(controller?.isMode);
    }
  };

  useEffect(() => {
    handleGithubData();
  }, [session?.accessToken]);

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
        Total Contributions <S.ContribCount>{contributeCount || 0}</S.ContribCount>
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
          {saveLoading ? 'Saving...' : 'Save Image'}
        </S.PrimaryButton>
        <S.SecondaryButton onClick={copyToClipboard}>
          Copy Tag
        </S.SecondaryButton>
      </S.Actions>

      <S.TableLink>
        <Link
          href="https://github.com/git-tiers/gittiers?tab=readme-ov-file#tier-table"
          rel="noopener noreferrer"
          target="_blank">
          View Tier Table &rarr;
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
    color: #86868b;
  `,

  ContribCount: styled.span`
    font-weight: 700;
    color: #1d1d1f;
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
    background: #0071e3;
    border: none;
    border-radius: 980px;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: #0077ed;
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
    color: #86868b;
    background: transparent;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 980px;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;

    &:hover {
      border-color: rgba(0, 0, 0, 0.25);
      color: #1d1d1f;
    }
  `,

  TableLink: styled.div`
    a {
      font-size: 14px;
      font-weight: 600;
      color: #0071e3;
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        text-decoration: underline;
      }
    }
  `,
};