'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import styled from '@emotion/styled';

import { Profile } from '@/components/pages/my/Profile';
import { MakeTier } from '@/components/pages/my/MakeTier';
import { MyAccountProvider, useMyAccount } from '@/components/pages/my/MyAccountContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';

export default function MyPage() {
  // useSearchParams(미리보기 파라미터)를 쓰므로 Suspense 로 감싼다.
  return (
    <Suspense fallback={null}>
      <MyAccountProvider>
        <MyPageContent />
      </MyAccountProvider>
    </Suspense>
  );
}

const MyPageContent = () => {
  const { status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const { isPreview, previewLoading, previewError, previewData } = useMyAccount();

  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!isDev && status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router, isDev]);

  if (!isDev && status !== 'authenticated') {
    return null;
  }

  return (
    <S.Wrapper>
      <S.PageLabel>{t.myPage.label}</S.PageLabel>
      <S.PageTitle>{t.myPage.title}</S.PageTitle>
      {isPreview && (
        <S.PreviewBanner role="status" data-error={previewError}>
          {previewError
            ? '개발 미리보기를 불러오지 못했습니다. 아이디와 .env.local 의 GITHUB_TOKEN 을 확인하세요.'
            : `개발 미리보기: ${previewData?.profile.loginId ?? '불러오는 중'} · 옵션은 저장되지 않고, 탈퇴는 확인창까지만 열립니다.`}
        </S.PreviewBanner>
      )}
      {isPreview && previewLoading ? (
        <LoadingSpinner loading />
      ) : (
        // 미리보기 대상이 바뀌면 화면 상태를 새로 만든다.
        <S.Content key={previewData?.profile.loginId ?? 'me'}>
          <Profile />
          <MakeTier />
        </S.Content>
      )}
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.div`
    max-width: 720px;
    width: 100%;
    margin: 0 auto;
    padding: 40px 24px 0;

    @media (max-width: 768px) {
      padding: 24px 20px 0;
    }
  `,

  PageLabel: styled.p`
    font-size: 14px;
    font-weight: 600;
    color: ${Color.Gray300};
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
  `,

  PageTitle: styled.h2`
    font-size: 36px;
    font-weight: 700;
    color: ${Color.TextLight};
    letter-spacing: -0.03em;
    margin-bottom: 40px;

    @media (max-width: 768px) {
      font-size: 28px;
      margin-bottom: 32px;
    }
  `,

  PreviewBanner: styled.p`
    margin: -16px 0 24px;
    padding: 10px 14px;
    font-size: 13px;
    line-height: 1.5;
    color: ${Color.Orange100};
    background: rgba(234, 152, 47, 0.12);
    border-radius: 12px;

    &[data-error='true'] {
      color: ${Color.Red100};
      background: rgba(249, 68, 57, 0.12);
    }
  `,

  Content: styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
};
