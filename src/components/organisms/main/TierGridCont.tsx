'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

import { TIERS } from '@/constants/tiers';
import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';
import { useLanguage } from '@/i18n/LanguageContext';

export const TierGridCont = () => {
  const fade = useScrollFadeIn({ threshold: 0.1 });
  const { t } = useLanguage();

  return (
    <S.Section ref={fade.ref} data-visible={fade.isVisible}>
      <S.Inner>
        <S.Label>{t.tierGrid.label}</S.Label>
        <S.Title>{t.tierGrid.title}</S.Title>
        <S.Grid>
          {TIERS.map((tier, i) => (
            <S.Card key={tier.name} style={{ '--idx': i } as React.CSSProperties}>
              <Image src={tier.src} alt={tier.name} width={72} height={72} />
              <S.Name>{tier.name}</S.Name>
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

const tierHighlight = keyframes`
  0%   { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.06); transform: scale(1); }
  3%   { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.22); transform: scale(1.06); }
  8%   { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.22); transform: scale(1.06); }
  11%  { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.06); transform: scale(1); }
  100% { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.06); transform: scale(1); }
`;

const fadeInStyle = `
  opacity: 0;
  transform: translateY(30px) scale(0.97);
  transition: opacity 0.9s ease-out, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
  &[data-visible='true'] {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const S = {
  Section: styled.section`
    padding: 180px 24px;
    text-align: center;
    background: #000;
    ${fadeInStyle}
  `,

  Inner: styled.div`
    max-width: 980px;
    margin: 0 auto;
  `,

  Label: styled.p`
    font-size: 16px;
    font-weight: 600;
    color: #86868b;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
  `,

  Title: styled.h2`
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: #f5f5f7;
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
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    animation: ${tierHighlight} 13.5s cubic-bezier(0.22, 1, 0.36, 1) infinite;
    animation-delay: calc(var(--idx) * 1.5s);

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
    font-weight: 500;
    color: #86868b;
  `,

  LinkWrap: styled.div`
    margin-top: 48px;

    a {
      display: inline-block;
      padding: 14px 32px;
      font-size: 17px;
      font-weight: 600;
      color: #fff;
      background: #0071e3;
      border-radius: 980px;
      text-decoration: none;
      transition: background 0.3s ease;

      &:hover {
        background: #0077ed;
      }
    }
  `,
};
