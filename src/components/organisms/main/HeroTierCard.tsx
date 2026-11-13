'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

import { TIERS } from '@/constants/tiers';
import { TIER_ACCENTS } from '@/constants/tierAccents';
import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';

/** 다음 티어로 넘어가는 간격 */
const CYCLE_MS = 2400;
/** 사용자가 단계를 직접 고르면 이 시간 동안 자동 넘김을 멈춘다. */
const RESUME_AFTER_MS = 6000;
/** 마우스를 따라 기울어지는 최대 각도 */
const MAX_TILT_DEG = 10;

/**
 * 랜딩 첫 화면의 티어 카드.
 * Iron 부터 Challenger 까지 자동으로 넘어가며, 티어 색으로 빛나는 유리 카드가 마우스를 따라 기울어진다.
 */
export const HeroTierCard = () => {
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) {
      const resume = setTimeout(() => setPaused(false), RESUME_AFTER_MS);
      return () => clearTimeout(resume);
    }
    const timer = setInterval(
      () => setIndex((prev) => (prev + 1) % TIERS.length),
      CYCLE_MS
    );
    return () => clearInterval(timer);
  }, [paused]);

  const handleSelect = (next: number) => {
    setIndex(next);
    setPaused(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || event.pointerType !== 'mouse') return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty('--tilt-x', `${(-y * MAX_TILT_DEG).toFixed(2)}deg`);
    card.style.setProperty('--tilt-y', `${(x * MAX_TILT_DEG).toFixed(2)}deg`);
    card.style.setProperty('--shine-x', `${((x + 0.5) * 100).toFixed(1)}%`);
    card.style.setProperty('--shine-y', `${((y + 0.5) * 100).toFixed(1)}%`);
  };

  const handlePointerLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    ['--tilt-x', '--tilt-y', '--shine-x', '--shine-y'].forEach((name) =>
      card.style.removeProperty(name)
    );
  };

  const tier = TIERS[index];
  const accentStyle = {
    '--accent': TIER_ACCENTS[tier.name],
  } as React.CSSProperties;

  return (
    <S.Stage style={accentStyle}>
      <S.Glow aria-hidden />

      {/* 떠다니는 움직임(Float)과 마우스 기울기(Card)는 transform 이 겹치지 않게 다른 요소에 둔다. */}
      <S.Float>
        <S.Card
          ref={cardRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}>
          <S.Beam aria-hidden />
          <S.Shine aria-hidden />
          <S.CardInner>
            <S.Label>Your Tier</S.Label>

            <S.Emblems>
              {TIERS.map((item, i) => (
                <S.Emblem
                  key={item.name}
                  data-active={i === index}
                  aria-hidden={i !== index}>
                  <Image
                    src={item.src}
                    alt={item.name}
                    width={108}
                    height={108}
                    priority={i === 0}
                  />
                </S.Emblem>
              ))}
            </S.Emblems>

            <S.TierName key={tier.name} aria-live="polite">
              {tier.name}
            </S.TierName>
            <S.Range>
              {tier.min.toLocaleString()}+ {t.tierProgression.contributions}
            </S.Range>
          </S.CardInner>
        </S.Card>
      </S.Float>

      <S.Steps role="tablist" aria-label="Tiers">
        {TIERS.map((item, i) => (
          <S.Step
            key={item.name}
            type="button"
            role="tab"
            aria-label={item.name}
            aria-selected={i === index}
            data-active={i === index}
            data-passed={i < index}
            onClick={() => handleSelect(i)}
          />
        ))}
      </S.Steps>
    </S.Stage>
  );
};

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const float = keyframes`
  from { transform: translateY(-6px); }
  to   { transform: translateY(6px); }
`;

