'use client';

import React from 'react';
import Image from 'next/image';
import styled from '@emotion/styled';
import { signIn } from 'next-auth/react';

import { TIER_ACCENTS } from '@/constants/tierAccents';
import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';
import { formatMessage } from '@/utils/formatMessage';
import type { MyRank } from '@/utils/ranking';

type MyRankCardProps =
  | { readonly status: 'guest' }
  | { readonly status: 'unranked' }
  | {
      readonly status: 'ranked';
      readonly me: MyRank;
      readonly loginId: string;
    };

/** 로그인한 본인의 순위. 로그인하지 않았으면 로그인 안내를 보여 준다. */
export const MyRankCard = (props: MyRankCardProps) => {
  const { t } = useLanguage();

  if (props.status === 'guest') {
    return (
      <S.Card data-variant="guest">
        <S.Message>{t.ranking.loginPrompt}</S.Message>
        <S.LoginButton
          type="button"
          onClick={() => signIn('github', { callbackUrl: '/ranking' })}>
          {t.ranking.login}
        </S.LoginButton>
      </S.Card>
    );
  }

  if (props.status === 'unranked') {
    return (
      <S.Card data-variant="guest">
        <S.Message>{t.ranking.notRanked}</S.Message>
      </S.Card>
    );
  }

  const { me, loginId } = props;
  const percent = Math.max(1, Math.ceil((me.rank / me.total) * 100));
  const style = {
    '--accent': TIER_ACCENTS[me.tierName],
  } as React.CSSProperties;

  return (
    <S.Card style={style}>
      <S.Emblem>
        <Image src={me.tierImage} alt={me.tierName} width={64} height={64} />
      </S.Emblem>
      <S.Body>
        <S.Label>
          {t.ranking.myRank} · {loginId}
        </S.Label>
        <S.RankLine>
          <S.Rank>
            {formatMessage(t.ranking.rankOf, {
              rank: me.rank,
              total: me.total,
            })}
          </S.Rank>
          <S.Percent>
            {formatMessage(t.ranking.topPercent, { percent })}
          </S.Percent>
        </S.RankLine>
        <S.Meta>
          {me.tierText} ·{' '}
          {me.next
            ? formatMessage(t.ranking.nextTier, {
                tier: me.next.tierText,
                remaining: me.next.remaining.toLocaleString(),
              })
            : t.ranking.topTier}
        </S.Meta>
      </S.Body>
    </S.Card>
  );
};

const S = {
  Card: styled.section`
    --accent: rgba(255, 255, 255, 0.3);

    display: flex;
    align-items: center;
    gap: 18px;
    padding: 20px 22px;
    border-radius: 20px;
    border: 1px solid
      color-mix(in srgb, var(--accent) 40%, rgba(255, 255, 255, 0.06));
    background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--accent) 14%, transparent),
        transparent 60%
      ),
      rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);

    &[data-variant='guest'] {
      justify-content: space-between;
      flex-wrap: wrap;
    }
  `,

  Emblem: styled.div`
    flex-shrink: 0;
    filter: drop-shadow(
      0 8px 20px color-mix(in srgb, var(--accent) 40%, transparent)
    );

    img {
      display: block;
      object-fit: contain;
    }
  `,

  Body: styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  `,

  Label: styled.span`
    font-size: 12px;
    font-weight: 600;
    color: ${Color.TextSecondary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,

  RankLine: styled.div`
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 10px;
  `,

  Rank: styled.strong`
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: ${Color.TextLight};
  `,

  Percent: styled.span`
    font-size: 13px;
    font-weight: 600;
    color: var(--accent);
  `,

  Meta: styled.span`
    font-size: 13px;
    color: ${Color.Gray100};
  `,

  Message: styled.p`
    font-size: 15px;
    color: ${Color.Gray100};
  `,

  LoginButton: styled.button`
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: ${Color.Link};
    border: none;
    border-radius: 980px;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: ${Color.LinkHover};
    }
  `,
};
