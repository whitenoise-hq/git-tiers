'use client';

import React, { useEffect, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

import { HeroTierCard } from '@/components/organisms/main/HeroTierCard';
import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';

export const HeroCont = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroProgress, setHeroProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const vh = window.innerHeight;
      setHeroProgress(Math.min(1, window.scrollY / (vh * 0.5)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroScale = 1 - heroProgress * 0.15;
  const heroOpacity = Math.max(0, 1 - heroProgress * 1.2);
  const heroBlur = heroProgress * 10;

  const handleGitLogin = async () => {
    await signIn('github', { callbackUrl: '/my' });
  };

  return (
    <S.Hero ref={heroRef}>
      <S.HeroContent
        style={{
          transform: `scale(${heroScale})`,
          opacity: heroOpacity,
          filter: `blur(${heroBlur}px)`,
        }}>
        <S.HeroInner>
          <S.Eyebrow>Git TIERS</S.Eyebrow>
          <S.Title>
            Your GitHub.
            <br />
            <S.TitleAccent>Your Tier.</S.TitleAccent>
          </S.Title>
          <S.Subtitle>
            {t.hero.subtitle1}
            <br />
            {t.hero.subtitle2}
          </S.Subtitle>
          <S.CTAGroup>
            {session ? (
              <S.CTAPrimary onClick={() => router.push('/my')}>
                {t.hero.myPage}
              </S.CTAPrimary>
            ) : (
              <S.CTAPrimary onClick={handleGitLogin}>
                {t.hero.getStarted}
              </S.CTAPrimary>
            )}
            <S.CTASecondary
              href="https://github.com/git-tiers/gittiers?tab=readme-ov-file#git-tiers"
              target="_blank"
              rel="noopener noreferrer">
              {t.hero.learnMore} &rarr;
            </S.CTASecondary>
          </S.CTAGroup>
        </S.HeroInner>
        <HeroTierCard />
      </S.HeroContent>
    </S.Hero>
  );
};

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
`;

const S = {
  Hero: styled.section`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 52px 24px 60px;
    text-align: center;
  `,

  HeroContent: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    will-change: transform, opacity, filter;
  `,

  HeroInner: styled.div`
    position: relative;
    z-index: 2;
    max-width: 720px;
  `,

  Eyebrow: styled.p`
    font-size: 17px;
    font-weight: 600;
    color: ${Color.Link};
    letter-spacing: 0.02em;
    margin-bottom: 16px;
    animation: ${fadeInUp} 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  `,

  Title: styled.h1`
    font-size: 80px;
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.04em;
    color: ${Color.TextLight};
    animation: ${fadeInUp} 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both;

    @media (max-width: 768px) {
      font-size: 48px;
    }
  `,

  TitleAccent: styled.span`
    background: linear-gradient(
      90deg,
      ${Color.Link} 0%,
      #64acff 25%,
      #a8d8ff 50%,
      #64acff 75%,
      ${Color.Link} 100%
    );
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${shimmer} 6s ease-in-out infinite;
  `,

  Subtitle: styled.p`
    margin-top: 20px;
    font-size: 21px;
    font-weight: 400;
    line-height: 1.5;
    color: ${Color.TextSecondary};
    animation: ${fadeInUp} 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.16s both;

    @media (max-width: 768px) {
      font-size: 17px;
    }
  `,

  CTAGroup: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-top: 36px;
    animation: ${fadeInUp} 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.24s both;

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

  CTASecondary: styled.a`
    font-size: 17px;
    font-weight: 600;
    color: ${Color.Link};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      text-decoration: underline;
    }
  `,
};
