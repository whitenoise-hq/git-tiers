'use client';

import Link from 'next/link';
import styled from '@emotion/styled';

import { AuroraBackdrop } from '@/components/common/AuroraBackdrop';
import { PageContainer } from '@/components/common/PageContainer';
import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';

/** 없는 주소로 들어왔을 때. 다른 페이지와 같은 오로라 배경을 쓴다. */
export default function NotFound() {
  const { t } = useLanguage();

  return (
    <>
      <AuroraBackdrop />
      <S.Wrapper>
        <S.Code aria-hidden>404</S.Code>
        <S.Title>{t.notFound.title}</S.Title>
        <S.Description>{t.notFound.description}</S.Description>
        <S.Actions>
          <S.Primary href="/">{t.notFound.home}</S.Primary>
          <S.Secondary href="/ranking">{t.notFound.ranking}</S.Secondary>
        </S.Actions>
      </S.Wrapper>
    </>
  );
}

const S = {
  Wrapper: styled(PageContainer)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
  `,

  // 흰색에서 파란색으로 흐르는 큰 숫자
  Code: styled.p`
    font-size: 120px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.05em;
    background: linear-gradient(180deg, ${Color.TextLight} 20%, ${Color.Link});
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;

    @media (max-width: 768px) {
      font-size: 88px;
    }
  `,

  Title: styled.h2`
    margin-top: 16px;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: ${Color.TextLight};
  `,

  Description: styled.p`
    margin-top: 8px;
    font-size: 15px;
    color: ${Color.TextSecondary};
  `,

  Actions: styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-top: 28px;
  `,

  Primary: styled(Link)`
    display: inline-flex;
    align-items: center;
    height: 42px;
    padding: 0 24px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    text-decoration: none;
    background: ${Color.Link};
    border-radius: 980px;
    transition: background 0.2s ease;

    &:hover {
      background: ${Color.LinkHover};
    }
  `,

  Secondary: styled(Link)`
    display: inline-flex;
    align-items: center;
    height: 42px;
    padding: 0 22px;
    font-size: 14px;
    font-weight: 600;
    color: ${Color.TextLight};
    text-decoration: none;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 980px;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.14);
    }
  `,
};
