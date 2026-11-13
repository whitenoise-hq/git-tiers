import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

type TProps = {
  loading: boolean;
};

/**
 * 화면 가운데의 그라데이션 링 스피너.
 * 배경을 어둡게 덮지 않고(오로라 배경이 그대로 보이게), 링만 은은하게 빛나며 돈다.
 */
export const LoadingSpinner = ({ loading }: TProps) => {
  if (!loading) return null;

  return (
    <S.Wrapper role="status" aria-label="Loading">
      <S.Glow aria-hidden />
      <S.Ring aria-hidden />
    </S.Wrapper>
  );
};

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  from {
    opacity: 0.35;
    transform: scale(0.85);
  }
  to {
    opacity: 0.7;
    transform: scale(1.1);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const RING_SIZE = 44;

const S = {
  Wrapper: styled.div`
    position: fixed;
    inset: 0;
    z-index: 1100;
    display: grid;
    place-items: center;
    pointer-events: none;
    /* 아주 짧은 로딩에서는 깜빡이지 않도록 살짝 늦게 나타난다. */
    animation: ${fadeIn} 0.3s ease 0.15s both;

    > * {
      grid-area: 1 / 1;
    }
  `,

  // 링 뒤에서 숨 쉬듯 퍼지는 빛
  Glow: styled.div`
    width: ${RING_SIZE * 2}px;
    height: ${RING_SIZE * 2}px;
    border-radius: 50%;
    background: radial-gradient(closest-side, rgba(94, 92, 230, 0.45), transparent);
    animation: ${pulse} 1.2s ease-in-out infinite alternate;
  `,

  // 꼬리가 투명해지는 파랑→보라→청록 그라데이션 링
  Ring: styled.div`
    width: ${RING_SIZE}px;
    height: ${RING_SIZE}px;
    border-radius: 50%;
    background: conic-gradient(from 0deg, transparent 0deg, #0071e3 120deg, #5e5ce6 240deg, #30b0c7 360deg);
    mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));
    animation: ${spin} 0.9s linear infinite;

    @media (prefers-reduced-motion: reduce) {
      animation-duration: 2.4s;
    }
  `,
};
