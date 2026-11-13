'use client';

import React, { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import styled from '@emotion/styled';
import { PageContainer } from '@/components/common/PageContainer';
import { keyframes } from '@emotion/react';

import { AuroraBackdrop } from '@/components/common/AuroraBackdrop';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MyRankCard } from '@/components/pages/ranking/MyRankCard';
import { Podium } from '@/components/pages/ranking/Podium';
import { TierDistribution } from '@/components/pages/ranking/TierDistribution';
import { useRankingData } from '@/components/pages/ranking/useRankingData';
import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';

/** 로그인 없이 볼 수 있는 랭킹. 상위 3명은 가린 아이디와 티어만 보여 준다. */
export default function RankingPage() {
  // 개발 미리보기 파라미터(useSearchParams)를 쓰므로 Suspense 로 감싼다.
  return (
    <Suspense fallback={null}>
      <RankingContent />
    </Suspense>
  );
}

const RankingContent = () => {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const { data, refresh, previewLogin } = useRankingData();

  return (
    <>
      <AuroraBackdrop />
      <S.Wrapper>
        <S.PageLabel>{t.ranking.label}</S.PageLabel>
        <S.PageTitle>{t.ranking.title}</S.PageTitle>
        <S.Subtitle>{t.ranking.subtitle}</S.Subtitle>
        {previewLogin && (
          <S.PreviewBanner role="status">
            개발 미리보기: {previewLogin} 로 로그인한 것처럼 보여 줍니다. 갱신은
            하지 않습니다.
          </S.PreviewBanner>
        )}

        {data.status === 'error' && (
          <S.Error role="alert">{t.ranking.loadFailed}</S.Error>
        )}

        {data.status === 'ready' && (
          <S.Content>
            <Podium items={data.ranking.podium} />
            {/* 상위 3명과 내 순위·분포 사이 경계 */}
            <S.Divider role="separator" />
            {data.my.status === 'ranked' && (
              <MyRankCard
                status="ranked"
                me={data.my.me}
                loginId={previewLogin ?? session?.loginId ?? ''}
                refreshAvailableAt={data.my.refreshAvailableAt}
                onRefresh={refresh}
              />
            )}
            {data.my.status === 'unranked' && (
              <MyRankCard
                status="unranked"
                refreshAvailableAt={data.my.refreshAvailableAt}
                onRefresh={refresh}
              />
            )}
            {/* 로그인하지 않은 사람에게는 갱신 버튼 없이 로그인 안내만 */}
            {data.my.status === 'guest' && <MyRankCard status="guest" />}
            <TierDistribution
              buckets={data.ranking.distribution}
              myTier={
                data.my.status === 'ranked' ? data.my.me.tierName : undefined
              }
            />
            <S.Note>{t.ranking.privacyNote}</S.Note>
          </S.Content>
        )}
      </S.Wrapper>
      <LoadingSpinner loading={data.status === 'loading'} />
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

    @media (max-width: 768px) {
      font-size: 28px;
    }
  `,

  Subtitle: styled.p`
    margin: 8px 0 40px;
    font-size: 15px;
    color: ${Color.TextSecondary};

    @media (max-width: 768px) {
      margin-bottom: 28px;
    }
  `,

  // 데이터가 다 준비되면 섹션이 차례로 아래에서 떠오른다.
  // 벤토 그리드: 위에 상위 3명, 아래에 내 순위 · 티어 분포 두 칸
  Content: styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;

    > :first-child,
    > :last-child,
    > [role='separator'] {
      grid-column: 1 / -1;
    }

    @media (max-width: 640px) {
      grid-template-columns: minmax(0, 1fr);
    }

    /* 끝난 뒤에는 transform 을 놓아줘서 카드 호버 효과가 살아 있게 한다(backwards). */
    > * {
      animation: ${riseIn} 0.6s cubic-bezier(0.22, 1, 0.36, 1) backwards;
    }

    > *:nth-child(2) {
      animation-delay: 0.08s;
    }

    > *:nth-child(3) {
      animation-delay: 0.16s;
    }

    > *:nth-child(4) {
      animation-delay: 0.24s;
    }

    @media (prefers-reduced-motion: reduce) {
      > * {
        animation: none;
      }
    }
  `,

  // 상위 3명과 아래 칸을 나누는 선: 가운데가 밝고 양끝으로 갈수록 옅어진다.
  Divider: styled.hr`
    height: 1px;
    margin: 24px 0 20px;
    border: none;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.04),
      rgba(255, 255, 255, 0.26) 50%,
      rgba(255, 255, 255, 0.04)
    );
    box-shadow: 0 0 10px rgba(100, 172, 255, 0.12);
  `,

  PreviewBanner: styled.p`
    margin: -24px 0 24px;
    padding: 10px 14px;
    font-size: 13px;
    color: ${Color.Orange100};
    background: rgba(234, 152, 47, 0.12);
    border-radius: 12px;
  `,

  Note: styled.p`
    margin-top: 8px;
    font-size: 12px;
    text-align: center;
    color: ${Color.TextSecondary};
  `,

  Error: styled.p`
    padding: 14px 16px;
    font-size: 14px;
    color: ${Color.Red100};
    background: rgba(249, 68, 57, 0.1);
    border-radius: 12px;
  `,
};
