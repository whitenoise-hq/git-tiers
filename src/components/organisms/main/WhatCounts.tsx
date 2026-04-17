'use client';

import React from 'react';
import styled from '@emotion/styled';

import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';

const CONTRIBUTION_TYPES = [
  {
    icon: '⟐',
    title: 'Commits',
    description: 'Push code changes to any repository.',
  },
  {
    icon: '⊕',
    title: 'Issues',
    description: 'Report bugs or suggest new features.',
  },
  {
    icon: '⇆',
    title: 'Pull Requests',
    description: 'Propose and merge code improvements.',
  },
  {
    icon: '✓',
    title: 'Code Reviews',
    description: 'Review and approve others\u2019 code.',
  },
  {
    icon: '❖',
    title: 'Wikis',
    description: 'Write documentation and guides.',
  },
] as const;

export const WhatCounts = () => {
  const titleFade = useScrollFadeIn({ delay: 0 });

  return (
    <S.Section>
      <S.Inner>
        <S.Label ref={titleFade.ref} data-visible={titleFade.isVisible}>
          Contributions
        </S.Label>
        <S.Title ref={titleFade.ref} data-visible={titleFade.isVisible}>
          Everything counts.
        </S.Title>
        <S.Subtitle ref={titleFade.ref} data-visible={titleFade.isVisible}>
          Five types of GitHub activity power your tier.
        </S.Subtitle>

        <S.Grid>
          {CONTRIBUTION_TYPES.map((type, index) => (
            <WhatCountsItem key={type.title} item={type} index={index} />
          ))}
        </S.Grid>
      </S.Inner>
    </S.Section>
  );
};

const WhatCountsItem = ({
  item,
  index,
}: {
  readonly item: (typeof CONTRIBUTION_TYPES)[number];
  readonly index: number;
}) => {
  const fade = useScrollFadeIn({ delay: index * 100 });

  return (
    <S.Card ref={fade.ref} data-visible={fade.isVisible}>
      <S.CardIcon>{item.icon}</S.CardIcon>
      <S.CardTitle>{item.title}</S.CardTitle>
      <S.CardDesc>{item.description}</S.CardDesc>
    </S.Card>
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
    background: #101010;
    padding: 280px 24px;
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
    margin-bottom: 8px;
    ${fadeInStyle}
  `,

  Title: styled.h2`
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: #f5f5f7;
    margin-bottom: 12px;
    ${fadeInStyle}

    @media (max-width: 768px) {
      font-size: 32px;
    }
  `,

  Subtitle: styled.p`
    font-size: 19px;
    color: #86868b;
    margin-bottom: 72px;
    ${fadeInStyle}

    @media (max-width: 768px) {
      font-size: 16px;
      margin-bottom: 48px;
    }
  `,

  Grid: styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;

    @media (max-width: 768px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 480px) {
      grid-template-columns: repeat(2, 1fr);
    }
  `,

  Card: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 32px 16px;
    background: #000;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-top: 1px solid rgba(255, 255, 255, 0.18);
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: 20px;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease,
      transform 0.3s ease;
    ${fadeInStyle}

    &:hover {
      border-color: rgba(255, 255, 255, 0.2);
      border-top-color: rgba(255, 255, 255, 0.28);
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
      transform: translateY(-4px);
    }
  `,

  CardIcon: styled.span`
    font-size: 32px;
    color: #0071e3;
    line-height: 1;
  `,

  CardTitle: styled.h3`
    font-size: 17px;
    font-weight: 600;
    color: #f5f5f7;
  `,

  CardDesc: styled.p`
    font-size: 14px;
    font-weight: 400;
    color: #86868b;
    line-height: 1.4;
  `,
};
