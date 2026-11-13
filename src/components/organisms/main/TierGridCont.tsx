'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

import { TIERS } from '@/constants/tiers';
import { TIER_ACCENTS } from '@/constants/tierAccents';
import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';
import { useLanguage } from '@/i18n/LanguageContext';
import { fadeInStyle } from '@/styles/animations';
import { Color } from '@/styles/color';

export const TierGridCont = () => {
  const [fadeRef, fadeVisible] = useScrollFadeIn({ threshold: 0.1 });
  const { t } = useLanguage();

  return (
    <S.Section ref={fadeRef} data-visible={fadeVisible}>
      <S.Inner>
        <S.Label>{t.tierGrid.label}</S.Label>
        <S.Title>{t.tierGrid.title}</S.Title>
        <S.Grid>
          {TIERS.map((tier, i) => (
            <S.Card
              key={tier.name}
              style={{ '--idx': i, '--accent': TIER_ACCENTS[tier.name] } as React.CSSProperties}>
              <Image src={tier.src} alt={tier.name} width={72} height={72} />
              <S.Name>{tier.name}</S.Name>
              <S.Min>{tier.min.toLocaleString()}+</S.Min>
            </S.Card>
          ))}
        </S.Grid>
        <S.LinkWrap>
          <Link
            href="https://github.com/git-tiers/gittiers?tab=readme-ov-file#tier-table"
            rel="noopener noreferrer"
            target="_blank">
            {t.tierGrid.viewTable} &rarr;
          </Link>
        </S.LinkWrap>
      </S.Inner>
    </S.Section>
  );
};

// 차례로 한 칸씩 그 티어 색으로 빛난다.
const tierHighlight = keyframes`
  0%, 11%, 100% {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.06);
    box-shadow: none;
    transform: scale(1);
  }
  3%, 8% {
    background: color-mix(in srgb, var(--accent) 16%, rgba(255, 255, 255, 0.03));
    border-color: color-mix(in srgb, var(--accent) 55%, transparent);
    box-shadow: 0 0 36px color-mix(in srgb, var(--accent) 30%, transparent);
    transform: scale(1.06);
  }
`;


const S = {
  Section: styled.section`
    padding: 180px 24px;
    text-align: center;
    background:
      radial-gradient(50% 45% at 50% 55%, rgba(178, 107, 255, 0.07), transparent 70%),
      ${Color.Black};
    ${fadeInStyle}
  `,

  Inner: styled.div`
    max-width: 1120px;
    margin: 0 auto;
  `,

  Label: styled.p`
    font-size: 16px;
    font-weight: 600;
    color: ${Color.TextSecondary};
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
  `,

  Title: styled.h2`
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: ${Color.TextLight};
    margin-bottom: 64px;

    @media (max-width: 768px) {
      font-size: 32px;
      margin-bottom: 40px;
    }
  `,

  Grid: styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    max-width: 480px;
    margin: 0 auto;

    @media (max-width: 768px) {
      max-width: 360px;
      gap: 10px;
    }
  `,

  Card: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 18px;
    animation: ${tierHighlight} 13.5s cubic-bezier(0.22, 1, 0.36, 1) infinite;
    animation-delay: calc(var(--idx) * 1.5s);
    transition: border-color 0.3s ease;

    img {
      filter: drop-shadow(0 6px 16px color-mix(in srgb, var(--accent) 35%, transparent));
    }

    &:hover {
      border-color: color-mix(in srgb, var(--accent) 60%, transparent);
    }

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }

    img {
      object-fit: contain;
      width: 52px !important;
      height: 52px !important;
    }

    @media (max-width: 768px) {
      padding: 16px 10px;

      img {
        width: 44px !important;
        height: 44px !important;
      }
    }
  `,

  Name: styled.span`
    font-size: 13px;
    font-weight: 600;
    color: ${Color.TextLight};
  `,

  Min: styled.span`
    margin-top: -4px;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    color: color-mix(in srgb, var(--accent) 70%, ${Color.TextSecondary});
  `,

  LinkWrap: styled.div`
    margin-top: 48px;

    a {
      display: inline-block;
      padding: 14px 32px;
      font-size: 17px;
      font-weight: 600;
      color: #fff;
      background: ${Color.Link};
      border-radius: 980px;
      text-decoration: none;
      transition: background 0.3s ease;

      &:hover {
        background: ${Color.LinkHover};
      }
    }
  `,
};
