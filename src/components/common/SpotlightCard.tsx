'use client';

import React, { useRef } from 'react';
import styled from '@emotion/styled';

type SpotlightCardProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * 마우스 위치를 따라 은은한 빛이 비치는 유리 카드.
 * 빛의 위치는 CSS 변수(--mx, --my)로만 바꿔서 다시 렌더링하지 않는다.
 */
export const SpotlightCard = ({ children, onPointerMove, ...rest }: SpotlightCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      el.style.setProperty('--my', `${event.clientY - rect.top}px`);
    }
    onPointerMove?.(event);
  };

  return (
    <S.Card ref={ref} onPointerMove={handlePointerMove} {...rest}>
      {children}
    </S.Card>
  );
};

const S = {
  Card: styled.div`
    position: relative;
    isolation: isolate;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    transition:
      border-color 0.3s ease,
      transform 0.3s ease;

    /* 마우스를 따라다니는 빛 */
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      background: radial-gradient(
        320px circle at var(--mx, 50%) var(--my, 0%),
        rgba(100, 172, 255, 0.14),
        transparent 60%
      );
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      border-color: rgba(255, 255, 255, 0.16);
      transform: translateY(-4px);
    }

    &:hover::before {
      opacity: 1;
    }

    @media (prefers-reduced-motion: reduce) {
      &:hover {
        transform: none;
      }
    }
  `,
};
