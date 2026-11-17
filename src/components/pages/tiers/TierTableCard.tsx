'use client';

import React from 'react';
import Image from 'next/image';
import styled from '@emotion/styled';

import { SpotlightCard } from '@/components/common/SpotlightCard';
import { TIER_ACCENTS } from '@/constants/tierAccents';
import { Color } from '@/styles/color';
import { formatTierRange, type TierTableGroup } from '@/utils/tierTable';

interface TierTableCardProps {
  readonly group: TierTableGroup;
  /** 로그인한 사람의 현재 단계(예: "Master 2") */
  readonly myLabel?: string;
  readonly myText: string;
}

/** 티어 하나의 4단계 기준을 보여 주는 카드 */
export const TierTableCard = ({
  group,
  myLabel,
  myText,
}: TierTableCardProps) => {
  const style = { '--accent': TIER_ACCENTS[group.name] } as React.CSSProperties;
  const lowest = group.rows[group.rows.length - 1];
  const highest = group.rows[0];
  const isMine = group.rows.some((row) => row.label === myLabel);

  return (
    <S.Card style={style} data-mine={isMine}>
      <S.Head>
        <S.Emblem>
          <Image src={group.image} alt={group.name} width={56} height={56} />
        </S.Emblem>
        <S.Title>
          <S.Name>{group.name}</S.Name>
          <S.Range>
            {formatTierRange({ min: lowest.min, max: highest.max })}
          </S.Range>
        </S.Title>
      </S.Head>

      <S.Rows>
        {group.rows.map((row) => (
          <S.Row key={row.label} data-mine={row.label === myLabel}>
            <span>
              {row.label}
              {row.label === myLabel && <S.MineBadge>{myText}</S.MineBadge>}
            </span>
            <S.Count>{formatTierRange(row)}</S.Count>
          </S.Row>
        ))}
      </S.Rows>
    </S.Card>
  );
};

const S = {
  Card: styled(SpotlightCard)`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    border-radius: 22px;
    background: radial-gradient(
        90% 60% at 100% 0%,
        color-mix(in srgb, var(--accent) 14%, transparent),
        transparent 70%
      ),
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.05),
        rgba(255, 255, 255, 0.015)
      );

    &[data-mine='true'] {
      border-color: color-mix(in srgb, var(--accent) 55%, transparent);
      box-shadow: 0 0 40px color-mix(in srgb, var(--accent) 18%, transparent);
    }
  `,

  Head: styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
  `,

  Emblem: styled.div`
    flex-shrink: 0;
    filter: drop-shadow(
      0 8px 18px color-mix(in srgb, var(--accent) 40%, transparent)
    );

    img {
      display: block;
      object-fit: contain;
    }
  `,

  Title: styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  `,

  Name: styled.strong`
    font-size: 19px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--accent);
  `,

  Range: styled.span`
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: ${Color.TextSecondary};
  `,

  Rows: styled.ul`
    display: flex;
    flex-direction: column;
    gap: 2px;
    list-style: none;
  `,

  Row: styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 10px;
    font-size: 13px;
    color: ${Color.Gray100};
    border-radius: 10px;

    &:nth-of-type(odd) {
      background: rgba(255, 255, 255, 0.025);
    }

    &[data-mine='true'] {
      color: ${Color.TextLight};
      font-weight: 600;
      background: color-mix(in srgb, var(--accent) 16%, transparent);
    }
  `,

  Count: styled.span`
    font-variant-numeric: tabular-nums;
    color: ${Color.TextSecondary};

    [data-mine='true'] > & {
      color: var(--accent);
    }
  `,

  MineBadge: styled.span`
    margin-left: 8px;
    padding: 1px 7px;
    font-size: 10px;
    font-weight: 700;
    color: ${Color.Black};
    background: var(--accent);
    border-radius: 980px;
  `,
};
