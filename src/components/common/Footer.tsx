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
/** 빌드할 때 package.json 의 version 이 들어간다(next.config.ts). */
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION;

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
            <S.NavLink href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
              <GitHubIcon sx={{ fontSize: 15 }} />
              GitHub
            </S.NavLink>
            <S.NavLink href="/privacy">{t.footer.privacy}</S.NavLink>
          </S.Nav>
        </S.Top>

        <S.Bottom>
          <S.Legal>
            <span>&copy; {CURRENT_YEAR} Git TIERS. All rights reserved.</span>
            {APP_VERSION && (
              // 최신 버전 내용은 공지사항에서 볼 수 있다.
              <S.Version href="/notice">v{APP_VERSION}</S.Version>
            )}
          </S.Legal>
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
    /* 오로라 배경(고정 레이어) 위로 올린다 */
    z-index: 1;
    background: #0a0a0a;
    padding: 32px 24px 24px;

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
      padding: 28px 20px 20px;
    }
  `,

  Inner: styled.div`
    max-width: 980px;
    margin: 0 auto;
  `,

  Top: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding-bottom: 20px;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      padding-bottom: 16px;
    }
  `,

  BrandBlock: styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
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
    padding: 6px 12px;
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

  Bottom: styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 8px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 12px;
    color: ${Color.Black200};
  `,

  Legal: styled.span`
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  `,

  Version: styled(Link)`
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: ${Color.TextSecondary};
    text-decoration: none;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 980px;
    transition: color 0.2s ease, background 0.2s ease;

    &:hover {
      color: ${Color.TextLight};
      background: rgba(255, 255, 255, 0.12);
    }
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
