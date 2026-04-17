'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import styled from '@emotion/styled';

import { Color } from '@/styles/color';

const FULL_BLEED_PATHS = ['/'];

export const Container = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isFullBleed = FULL_BLEED_PATHS.includes(pathname);

  if (isFullBleed) {
    return <>{children}</>;
  }

  return (
    <S.Inner>
      {children}
    </S.Inner>
  );
};

const S = {
  Inner: styled.main`
    position: relative;
    padding-top: 84px;
    min-height: 100vh;
    background-color: ${Color.Bg100};
  `,
};