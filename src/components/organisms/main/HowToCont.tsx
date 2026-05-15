'use client';

import React from 'react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';

import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';
import { useLanguage } from '@/i18n/LanguageContext';
import { fadeInStyle } from '@/styles/animations';
import { Color } from '@/styles/color';

export const HowToCont = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const titleFade = useScrollFadeIn({ delay: 0 });
  const gridFade = useScrollFadeIn({ delay: 200 });
  const ctaFade = useScrollFadeIn({ delay: 400 });
  const { t } = useLanguage();

  const handleGetStarted = async () => {
    if (session) {
      router.push('/my');
    } else {
      await signIn('github', { callbackUrl: '/my' });
    }
  };

  const steps = [
    { step: 1, title: t.howTo.step1Title, description: t.howTo.step1Desc },
    { step: 2, title: t.howTo.step2Title, description: t.howTo.step2Desc },
    { step: 3, title: t.howTo.step3Title, description: t.howTo.step3Desc },
    { step: 4, title: t.howTo.step4Title, description: t.howTo.step4Desc },
  ];

  return (
    <S.Section>
      <S.Inner>
        <S.Label ref={titleFade.ref} data-visible={titleFade.isVisible}>
          {t.howTo.label}
        </S.Label>
        <S.Title ref={titleFade.ref} data-visible={titleFade.isVisible}>
          {t.howTo.title}
        </S.Title>
        <S.Grid ref={gridFade.ref} data-visible={gridFade.isVisible}>
          {steps.map((step) => (
            <S.Card key={step.step}>
              <S.StepBadge>STEP {step.step}</S.StepBadge>
              <S.StepTitle>{step.title}</S.StepTitle>
              <S.StepDesc>{step.description}</S.StepDesc>
            </S.Card>
          ))}
        </S.Grid>
        <S.CTAGroup ref={ctaFade.ref} data-visible={ctaFade.isVisible}>
          <S.CTAPrimary onClick={handleGetStarted}>
            {t.hero.getStarted}
          </S.CTAPrimary>
          <S.LinkButton>
            <Link
              href="https://github.com/git-tiers/gittiers?tab=readme-ov-file#how-to-use"
              rel="noopener noreferrer"
              target="_blank">
              {t.howTo.learnMore} &rarr;
            </Link>
          </S.LinkButton>
        </S.CTAGroup>
      </S.Inner>
    </S.Section>
  );
};


const S = {
  Section: styled.section`
    background: ${Color.Black};
    padding: 180px 24px;
    text-align: center;
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
    margin-bottom: 12px;
    ${fadeInStyle}
  `,

  Title: styled.h2`
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.1;
    color: ${Color.TextLight};
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

  StepBadge: styled.span`
    display: inline-block;
    font-size: 12px;
    font-weight: 700;
    color: ${Color.Link};
    background: rgba(0, 113, 227, 0.12);
    padding: 4px 12px;
    border-radius: 980px;
    letter-spacing: 0.04em;
    margin-bottom: 16px;
  `,

  StepTitle: styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: ${Color.TextLight};
    margin-bottom: 8px;
  `,

  StepDesc: styled.p`
    font-size: 15px;
    font-weight: 400;
    color: ${Color.TextSecondary};
    line-height: 1.5;
  `,

  CTAGroup: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    ${fadeInStyle}

    @media (max-width: 480px) {
      flex-direction: column;
      gap: 12px;
    }
  `,

  CTAPrimary: styled.button`
    padding: 14px 36px;
    font-size: 17px;
    font-weight: 600;
    color: #fff;
    background: ${Color.Link};
    border: none;
    border-radius: 980px;
    cursor: pointer;
    transition: background 0.3s ease;

    &:hover {
      background: ${Color.LinkHover};
    }
  `,

  LinkButton: styled.div`
    a {
      display: inline-block;
      font-size: 17px;
      font-weight: 600;
      color: ${Color.Link};
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        color: #64acff;
        text-decoration: underline;
      }
    }
  `,
};
