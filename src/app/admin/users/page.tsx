'use client';

import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';

import type { AdminUsersResponse } from '@/app/api/admin/users/route';
import { AuroraBackdrop } from '@/components/common/AuroraBackdrop';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageContainer } from '@/components/common/PageContainer';
import { AdminNav } from '@/components/pages/admin/AdminNav';
import { UserTable } from '@/components/pages/admin/UserTable';
import { Color } from '@/styles/color';

type State =
  | { readonly status: 'loading' }
  | { readonly status: 'denied' }
  | { readonly status: 'error' }
  | { readonly status: 'ready'; readonly data: AdminUsersResponse };

/** 관리자 사용자 목록. 관리자 GitHub ID 로만 열린다(프록시·API 이중 확인). */
export default function AdminUsersPage() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (cancelled) return;
        if (res.status === 404) {
          setState({ status: 'denied' });
          return;
        }
        if (!res.ok) throw new Error(`users ${res.status}`);
        const data = (await res.json()) as AdminUsersResponse;
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
        <S.PageTitle>사용자</S.PageTitle>
        <AdminNav />

        {state.status === 'denied' && (
          <S.Message>페이지를 찾을 수 없습니다.</S.Message>
        )}
        {state.status === 'error' && (
          <S.Message>사용자 목록을 불러오지 못했습니다.</S.Message>
        )}
        {state.status === 'ready' && <UserTable users={state.data.users} />}
      </S.Wrapper>
      <LoadingSpinner loading={state.status === 'loading'} />
    </>
  );
}

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
    margin-bottom: 20px;
  `,

  Message: styled.p`
    font-size: 14px;
    color: ${Color.TextSecondary};
  `,
};
