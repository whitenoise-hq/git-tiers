'use client';

import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

/**
 * 마이페이지·공지사항 배경: 천천히 떠다니는 흐린 빛 덩어리(오로라) + 가장자리로 사라지는 점 격자.
 * 카드들이 반투명 유리(backdrop-filter)라 뒤에서 은은하게 비친다.
 * 움직임 줄이기 설정을 켠 사용자에게는 멈춰 있는 배경만 보여 준다.
 */
export const AuroraBackdrop = () => (
  <S.Layer aria-hidden>
    <S.Blob data-tone="blue" />
    <S.Blob data-tone="violet" />
    <S.Blob data-tone="teal" />
    <S.Grid />
  </S.Layer>
);

// 이동하면서 커졌다 줄었다 한다. 주기가 서로 달라 같은 모양이 반복되지 않는다.
const driftA = keyframes`
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  33%  { transform: translate3d(16vw, 10vh, 0) scale(1.3); }
  66%  { transform: translate3d(6vw, 22vh, 0) scale(0.85); }
  100% { transform: translate3d(-8vw, 12vh, 0) scale(1.15); }
`;

const driftB = keyframes`
  0%   { transform: translate3d(0, 0, 0) scale(1.1); }
  33%  { transform: translate3d(-18vw, 8vh, 0) scale(0.8); }
  66%  { transform: translate3d(-10vw, -12vh, 0) scale(1.25); }
  100% { transform: translate3d(4vw, -6vh, 0) scale(0.95); }
`;

const driftC = keyframes`
  0%   { transform: translate3d(0, 0, 0) scale(0.9); }
  33%  { transform: translate3d(12vw, -14vh, 0) scale(1.2); }
  66%  { transform: translate3d(-14vw, -8vh, 0) scale(0.85); }
  100% { transform: translate3d(-4vw, 4vh, 0) scale(1.1); }
`;

// 숨 쉬듯 밝아졌다 어두워진다(이동과 다른 주기).
const breathe = keyframes`
  from { opacity: var(--opacity-min); }
  to   { opacity: var(--opacity-max); }
`;

const S = {
  Layer: styled.div`
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  `,

  Blob: styled.div`
    --opacity-min: 0.22;
    --opacity-max: 0.4;

    position: absolute;
    width: 46vmax;
    height: 46vmax;
    border-radius: 50%;
    filter: blur(90px);
    opacity: var(--opacity-max);
    will-change: transform, opacity;
    animation:
      ${driftA} 18s ease-in-out infinite alternate,
      ${breathe} 6s ease-in-out infinite alternate;

    &[data-tone='blue'] {
      top: -16vmax;
      left: -10vmax;
      background: radial-gradient(circle, #0071e3 0%, transparent 70%);
    }

    &[data-tone='violet'] {
      top: 10vh;
      right: -18vmax;
      background: radial-gradient(circle, #5e5ce6 0%, transparent 70%);
      animation:
        ${driftB} 22s ease-in-out infinite alternate,
        ${breathe} 8s ease-in-out -3s infinite alternate;
    }

    &[data-tone='teal'] {
      --opacity-min: 0.14;
      --opacity-max: 0.3;

      bottom: -22vmax;
      left: 20vw;
      background: radial-gradient(circle, #30b0c7 0%, transparent 70%);
      animation:
        ${driftC} 26s ease-in-out infinite alternate,
        ${breathe} 7s ease-in-out -5s infinite alternate;
    }

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,

  // 가운데는 보이고 가장자리로 갈수록 사라지는 점 격자
  Grid: styled.div`
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.09) 1px, transparent 1px);
    background-size: 24px 24px;
    mask-image: radial-gradient(ellipse 70% 60% at 50% 35%, #000 30%, transparent 75%);
    -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 35%, #000 30%, transparent 75%);
  `,
};
