'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import styled from '@emotion/styled';
import toast from 'react-hot-toast';

import { Profile } from '@/components/pages/my/Profile';
import { MakeTier } from '@/components/pages/my/MakeTier';
import {
  MyAccountProvider,
  useMyAccount,
} from '@/components/pages/my/MyAccountContext';
import { MyBackdrop } from '@/components/pages/my/MyBackdrop';
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
  const { isPreview, previewLoading, previewError, previewData } =
    useMyAccount();

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
    <>
      <MyBackdrop />
      <S.Wrapper>
        <S.PageLabel>{t.myPage.label}</S.PageLabel>
        <S.PageTitle>{t.myPage.title}</S.PageTitle>
        {isPreview && (
          <S.PreviewBanner role="status" data-error={previewError}>
            {previewError
              ? '개발 미리보기를 불러오지 못했습니다. 아이디와 .env.local 의 GITHUB_TOKEN 을 확인하세요.'
              : `개발 미리보기: ${previewData?.profile.loginId ?? '불러오는 중'} · 옵션은 저장되지 않고, 탈퇴는 확인창까지만 열립니다.`}
            <S.ToastDemo>
              <span>토스트 보기</span>
              <button
                type="button"
                onClick={() => toast.success(t.toast.tagCopied)}>
                성공
              </button>
              <button
                type="button"
                onClick={() => toast.error(t.toast.saveFailed)}>
                오류
              </button>
              <button
                type="button"
                onClick={() =>
                  toast(t.toast.withdrawRevokeManual, { duration: 8000 })
                }>
                일반
              </button>
              <button
                type="button"
                onClick={() =>
                  toast.promise(
                    new Promise((resolve) => setTimeout(resolve, 1500)),
                    {
                      loading: t.myPage.saving,
                      success: t.myPage.saved,
                      error: t.myPage.saveError,
                    }
                  )
                }>
                로딩
              </button>
            </S.ToastDemo>
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
    </>
  );
};

const S = {
  Wrapper: styled.div`
    position: relative;
    z-index: 1;
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

  ToastDemo: styled.span`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 8px;

    button {
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
      color: ${Color.TextLight};
      background: rgba(255, 255, 255, 0.08);
      border: none;
      border-radius: 980px;
      cursor: pointer;

      &:hover {
        background: rgba(255, 255, 255, 0.16);
      }
    }
  `,

  Content: styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
};
