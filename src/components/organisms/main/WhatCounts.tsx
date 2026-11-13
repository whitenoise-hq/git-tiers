'use client';

import React from 'react';
import styled from '@emotion/styled';
import type { SvgIconComponent } from '@mui/icons-material';
import CommitIcon from '@mui/icons-material/Commit';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import CallMergeIcon from '@mui/icons-material/CallMerge';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

import { SpotlightCard } from '@/components/common/SpotlightCard';

import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';
import { useLanguage } from '@/i18n/LanguageContext';
import { fadeInStyle } from '@/styles/animations';
import { Color } from '@/styles/color';

const ICONS: readonly SvgIconComponent[] = [
  CommitIcon,
  BugReportOutlinedIcon,
  CallMergeIcon,
  RateReviewOutlinedIcon,
  MenuBookOutlinedIcon,
];
const KEYS = [
  'commits',
  'issues',
  'pullRequests',
  'codeReviews',
  'wikis',
] as const;

export const WhatCounts = () => {
  const [titleRef, titleVisible] = useScrollFadeIn({ delay: 0 });
  const { t } = useLanguage();

  const contributionTypes = KEYS.map((key, i) => ({
    icon: ICONS[i],
    title: t.whatCounts[key],
    description: t.whatCounts[`${key}Desc` as keyof typeof t.whatCounts],
  }));

  return (
    <S.Section>
      <S.Inner>
        <S.Label ref={titleRef} data-visible={titleVisible}>
          {t.whatCounts.label}
        </S.Label>
        <S.Title ref={titleRef} data-visible={titleVisible}>
          {t.whatCounts.title}
        </S.Title>
        <S.Subtitle ref={titleRef} data-visible={titleVisible}>
          {t.whatCounts.subtitle}
        </S.Subtitle>

        <S.Grid>
          {contributionTypes.map((type, index) => (
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
  readonly item: { icon: SvgIconComponent; title: string; description: string };
  readonly index: number;
}) => {
  const [fadeRef, fadeVisible] = useScrollFadeIn({ delay: index * 100 });
  const Icon = item.icon;

  return (
    <S.Item ref={fadeRef} data-visible={fadeVisible}>
      <S.Card>
        <S.CardIcon>
          <Icon sx={{ fontSize: 24 }} />
        </S.CardIcon>
        <S.CardTitle>{item.title}</S.CardTitle>
        <S.CardDesc>{item.description}</S.CardDesc>
      </S.Card>
    </S.Item>
  );
};

const S = {
  Section: styled.section`
    /* 위아래 섹션과 이어지도록 가운데만 아주 옅게 밝힌다 */
    background:
      radial-gradient(60% 40% at 50% 50%, rgba(0, 113, 227, 0.08), transparent 70%),
      #0a0a0a;
    padding: 280px 24px;
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
    margin-bottom: 8px;
    ${fadeInStyle}
  `,

  Title: styled.h2`
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: ${Color.TextLight};
    margin-bottom: 12px;
    ${fadeInStyle}

    @media (max-width: 768px) {
      font-size: 32px;
    }
  `,

  Subtitle: styled.p`
    font-size: 19px;
    color: ${Color.TextSecondary};
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

  // 스크롤 등장 효과는 바깥(Item), 마우스 빛·호버는 안쪽(Card)에 둬서 transform 이 겹치지 않게 한다.
  Item: styled.div`
    ${fadeInStyle}
  `,

  Card: styled(SpotlightCard)`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    height: 100%;
    padding: 32px 16px;
  `,

  CardIcon: styled.span`
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    margin-bottom: 4px;
    color: #64acff;
    background: linear-gradient(135deg, rgba(0, 113, 227, 0.28), rgba(94, 92, 230, 0.18));
    border: 1px solid rgba(100, 172, 255, 0.25);
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(0, 113, 227, 0.18);
  `,

  CardTitle: styled.h3`
    font-size: 17px;
    font-weight: 600;
    color: ${Color.TextLight};
  `,

  CardDesc: styled.p`
    font-size: 14px;
    font-weight: 400;
    color: ${Color.TextSecondary};
    line-height: 1.4;
  `,
};
