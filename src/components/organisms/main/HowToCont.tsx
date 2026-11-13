'use client';

import React from 'react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';

import { SpotlightCard } from '@/components/common/SpotlightCard';

import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';
import { useLanguage } from '@/i18n/LanguageContext';
import { fadeInStyle } from '@/styles/animations';
import { Color } from '@/styles/color';

export const HowToCont = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [titleRef, titleVisible] = useScrollFadeIn({ delay: 0 });
  const [gridRef, gridVisible] = useScrollFadeIn({ delay: 200 });
  const [ctaRef, ctaVisible] = useScrollFadeIn({ delay: 400 });
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
        <S.Label ref={titleRef} data-visible={titleVisible}>
          {t.howTo.label}
        </S.Label>
        <S.Title ref={titleRef} data-visible={titleVisible}>
          {t.howTo.title}
        </S.Title>
        <S.Grid ref={gridRef} data-visible={gridVisible}>
          {steps.map((step) => (
            <S.Card key={step.step}>
              <S.StepHead>
                <S.StepNumber>{String(step.step).padStart(2, '0')}</S.StepNumber>
                <S.StepBadge>STEP</S.StepBadge>
              </S.StepHead>
              <S.StepTitle>{step.title}</S.StepTitle>
              <S.StepDesc>{step.description}</S.StepDesc>
            </S.Card>
          ))}
        </S.Grid>
        <S.CTAGroup ref={ctaRef} data-visible={ctaVisible}>
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

  Card: styled(SpotlightCard)`
    padding: 32px 24px 36px;
    text-align: left;
  `,

  StepHead: styled.div`
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 20px;
  `,

  // 큰 그라데이션 숫자(01, 02 …)
  StepNumber: styled.span`
    font-size: 44px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.04em;
    font-variant-numeric: tabular-nums;
    background: linear-gradient(180deg, #a8d8ff 0%, ${Color.Link} 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  `,

  StepBadge: styled.span`
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: ${Color.TextSecondary};
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
