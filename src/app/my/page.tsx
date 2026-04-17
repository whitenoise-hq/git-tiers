'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styled from '@emotion/styled';

import { Profile } from '@/components/pages/my/Profile';
import { MakeTier } from '@/components/pages/my/MakeTier';

export default function MyPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status !== 'authenticated') {
    return null;
  }

  return (
    <S.Wrapper>
      <S.PageLabel>Account</S.PageLabel>
      <S.PageTitle>My Page</S.PageTitle>
      <S.Content>
        <Profile />
        <MakeTier />
      </S.Content>
    </S.Wrapper>
  );
}

const S = {
  Wrapper: styled.div`
    max-width: 720px;
    width: 100%;
    margin: 0 auto;
    padding: 40px 24px 0;

    @media (max-width: 768px) {
      padding: 24px 20px 0;
    }
  `,

  PageLabel: styled.p`
    font-size: 14px;
    font-weight: 600;
    color: #86868b;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
  `,

  PageTitle: styled.h2`
    font-size: 36px;
    font-weight: 700;
    color: #1d1d1f;
    letter-spacing: -0.03em;
    margin-bottom: 40px;

    @media (max-width: 768px) {
      font-size: 28px;
      margin-bottom: 32px;
    }
  `,

  Content: styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
};
