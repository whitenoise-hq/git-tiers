'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { PageContainer } from '@/components/common/PageContainer';
import { keyframes } from '@emotion/react';
import toast from 'react-hot-toast';

import { Profile } from '@/components/pages/my/Profile';
import { MakeTier } from '@/components/pages/my/MakeTier';
import {
  MyAccountProvider,
  useMyAccount,
} from '@/components/pages/my/MyAccountContext';
import { AuroraBackdrop } from '@/components/common/AuroraBackdrop';
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
  // 티어 카드 데이터가 다 준비되면 섹션들을 함께 보여 준다(그 전에는 스피너만).
  const [ready, setReady] = useState(false);

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
      <AuroraBackdrop />
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
          <>
            {/* 미리보기 대상이 바뀌면 화면 상태를 새로 만든다. */}
            <S.Content
              key={previewData?.profile.loginId ?? 'me'}
              data-ready={ready}
              aria-busy={!ready}>
              <Profile />
              <MakeTier onReady={() => setReady(true)} />
            </S.Content>
            {/* 섹션은 준비될 때까지 숨겨 두므로 스피너는 섹션 밖에 둔다. */}
            <LoadingSpinner loading={!ready} />
          </>
        )}
      </S.Wrapper>
    </>
  );
};

const riseIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const S = {
  // 본문 너비는 모든 페이지가 같은 틀을 쓴다.
  Wrapper: PageContainer,

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

  // 준비 전에는 숨겨 두고, 준비되면 섹션이 차례로 아래에서 떠오른다.
  // 넓은 화면: 왼쪽에 내 정보(좁게), 오른쪽에 티어 설정. 좁은 화면은 위아래로 쌓는다.
  Content: styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;

    @media (min-width: 900px) {
      display: grid;
      grid-template-columns: 280px minmax(0, 1fr);
      align-items: start;
      gap: 20px;
    }

    > * {
      opacity: 0;
    }

    &[data-ready='true'] > * {
      animation: ${riseIn} 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    &[data-ready='true'] > *:nth-child(2) {
      animation-delay: 0.1s;
    }

    @media (prefers-reduced-motion: reduce) {
      &[data-ready='true'] > * {
        animation: none;
        opacity: 1;
      }
    }
  `,
};
