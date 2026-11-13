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

  const progress = me.next ? me.next.progress : 1;

  return (
    <S.Card style={style} data-ranked="true">
      <S.Top>
        <S.Label>{t.ranking.myRank}</S.Label>
        <RefreshButton
          availableAt={props.refreshAvailableAt}
          onRefresh={props.onRefresh}
        />
      </S.Top>

      <S.Identity>
        {/* 티어 색으로 은은하게 빛나는 엠블럼 타일 */}
        <S.EmblemTile>
          <Image src={me.tierImage} alt={me.tierName} width={64} height={64} />
        </S.EmblemTile>
        <S.IdentityText>
          {/* 총 인원이 드러나지 않도록 순위 숫자만 보여 준다. */}
          <S.Rank>{formatMessage(t.ranking.rank, { rank: me.rank })}</S.Rank>
          <S.TierChip>{me.tierText}</S.TierChip>
          <S.Login>{loginId}</S.Login>
        </S.IdentityText>
      </S.Identity>

      <S.Progress>
        <S.ProgressHead>
          <span>
            {me.next
              ? formatMessage(t.ranking.nextTier, {
                  tier: me.next.tierText,
                  remaining: me.next.remaining.toLocaleString(),
                })
              : t.ranking.topTier}
          </span>
          <S.Percent>{Math.round(progress * 100)}%</S.Percent>
        </S.ProgressHead>
        <S.Track
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}>
          <S.Fill style={{ width: `${progress * 100}%` }} />
        </S.Track>
      </S.Progress>
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

  Top: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  `,

  Identity: styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 6px;
  `,

  EmblemTile: styled.div`
    flex-shrink: 0;
    display: grid;
    place-items: center;
    width: 88px;
    height: 88px;
    border-radius: 22px;
    background: radial-gradient(
      circle at 50% 40%,
      color-mix(in srgb, var(--accent) 26%, transparent),
      rgba(255, 255, 255, 0.03) 70%
    );
    border: 1px solid
      color-mix(in srgb, var(--accent) 30%, rgba(255, 255, 255, 0.06));
    box-shadow: 0 10px 30px color-mix(in srgb, var(--accent) 20%, transparent);

    img {
      display: block;
      object-fit: contain;
      filter: drop-shadow(
        0 6px 14px color-mix(in srgb, var(--accent) 45%, transparent)
      );
    }
  `,

  IdentityText: styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    min-width: 0;
  `,

  Rank: styled.strong`
    font-size: 40px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.04em;
    font-variant-numeric: tabular-nums;
    color: ${Color.TextLight};
  `,

  TierChip: styled.span`
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 700;
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    border-radius: 980px;
  `,

  Login: styled.span`
    max-width: 100%;
    font-size: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace !important;
    color: ${Color.TextSecondary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,

  Progress: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  `,

  ProgressHead: styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    color: ${Color.Gray100};
  `,

  Percent: styled.span`
    font-size: 12px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--accent);
  `,

  Track: styled.div`
    height: 6px;
    border-radius: 980px;
    background: rgba(255, 255, 255, 0.08);
    overflow: hidden;
  `,

  Fill: styled.div`
    height: 100%;
    border-radius: 980px;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--accent) 45%, transparent),
      var(--accent)
    );
    transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  `,
};
