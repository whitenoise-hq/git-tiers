'use client';

import React from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <S.Footer>
      <S.Inner>
        <S.Brand>Git TIERS</S.Brand>
        <S.Divider />
        <S.Credit>by devwoodie</S.Credit>
        <S.Divider />
        <S.PolicyLink href="/privacy">{t.footer.privacy}</S.PolicyLink>
      </S.Inner>
    </S.Footer>
  );
};

const S = {
  Footer: styled.footer`
    background: #0e0e0e;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding: 20px 24px;
  `,

  Inner: styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 10px;
    max-width: 980px;
    margin: 0 auto;
  `,

  Brand: styled.span`
    font-size: 14px;
    font-weight: 600;
    color: ${Color.TextLight};
  `,

  Divider: styled.span`
    width: 1px;
    height: 12px;
    background: rgba(255, 255, 255, 0.2);
  `,

  Credit: styled.span`
    font-size: 12px;
    font-weight: 400;
    color: ${Color.TextSecondary};
  `,

  // 개인정보 처리방침은 다른 링크보다 눈에 띄게(굵게) 표시한다.
  PolicyLink: styled(Link)`
    font-size: 12px;
    font-weight: 700;
    color: ${Color.Gray100};
    text-decoration: none;

    &:hover {
      color: ${Color.TextLight};
      text-decoration: underline;
    }
  `,
};