const nameIn = keyframes`
  from { opacity: 0; transform: translateY(8px); filter: blur(4px); }
  to   { opacity: 1; transform: translateY(0); filter: blur(0); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const CARD_RADIUS = 28;
const BORDER = 1.5;

const S = {
  Stage: styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 22px;
    margin-top: 64px;
    perspective: 900px;
    animation: ${fadeInUp} 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.32s both;

    @media (max-width: 768px) {
      margin-top: 48px;
    }
  `,

  // 카드 뒤에서 티어 색으로 퍼지는 빛(색은 부드럽게 바뀐다)
  Glow: styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 440px;
    height: 440px;
    transform: translate(-50%, -55%);
    border-radius: 50%;
    background-color: var(--accent);
    opacity: 0.22;
    mask-image: radial-gradient(closest-side, #000, transparent);
    -webkit-mask-image: radial-gradient(closest-side, #000, transparent);
    transition: background-color 0.8s ease;
    pointer-events: none;

    @media (max-width: 768px) {
      width: 320px;
      height: 320px;
    }
  `,

  Card: styled.div`
    --tilt-x: 0deg;
    --tilt-y: 0deg;

    position: relative;
    width: 236px;
    padding: ${BORDER}px;
    border-radius: ${CARD_RADIUS}px;
    overflow: hidden;
    /* 테두리 색: 티어 색을 옅게 섞는다 */
    background-color: color-mix(
      in srgb,
      var(--accent) 30%,
      rgba(255, 255, 255, 0.08)
    );
    box-shadow:
      0 30px 80px rgba(0, 0, 0, 0.55),
      0 0 60px color-mix(in srgb, var(--accent) 25%, transparent);
    transform: rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
    transition:
      transform 0.25s ease-out,
      background-color 0.8s ease,
      box-shadow 0.8s ease;

    @media (max-width: 768px) {
      width: 204px;
    }

    @media (prefers-reduced-motion: reduce) {
      transform: none;
    }
  `,

  Float: styled.div`
    animation: ${float} 4s ease-in-out infinite alternate;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,

  // 테두리를 따라 도는 빛줄기
  Beam: styled.div`
    position: absolute;
    inset: -60%;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      transparent 250deg,
      rgba(255, 255, 255, 0.95) 320deg,
      transparent 360deg
    );
    animation: ${spin} 4.5s linear infinite;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,

  // 마우스 위치를 따라 움직이는 반사광
  Shine: styled.div`
    position: absolute;
    inset: 0;
    z-index: 2;
    border-radius: ${CARD_RADIUS}px;
    background: radial-gradient(
      circle at var(--shine-x, 50%) var(--shine-y, 0%),
      rgba(255, 255, 255, 0.14),
      transparent 55%
    );
    pointer-events: none;
  `,

  CardInner: styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 22px 20px 24px;
    border-radius: ${CARD_RADIUS - BORDER}px;
    background: radial-gradient(
        120% 70% at 50% 0%,
        color-mix(in srgb, var(--accent) 18%, transparent),
        transparent 70%
      ),
      rgba(16, 16, 18, 0.94);
    transition: background 0.8s ease;
  `,

  Label: styled.span`
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${Color.TextSecondary};
  `,

  Emblems: styled.div`
    display: grid;
    margin: 14px 0 10px;

    > * {
      grid-area: 1 / 1;
    }
  `,

  Emblem: styled.div`
    display: flex;
    justify-content: center;
    opacity: 0;
    transform: scale(0.8) rotate(-8deg);
    filter: drop-shadow(
      0 12px 28px color-mix(in srgb, var(--accent) 45%, transparent)
    );
    transition:
      opacity 0.5s ease,
      transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);

    &[data-active='true'] {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }

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

  TierName: styled.strong`
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: ${Color.TextLight};
    animation: ${nameIn} 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  `,

  Range: styled.span`
    margin-top: 4px;
    font-size: 13px;
    color: ${Color.TextSecondary};
  `,

  Steps: styled.div`
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
  `,

  Step: styled.button`
    width: 8px;
    height: 8px;
    padding: 0;
    border: none;
    border-radius: 980px;
    background: rgba(255, 255, 255, 0.18);
    cursor: pointer;
    transition:
      width 0.4s cubic-bezier(0.22, 1, 0.36, 1),
      background-color 0.4s ease;

    &[data-passed='true'] {
      background: rgba(255, 255, 255, 0.4);
    }

    &[data-active='true'] {
      width: 28px;
      background: var(--accent);
    }

    &:hover:not([data-active='true']) {
      background: rgba(255, 255, 255, 0.6);
    }
  `,
};
