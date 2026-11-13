'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import styled from '@emotion/styled';
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
  const { t } = useLanguage();
  const { data: session } = useSession();
  const data = useRankingData();

  return (
    <>
      <AuroraBackdrop />
      <S.Wrapper>
        <S.PageLabel>{t.ranking.label}</S.PageLabel>
        <S.PageTitle>{t.ranking.title}</S.PageTitle>
        <S.Subtitle>{t.ranking.subtitle}</S.Subtitle>

        {data.status === 'error' && (
          <S.Error role="alert">{t.ranking.loadFailed}</S.Error>
        )}

        {data.status === 'ready' && (
          <S.Content>
            <Podium items={data.ranking.podium} />
            {data.my.status === 'ranked' ? (
              <MyRankCard
                status="ranked"
                me={data.my.me}
                loginId={session?.loginId ?? ''}
              />
            ) : (
              <MyRankCard status={data.my.status} />
            )}
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
}

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
  Wrapper: styled.div`
    position: relative;
    z-index: 1;
    max-width: 880px;
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
  Content: styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;

    > * {
      animation: ${riseIn} 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
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

  Note: styled.p`
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
