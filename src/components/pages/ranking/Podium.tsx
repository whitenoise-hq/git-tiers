'use client';

import React from 'react';
import Image from 'next/image';
import styled from '@emotion/styled';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import { TIER_ACCENTS } from '@/constants/tierAccents';
import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';
import { PODIUM_SIZE, type PublicRankItem } from '@/utils/ranking';

/** 화면 배치 순서: 2위 · 1위 · 3위(모바일은 1 · 2 · 3) */
const DESKTOP_ORDER: Record<number, number> = { 1: 2, 2: 1, 3: 3 };

export const Podium = ({
  items,
}: {
  readonly items: readonly PublicRankItem[];
}) => {
  const { t } = useLanguage();
  const slots = Array.from({ length: PODIUM_SIZE }, (_, i) => items[i] ?? null);

  return (
    <S.Podium>
      {slots.map((item, i) => {
        const rank = i + 1;
        const style = {
          '--accent': item
            ? TIER_ACCENTS[item.tierName]
            : 'rgba(255,255,255,0.2)',
          '--order': DESKTOP_ORDER[rank],
        } as React.CSSProperties;

        return (
          <S.Card key={rank} style={style} data-rank={rank} data-empty={!item}>
            <S.Rank>
              {rank === 1 && (
                <EmojiEventsIcon sx={{ fontSize: 16 }} aria-hidden />
              )}
              {rank}
            </S.Rank>
            {item ? (
              <>
                <S.Emblem>
                  <Image
                    src={item.tierImage}
                    alt={item.tierName}
                    width={96}
                    height={96}
                  />
                </S.Emblem>
                <S.TierText>{item.tierText}</S.TierText>
                <S.Login>{item.maskedLogin}</S.Login>
              </>
            ) : (
              <S.Empty>{t.ranking.podiumEmpty}</S.Empty>
            )}
          </S.Card>
        );
      })}
    </S.Podium>
  );
};

const S = {
  Podium: styled.ol`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: end;
    gap: 14px;
    list-style: none;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
      align-items: stretch;
    }
  `,

  Card: styled.li`
    order: var(--order);
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 16px 26px;
    border-radius: 24px;
    border: 1px solid
      color-mix(in srgb, var(--accent) 35%, rgba(255, 255, 255, 0.06));
    background: radial-gradient(
        120% 60% at 50% 0%,
        color-mix(in srgb, var(--accent) 18%, transparent),
        transparent 70%
      ),
      rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);

    /* 1위는 더 높고 은은하게 빛난다 */
    &[data-rank='1'] {
      padding-top: 40px;
      padding-bottom: 36px;
      box-shadow:
        0 24px 60px rgba(0, 0, 0, 0.4),
        0 0 60px color-mix(in srgb, var(--accent) 22%, transparent);
    }

    &[data-empty='true'] {
      min-height: 200px;
      justify-content: center;
    }

    @media (max-width: 640px) {
      order: 0;
      flex-direction: row;
      gap: 14px;
      padding: 16px 18px;

      &[data-rank='1'] {
        padding: 18px;
      }

      &[data-empty='true'] {
        min-height: 0;
      }
    }
  `,

  Rank: styled.span`
    position: absolute;
    top: 14px;
    left: 16px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 14px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--accent);

    @media (max-width: 640px) {
      position: static;
      min-width: 32px;
    }
  `,

  Emblem: styled.div`
    filter: drop-shadow(
      0 10px 24px color-mix(in srgb, var(--accent) 40%, transparent)
    );

    img {
      display: block;
      object-fit: contain;
    }

    [data-rank='1'] & img {
      width: 120px !important;
      height: 120px !important;
    }

    @media (max-width: 640px) {
      img,
      [data-rank='1'] & img {
        width: 52px !important;
        height: 52px !important;
      }
    }
  `,

  TierText: styled.strong`
    margin-top: 14px;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: ${Color.TextLight};

    @media (max-width: 640px) {
      margin-top: 0;
      font-size: 16px;
    }
  `,

  Login: styled.span`
    margin-top: 4px;
    font-size: 13px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace !important;
    color: ${Color.TextSecondary};

    @media (max-width: 640px) {
      margin: 0 0 0 auto;
    }
  `,

  Empty: styled.span`
    font-size: 13px;
    color: ${Color.TextSecondary};
  `,
};
