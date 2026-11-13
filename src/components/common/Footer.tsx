'use client';

import React from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';

const GITHUB_REPO_URL = 'https://github.com/git-tiers/gittiers';
const AUTHOR_GITHUB_URL = 'https://github.com/devwoodie';
const CURRENT_YEAR = new Date().getFullYear();

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <S.Footer>
      <S.Inner>
        <S.Top>
          <S.BrandBlock>
            <S.Brand>Git TIERS</S.Brand>
            <S.Tagline>{t.hero.subtitle1}</S.Tagline>
          </S.BrandBlock>

          <S.Nav aria-label="Footer">
            <S.NavLink href="/notice">{t.notice.title}</S.NavLink>
            <S.NavLink href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
              <GitHubIcon sx={{ fontSize: 15 }} />
              GitHub
            </S.NavLink>
            {/* 개인정보 처리방침은 법적으로 눈에 띄게 표시한다 */}
            <S.PolicyLink href="/privacy">{t.footer.privacy}</S.PolicyLink>
          </S.Nav>
        </S.Top>

        <S.Bottom>
          <span>&copy; {CURRENT_YEAR} Git TIERS. All rights reserved.</span>
          <S.Author href={AUTHOR_GITHUB_URL} target="_blank" rel="noopener noreferrer">
            Made by devwoodie
          </S.Author>
        </S.Bottom>
      </S.Inner>
    </S.Footer>
  );
};

const S = {
  Footer: styled.footer`
    position: relative;
    background: #0a0a0a;
    padding: 56px 24px 40px;

    /* 위쪽 경계를 가운데만 은은하게 빛나는 선으로 */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: min(980px, 100%);
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.18), transparent);
    }

    @media (max-width: 768px) {
      padding: 44px 20px 32px;
    }
  `,

  Inner: styled.div`
    max-width: 980px;
    margin: 0 auto;
  `,

  Top: styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 32px;
    padding-bottom: 32px;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 24px;
      padding-bottom: 24px;
    }
  `,

  BrandBlock: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,

  Brand: styled.p`
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: ${Color.TextLight};
  `,

  Tagline: styled.p`
    font-size: 13px;
    line-height: 1.5;
    color: ${Color.TextSecondary};
  `,

  Nav: styled.nav`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  `,

  NavLink: styled(Link)`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 500;
    color: ${Color.Gray100};
    text-decoration: none;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 980px;
    transition:
      color 0.2s ease,
      background 0.2s ease;

    &:hover {
      color: ${Color.TextLight};
      background: rgba(255, 255, 255, 0.1);
    }
  `,

  PolicyLink: styled(Link)`
    display: inline-flex;
    align-items: center;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 700;
    color: ${Color.TextLight};
    text-decoration: none;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 980px;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.18);
    }
  `,

  Bottom: styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 8px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 12px;
    color: ${Color.Black200};
  `,

  Author: styled.a`
    color: ${Color.TextSecondary};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${Color.TextLight};
    }
  `,
};
