'use client';

import React from 'react';
import Image from 'next/image';
import styled from '@emotion/styled';

import { SpotlightCard } from '@/components/common/SpotlightCard';
import { TIER_ACCENTS } from '@/constants/tierAccents';
import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';
import { PODIUM_SIZE, type PodiumItem } from '@/utils/ranking';

/**
 * 상위 3명 벤토 카드.
 * 1위는 넓은 카드, 2·3위는 그 아래 두 칸. 큰 순위 숫자(01·02·03)와 티어 색 빛으로만 구분한다.
 */
export const Podium = ({
  items,
}: {
  readonly items: readonly PodiumItem[];
}) => {
  const { t } = useLanguage();
  const slots = Array.from({ length: PODIUM_SIZE }, (_, i) => items[i] ?? null);

  return (
    <S.Grid role="list">
      {slots.map((item, i) => {
        const rank = i + 1;
        const style = {
          '--accent': item
            ? TIER_ACCENTS[item.tierName]
            : 'rgba(255,255,255,0.3)',
        } as React.CSSProperties;

        return (
          <S.Card
            key={rank}
            role="listitem"
            style={style}
            data-rank={rank}
            data-empty={!item}>
            <S.Number aria-label={`${rank}`}>
              {String(rank).padStart(2, '0')}
            </S.Number>
            {item ? (
              <S.Info>
                <S.TierText>{item.tierText}</S.TierText>
                <S.Login>
                  {item.maskedLogin}
                  {item.isMe && <S.MeBadge>{t.ranking.me}</S.MeBadge>}
                </S.Login>
              </S.Info>
            ) : (
              <S.Empty>{t.ranking.podiumEmpty}</S.Empty>
            )}
            {item && (
              <S.Emblem>
                <Image
                  src={item.tierImage}
                  alt={item.tierName}
                  width={112}
                  height={112}
                />
              </S.Emblem>
            )}
          </S.Card>
        );
      })}
    </S.Grid>
  );
};

const S = {
  Grid: styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;

    > :first-of-type {
      grid-column: 1 / -1;
    }

    @media (max-width: 640px) {
      grid-template-columns: minmax(0, 1fr);
    }
  `,

  Card: styled(SpotlightCard)`
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: end;
    gap: 16px;
    min-height: 150px;
    padding: 22px 24px;
    border-radius: 24px;
    /* 오른쪽 위에서 티어 색이 은은하게 번진다 */
    background: radial-gradient(
        70% 90% at 100% 0%,
        color-mix(in srgb, var(--accent) 20%, transparent),
        transparent 70%
      ),
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.05),
        rgba(255, 255, 255, 0.015)
      );

    &[data-rank='1'] {
      min-height: 200px;
      padding: 28px 32px;
      border-color: color-mix(
        in srgb,
        var(--accent) 30%,
        rgba(255, 255, 255, 0.08)
      );
    }

    &[data-empty='true'] {
      align-items: center;
    }

    @media (max-width: 640px) {
      min-height: 120px;
      padding: 18px 20px;

      &[data-rank='1'] {
        min-height: 150px;
        padding: 22px;
      }
    }
  `,

  // 큰 순위 숫자: 1위는 채운 그라데이션, 2·3위는 외곽선만
  Number: styled.span`
    align-self: start;
    font-size: 64px;
    font-weight: 800;
    line-height: 0.9;
    letter-spacing: -0.05em;
    font-variant-numeric: tabular-nums;
    color: transparent;
    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.28);

    [data-rank='1'] & {
      font-size: 96px;
      -webkit-text-stroke: 0;
      background: linear-gradient(
        180deg,
        ${Color.TextLight} 20%,
        var(--accent)
      );
      -webkit-background-clip: text;
      background-clip: text;
    }

    @media (max-width: 640px) {
      font-size: 44px;

      [data-rank='1'] & {
        font-size: 64px;
      }
    }
  `,

  Info: styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  `,

  TierText: styled.strong`
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: ${Color.TextLight};

    [data-rank='1'] & {
      font-size: 26px;
    }

    @media (max-width: 640px) {
      font-size: 15px;

      [data-rank='1'] & {
        font-size: 19px;
      }
    }
  `,

  Login: styled.span`
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 13px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace !important;
    color: ${Color.TextSecondary};
  `,

  MeBadge: styled.span`
    padding: 1px 8px;
    font-size: 11px;
    font-weight: 700;
    color: ${Color.Black};
    background: var(--accent);
    border-radius: 980px;
  `,

  Emblem: styled.div`
    align-self: center;
    filter: drop-shadow(
      0 14px 30px color-mix(in srgb, var(--accent) 40%, transparent)
    );

    img {
      display: block;
      object-fit: contain;
      width: 76px !important;
      height: 76px !important;
    }

    [data-rank='1'] & img {
      width: 112px !important;
      height: 112px !important;
    }

    @media (max-width: 640px) {
      img,
      [data-rank='1'] & img {
        width: 56px !important;
        height: 56px !important;
      }
    }
  `,

  Empty: styled.span`
    font-size: 13px;
    color: ${Color.TextSecondary};
  `,
};
