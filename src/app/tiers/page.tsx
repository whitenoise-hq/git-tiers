'use client';

import React, { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

import { AuroraBackdrop } from '@/components/common/AuroraBackdrop';
import { PageContainer } from '@/components/common/PageContainer';
import { TierTableCard } from '@/components/pages/tiers/TierTableCard';
import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';
import { getTierText } from '@/utils/getTier';
import { buildTierTable } from '@/utils/tierTable';

const TIER_TABLE = buildTierTable();

/** 로그인했으면 내 현재 단계(예: "Master 2")를 불러와 표에서 강조한다. */
const useMyTierLabel = (): string | undefined => {
  const { status } = useSession();
  const [label, setLabel] = useState<string>();

  useEffect(() => {
    if (status !== 'authenticated') return undefined;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/github/contributions');
        if (!res.ok) return;
        const data: { contributions: number } = await res.json();
        if (!cancelled) setLabel(getTierText(data.contributions));
      } catch {
        // 내 티어 강조는 부가 기능이라 실패해도 표는 그대로 보여 준다.
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [status]);

  return label;
};

/** 9개 티어 × 4단계 기준표. 로그인 없이 볼 수 있다. */
export default function TiersPage() {
  const { t } = useLanguage();
  const { status } = useSession();
  const myLabel = useMyTierLabel();

  return (
    <>
      <AuroraBackdrop />
      <S.Wrapper>
        <S.PageLabel>{t.tiersPage.label}</S.PageLabel>
        <S.PageTitle>{t.tiersPage.title}</S.PageTitle>
        <S.Subtitle>{t.tiersPage.subtitle}</S.Subtitle>

        <S.Grid>
          {TIER_TABLE.map((group) => (
            <TierTableCard
              key={group.name}
              group={group}
              myLabel={myLabel}
              myText={t.tiersPage.mine}
            />
          ))}
        </S.Grid>

        <S.Footer>
          <S.Note>{t.tiersPage.note}</S.Note>
          {status === 'unauthenticated' && (
            <S.Cta
              type="button"
              onClick={() => signIn('github', { callbackUrl: '/my' })}>
              {t.tiersPage.cta}
            </S.Cta>
          )}
        </S.Footer>
      </S.Wrapper>
    </>
  );
}

const riseIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const S = {
  Wrapper: PageContainer,

  PageLabel: styled.p`
    font-size: 14px;
    font-weight: 600;
    color: ${Color.Gray300};
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
  `,

  PageTitle: styled.h2`
    font-size: 36px;
    font-weight: 700;
    color: ${Color.TextLight};
    letter-spacing: -0.03em;

    @media (max-width: 768px) {
      font-size: 28px;
    }
  `,

  Subtitle: styled.p`
    margin: 8px 0 36px;
    font-size: 15px;
    color: ${Color.TextSecondary};
  `,

  Grid: styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 900px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 560px) {
      grid-template-columns: minmax(0, 1fr);
    }

    > * {
      animation: ${riseIn} 0.5s cubic-bezier(0.22, 1, 0.36, 1) backwards;
    }

    ${Array.from(
      { length: 9 },
      (_, i) => `> *:nth-of-type(${i + 1}) { animation-delay: ${i * 0.04}s; }`
    ).join('\n')}

    @media (prefers-reduced-motion: reduce) {
      > * {
        animation: none;
      }
    }
  `,

  Footer: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-top: 28px;
    text-align: center;
  `,

  Note: styled.p`
    font-size: 12px;
    color: ${Color.TextSecondary};
  `,

  Cta: styled.button`
    height: 44px;
    padding: 0 28px;
    font-size: 15px;
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
