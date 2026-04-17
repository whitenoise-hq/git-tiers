'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styled from '@emotion/styled';

import { TIERS } from '@/constants/tiers';
import { useLanguage } from '@/i18n/LanguageContext';

export const TierProgression = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [rawProgress, setRawProgress] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const ratio = Math.max(0, Math.min(1, scrolled / scrollableDistance));
      setRawProgress(ratio);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth interpolation with requestAnimationFrame
  useEffect(() => {
    let frameId: number;
    const lerp = () => {
      setDisplayProgress((prev) => {
        const diff = rawProgress - prev;
        // ease toward target — fast at first, slow near end
        if (Math.abs(diff) < 0.001) return rawProgress;
        return prev + diff * 0.08;
      });
      frameId = requestAnimationFrame(lerp);
    };
    frameId = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(frameId);
  }, [rawProgress]);

  const activeTierIndex = Math.min(
    Math.floor(displayProgress * TIERS.length),
    TIERS.length - 1,
  );
  const activeTier = TIERS[activeTierIndex];
  const displayCount = Math.round(displayProgress * 6300);

  return (
    <S.Section ref={sectionRef}>
      <S.Sticky>
        <S.Label>{t.tierProgression.label}</S.Label>
        <S.Title>{t.tierProgression.title}</S.Title>

        <S.Showcase>
          <S.TierIcon key={activeTier.name}>
            <Image src={activeTier.src} alt={activeTier.name} width={120} height={120} />
          </S.TierIcon>
          <S.TierInfo>
            <S.TierLabel>{activeTier.name}</S.TierLabel>
            <S.Counter>{displayCount.toLocaleString()}</S.Counter>
            <S.CounterSub>{t.tierProgression.contributions}</S.CounterSub>
          </S.TierInfo>
        </S.Showcase>

        <S.ProgressTrack>
          <S.ProgressBar style={{ width: `${displayProgress * 100}%` }} />
          <S.Dots>
            {TIERS.map((tier, i) => (
              <S.Dot
                key={tier.name}
                data-active={i <= activeTierIndex}
                style={{ left: `${(i / (TIERS.length - 1)) * 100}%` }}
              />
            ))}
          </S.Dots>
        </S.ProgressTrack>

        <S.MilestoneLabels>
          <span>Iron</span>
          <span>Challenger</span>
        </S.MilestoneLabels>
      </S.Sticky>
    </S.Section>
  );
};

const S = {
  Section: styled.section`
    position: relative;
    height: 400vh;
    background: #000;
  `,

  Sticky: styled.div`
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 52px 24px;
    text-align: center;
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
    margin-bottom: 56px;

    @media (max-width: 768px) {
      font-size: 32px;
      margin-bottom: 40px;
    }
  `,

  Showcase: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    margin-bottom: 56px;
  `,

  TierIcon: styled.div`
    filter: drop-shadow(0 0 60px rgba(0, 113, 227, 0.25));
    transition: filter 0.4s ease;

    img {
      display: block;
      object-fit: contain;
    }

    @media (max-width: 768px) {
      img {
        width: 88px !important;
        height: 88px !important;
      }
    }
  `,

  TierInfo: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  `,

  TierLabel: styled.span`
    font-size: 20px;
    font-weight: 600;
    color: #0071e3;
    transition: color 0.3s ease;
  `,

  Counter: styled.span`
    font-size: 64px;
    font-weight: 700;
    letter-spacing: -0.04em;
    color: #f5f5f7;
    font-variant-numeric: tabular-nums;

    @media (max-width: 768px) {
      font-size: 44px;
    }
  `,

  CounterSub: styled.span`
    font-size: 17px;
    font-weight: 400;
    color: #86868b;
  `,

  ProgressTrack: styled.div`
    position: relative;
    width: 100%;
    max-width: 600px;
    height: 3px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
  `,

  ProgressBar: styled.div`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(90deg, #48484a, #0071e3);
    border-radius: 2px;
    will-change: width;
  `,

  Dots: styled.div`
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
  `,

  Dot: styled.div`
    position: absolute;
    top: 50%;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: background 0.3s ease, box-shadow 0.3s ease;
    background: rgba(255, 255, 255, 0.15);

    &[data-active='true'] {
      background: #0071e3;
      box-shadow: 0 0 8px rgba(0, 113, 227, 0.5);
    }
  `,

  MilestoneLabels: styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 600px;
    margin-top: 12px;
    font-size: 13px;
    font-weight: 500;
    color: #48484a;
  `,
};