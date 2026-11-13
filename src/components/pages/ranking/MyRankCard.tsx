'use client';

import React from 'react';
import Image from 'next/image';
import styled from '@emotion/styled';
import { signIn } from 'next-auth/react';
import GitHubIcon from '@mui/icons-material/GitHub';

import { SpotlightCard } from '@/components/common/SpotlightCard';
import { TIER_ACCENTS } from '@/constants/tierAccents';
import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';
import { formatMessage } from '@/utils/formatMessage';
import type { MyRank } from '@/utils/ranking';
import { RefreshButton } from './RefreshButton';
import type { RefreshResult } from './useRankingData';

interface RefreshProps {
  readonly refreshAvailableAt: number;
  readonly onRefresh: () => Promise<RefreshResult>;
}

type MyRankCardProps =
  | { readonly status: 'guest' }
  | ({ readonly status: 'unranked' } & RefreshProps)
  | ({
      readonly status: 'ranked';
      readonly me: MyRank;
      readonly loginId: string;
    } & RefreshProps);

/** 벤토 칸 하나: 내 순위. 로그인하지 않았으면 로그인 안내를 보여 준다. */
export const MyRankCard = (props: MyRankCardProps) => {
  const { t } = useLanguage();

  if (props.status === 'guest') {
    return (
      <S.Card>
        <S.Label>{t.ranking.myRank}</S.Label>
        <S.Message>{t.ranking.loginPrompt}</S.Message>
        <S.Footer>
          <S.LoginButton
            type="button"
            onClick={() => signIn('github', { callbackUrl: '/ranking' })}>
            <GitHubIcon sx={{ fontSize: 16 }} aria-hidden />
            {t.ranking.login}
          </S.LoginButton>
        </S.Footer>
      </S.Card>
    );
  }

  if (props.status === 'unranked') {
    return (
      <S.Card>
        <S.Label>{t.ranking.myRank}</S.Label>
        <S.Message>{t.ranking.notRanked}</S.Message>
        <S.Footer>
          <RefreshButton
            availableAt={props.refreshAvailableAt}
            onRefresh={props.onRefresh}
          />
        </S.Footer>
      </S.Card>
    );
  }

  const { me, loginId } = props;
  const style = {
    '--accent': TIER_ACCENTS[me.tierName],
  } as React.CSSProperties;

  return (
    <S.Card style={style} data-ranked="true">
      <S.Top>
        <S.Label>
          {t.ranking.myRank} · {loginId}
        </S.Label>
        <S.Emblem>
          <Image src={me.tierImage} alt={me.tierName} width={48} height={48} />
        </S.Emblem>
      </S.Top>

      {/* 총 인원이 드러나지 않도록 순위 숫자만 보여 준다. */}
      <S.Rank>{formatMessage(t.ranking.rank, { rank: me.rank })}</S.Rank>
      <S.Meta>
        <strong>{me.tierText}</strong>
        <span>
          {me.next
            ? formatMessage(t.ranking.nextTier, {
                tier: me.next.tierText,
                remaining: me.next.remaining.toLocaleString(),
              })
            : t.ranking.topTier}
        </span>
      </S.Meta>

      <S.Footer>
        <RefreshButton
          availableAt={props.refreshAvailableAt}
          onRefresh={props.onRefresh}
        />
      </S.Footer>
    </S.Card>
  );
};

const S = {
  Card: styled(SpotlightCard)`
    --accent: rgba(255, 255, 255, 0.4);

    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 100%;
    min-height: 220px;
    padding: 22px 24px;
    border-radius: 24px;

    &[data-ranked='true'] {
      background: radial-gradient(
          80% 70% at 100% 0%,
          color-mix(in srgb, var(--accent) 16%, transparent),
          transparent 70%
        ),
        linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.05),
          rgba(255, 255, 255, 0.015)
        );
    }
  `,

  Top: styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  `,

  Label: styled.span`
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${Color.TextSecondary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

  Rank: styled.strong`
    font-size: 56px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.05em;
    font-variant-numeric: tabular-nums;
    background: linear-gradient(180deg, ${Color.TextLight} 30%, var(--accent));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  `,

  Meta: styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 13px;
    color: ${Color.Gray100};

    strong {
      font-size: 15px;
      font-weight: 700;
      color: ${Color.TextLight};
    }
  `,

  Message: styled.p`
    font-size: 15px;
    line-height: 1.5;
    color: ${Color.Gray100};
  `,

  // 버튼은 칸 맨 아래에 붙인다.
  Footer: styled.div`
    margin-top: auto;
    padding-top: 6px;
  `,

  LoginButton: styled.button`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 38px;
    padding: 0 18px;
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
