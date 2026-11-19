'use client';

import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';

import type { AdminStatsResponse } from '@/app/api/admin/stats/route';
import { AuroraBackdrop } from '@/components/common/AuroraBackdrop';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageContainer } from '@/components/common/PageContainer';
import { Color } from '@/styles/color';

type State =
  | { readonly status: 'loading' }
  | { readonly status: 'denied' }
  | { readonly status: 'error' }
  | { readonly status: 'ready'; readonly data: AdminStatsResponse };

const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);
const shortDate = (date: string) => date.slice(5).replace('-', '/');

/** 관리자 통계 — 배지 유입 · 가입 · 매일 갱신 결과. 관리자 GitHub ID 로만 열린다(프록시·API 이중 확인). */
export default function AdminStatsPage() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (cancelled) return;
        if (res.status === 404) {
          setState({ status: 'denied' });
          return;
        }
        if (!res.ok) throw new Error(`stats ${res.status}`);
        const data = (await res.json()) as AdminStatsResponse;
        if (!cancelled) setState({ status: 'ready', data });
      } catch {
        if (!cancelled) setState({ status: 'error' });
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <AuroraBackdrop />
      <S.Wrapper>
        <S.PageLabel>Admin</S.PageLabel>
        <S.PageTitle>통계</S.PageTitle>

        {state.status === 'denied' && (
          <S.Message>페이지를 찾을 수 없습니다.</S.Message>
        )}
        {state.status === 'error' && (
          <S.Message>통계를 불러오지 못했습니다.</S.Message>
        )}
        {state.status === 'ready' && <StatsView data={state.data} />}
      </S.Wrapper>
      <LoadingSpinner loading={state.status === 'loading'} />
    </>
  );
}

const StatsView = ({ data }: { data: AdminStatsResponse }) => {
  const visits = data.daily.map((d) => d.badgeVisits);
  const signups = data.daily.map((d) => d.signups);
  const max = Math.max(1, ...visits, ...signups);
  const last7 = data.daily.slice(-7);

  return (
    <S.Content>
      <S.Cards>
        <Card label="전체 사용자" value={data.totals.users} />
        <Card label="랭킹 대상" value={data.totals.ranked} />
        <Card
          label="배지 유입 (7일)"
          value={sum(last7.map((d) => d.badgeVisits))}
        />
        <Card label="새 가입 (7일)" value={sum(last7.map((d) => d.signups))} />
      </S.Cards>

      <S.Panel>
        <S.PanelHead>
          <h3>최근 30일</h3>
          <S.Legend>
            <span data-kind="visit">배지 유입 {sum(visits)}</span>
            <span data-kind="signup">새 가입 {sum(signups)}</span>
          </S.Legend>
        </S.PanelHead>
        <S.Chart>
          {data.daily.map((d) => (
            <S.Day
              key={d.date}
              title={`${d.date} · 유입 ${d.badgeVisits} · 가입 ${d.signups}`}>
              <S.Bars>
                <S.Bar
                  data-kind="visit"
                  style={{ height: `${(d.badgeVisits / max) * 100}%` }}
                />
                <S.Bar
                  data-kind="signup"
                  style={{ height: `${(d.signups / max) * 100}%` }}
                />
              </S.Bars>
              <S.DayLabel>{shortDate(d.date)}</S.DayLabel>
            </S.Day>
          ))}
        </S.Chart>
      </S.Panel>

      <S.Panel>
        <S.PanelHead>
          <h3>매일 기여 수 갱신</h3>
        </S.PanelHead>
        {data.lastRefresh ? (
          <S.Refresh data-failed={data.lastRefresh.failed > 0}>
            <span>
              {new Date(data.lastRefresh.ranAt).toLocaleString('ko-KR')}
            </span>
            <span>갱신 {data.lastRefresh.updated}명</span>
            <span>실패 {data.lastRefresh.failed}명</span>
            <span>건너뜀 {data.lastRefresh.skipped}명</span>
          </S.Refresh>
        ) : (
          <S.Message>아직 기록이 없습니다. 다음 갱신부터 표시됩니다.</S.Message>
        )}
      </S.Panel>
    </S.Content>
  );
};

const Card = ({ label, value }: { label: string; value: number }) => (
  <S.Card>
    <span>{label}</span>
    <strong>{value.toLocaleString()}</strong>
  </S.Card>
);

const VISIT = '#64acff';
const SIGNUP = '#30d158';

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
    margin-bottom: 28px;
  `,

  Content: styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,

  Cards: styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 640px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  `,

  Card: styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 18px 20px;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);

    span {
      font-size: 12px;
      color: ${Color.TextSecondary};
    }

    strong {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.03em;
      font-variant-numeric: tabular-nums;
      color: ${Color.TextLight};
    }
  `,

  Panel: styled.section`
    padding: 20px 22px;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
  `,

  PanelHead: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;

    h3 {
      font-size: 14px;
      font-weight: 600;
      color: ${Color.TextLight};
    }
  `,

  Legend: styled.div`
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: ${Color.Gray100};

    span::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 8px;
      margin-right: 5px;
      border-radius: 2px;
    }

    [data-kind='visit']::before {
      background: ${VISIT};
    }

    [data-kind='signup']::before {
      background: ${SIGNUP};
    }
  `,

  Chart: styled.div`
    display: grid;
    grid-template-columns: repeat(30, minmax(0, 1fr));
    gap: 3px;
    align-items: end;
  `,

  Day: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 0;
  `,

  Bars: styled.div`
    display: flex;
    align-items: flex-end;
    gap: 1px;
    width: 100%;
    height: 120px;
  `,

  Bar: styled.div`
    flex: 1;
    min-height: 1px;
    border-radius: 2px 2px 0 0;

    &[data-kind='visit'] {
      background: ${VISIT};
    }

    &[data-kind='signup'] {
      background: ${SIGNUP};
    }
  `,

  DayLabel: styled.span`
    font-size: 9px;
    color: ${Color.TextSecondary};
    white-space: nowrap;

    div:not(:nth-of-type(5n + 1)) > & {
      visibility: hidden;
    }
  `,

  Refresh: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px 18px;
    font-size: 14px;
    color: ${Color.Gray100};

    &[data-failed='true'] span:nth-of-type(3) {
      color: ${Color.Red100};
      font-weight: 700;
    }
  `,

  Message: styled.p`
    font-size: 14px;
    color: ${Color.TextSecondary};
  `,
};
