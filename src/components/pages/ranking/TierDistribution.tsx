'use client';

import React from 'react';
import styled from '@emotion/styled';

import { TIER_ACCENTS } from '@/constants/tierAccents';
import type { TierName } from '@/constants/tierThresholds';
import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';
import type { TierBucket } from '@/utils/ranking';

interface TierDistributionProps {
  readonly buckets: readonly TierBucket[];
  /** 로그인한 본인의 티어(강조) */
  readonly myTier?: TierName;
}

/** 티어별 상대 비율 막대. 인원수와 총 인원은 보여 주지 않는다. */
export const TierDistribution = ({
  buckets,
  myTier,
}: TierDistributionProps) => {
  const { t } = useLanguage();

  return (
    <S.Section>
      <S.Title>{t.ranking.distribution}</S.Title>
      <S.Chart role="list">
        {buckets.map((bucket) => {
          const style = {
            '--accent': TIER_ACCENTS[bucket.tier],
            '--ratio': bucket.ratio,
          } as React.CSSProperties;
          return (
            <S.Column
              key={bucket.tier}
              role="listitem"
              style={style}
              data-mine={bucket.tier === myTier}
              aria-label={bucket.tier}>
              <S.Track>
                <S.Bar />
              </S.Track>
              <S.Name>{bucket.tier}</S.Name>
            </S.Column>
          );
        })}
      </S.Chart>
    </S.Section>
  );
};

const S = {
  Section: styled.section`
    padding: 24px 22px 18px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  `,

  Title: styled.h3`
    margin-bottom: 18px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${Color.Gray300};
  `,

  Chart: styled.div`
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 8px;
    align-items: end;
  `,

  Column: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 0;
  `,

  Track: styled.div`
    display: flex;
    align-items: flex-end;
    width: 100%;
    max-width: 28px;
    height: 110px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
    overflow: hidden;
  `,

  // 비어 있는 티어도 바닥에 얇게 보이도록 최소 높이를 둔다.
  Bar: styled.div`
    width: 100%;
    height: max(4px, calc(var(--ratio) * 100%));
    border-radius: 8px;
    background: linear-gradient(
      180deg,
      var(--accent),
      color-mix(in srgb, var(--accent) 40%, transparent)
    );
    opacity: 0.85;
    transition: height 0.6s cubic-bezier(0.22, 1, 0.36, 1);

    [data-mine='true'] & {
      opacity: 1;
      box-shadow: 0 0 16px color-mix(in srgb, var(--accent) 60%, transparent);
    }
  `,

  Name: styled.span`
    width: 100%;
    font-size: 10px;
    text-align: center;
    color: ${Color.TextSecondary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    [data-mine='true'] & {
      color: ${Color.TextLight};
      font-weight: 600;
    }
  `,
};
