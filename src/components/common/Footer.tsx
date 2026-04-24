'use client';

import React from 'react';
import styled from '@emotion/styled';
import { Color } from '@/styles/color';

export const Footer = () => {
  return (
    <S.Footer>
      <S.Inner>
        <S.Brand>Git TIERS</S.Brand>
        <S.Divider />
        <S.Credit>by devwoodie</S.Credit>
      </S.Inner>
    </S.Footer>
  );
};

const S = {
  Footer: styled.footer`
    background: ${Color.TextLight};
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    padding: 20px 24px;
  `,

  Inner: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    max-width: 980px;
    margin: 0 auto;
  `,

  Brand: styled.span`
    font-size: 14px;
    font-weight: 600;
    color: ${Color.TextPrimary};
  `,

  Divider: styled.span`
    width: 1px;
    height: 12px;
    background: rgba(0, 0, 0, 0.2);
  `,

  Credit: styled.span`
    font-size: 12px;
    font-weight: 400;
    color: ${Color.TextSecondary};
  `,
};