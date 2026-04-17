'use client';

import React from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';

import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';

const STEPS = [
  {
    number: '01',
    title: 'Login',
    description: 'Sign in with your GitHub account.',
  },
  {
    number: '02',
    title: 'Check Tier',
    description: 'View your current tier on My Page.',
  },
  {
    number: '03',
    title: 'Customize',
    description: 'Set your font and background color, then save.',
  },
  {
    number: '04',
    title: 'Share',
    description: 'Copy the code and paste it into your GitHub README.',
  },
] as const;

export const HowToCont = () => {
  const titleFade = useScrollFadeIn({ delay: 0 });
  const gridFade = useScrollFadeIn({ delay: 200 });
  const ctaFade = useScrollFadeIn({ delay: 400 });

  return (
    <S.Section>
      <S.Inner>
        <S.Label ref={titleFade.ref} data-visible={titleFade.isVisible}>
          Getting Started
        </S.Label>
        <S.Title ref={titleFade.ref} data-visible={titleFade.isVisible}>
          Simple as 1, 2, 3, 4.
        </S.Title>
        <S.Grid ref={gridFade.ref} data-visible={gridFade.isVisible}>
          {STEPS.map((step) => (
            <S.Card key={step.number}>
              <S.StepNumber>{step.number}</S.StepNumber>
              <S.StepTitle>{step.title}</S.StepTitle>
              <S.StepDesc>{step.description}</S.StepDesc>
            </S.Card>
          ))}
        </S.Grid>
        <S.LinkButton ref={ctaFade.ref} data-visible={ctaFade.isVisible}>
          <Link
            href="https://github.com/git-tiers/gittiers?tab=readme-ov-file#how-to-use"
            rel="noopener noreferrer"
            target="_blank">
            Learn more &rarr;
          </Link>
        </S.LinkButton>
      </S.Inner>
    </S.Section>
  );
};

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
    background: #000;
    padding: 180px 24px;
    text-align: center;
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
    margin-bottom: 12px;
    ${fadeInStyle}
  `,

  Title: styled.h2`
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.1;
    color: #f5f5f7;
    margin-bottom: 80px;
    ${fadeInStyle}

    @media (max-width: 768px) {
      font-size: 32px;
      margin-bottom: 48px;
    }
  `,

  Grid: styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 64px;
    ${fadeInStyle}

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  `,

  Card: styled.div`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20px;
    padding: 36px 24px;
    text-align: left;
    transition:
      background 0.3s ease,
      transform 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-4px);
    }
  `,

  StepNumber: styled.span`
    display: block;
    font-size: 40px;
    font-weight: 700;
    color: #0071e3;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
  `,

  StepTitle: styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: #f5f5f7;
    margin-bottom: 8px;
  `,

  StepDesc: styled.p`
    font-size: 15px;
    font-weight: 400;
    color: #86868b;
    line-height: 1.5;
  `,

  LinkButton: styled.div`
    ${fadeInStyle}

    a {
      display: inline-block;
      font-size: 17px;
      font-weight: 600;
      color: #0071e3;
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        color: #64acff;
        text-decoration: underline;
      }
    }
  `,
};
