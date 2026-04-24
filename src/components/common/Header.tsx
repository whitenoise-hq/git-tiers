'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import GitHubIcon from '@mui/icons-material/GitHub';

import { Logo } from '@/components/common/Logo';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/hooks/useAuth';

const COLLAPSE_THRESHOLD = 200;
const GITHUB_REPO_URL = 'https://github.com/git-tiers/gittiers?tab=readme-ov-file#git-tiers';

const HeaderActions = ({
  dark,
  isLogin,
  userImg,
  onLogin,
}: {
  dark: boolean;
  isLogin: boolean;
  userImg: string;
  onLogin: () => void;
}) => {
  const router = useRouter();
  const { lang, t, toggleLang } = useLanguage();
  const iconColor = dark ? '#f5f5f7' : '#1d1d1f';

  return (
    <S.Actions>
      <IconButton onClick={() => router.push('/notice')} size="small">
        <Badge badgeContent={1} color="error">
          <NotificationsIcon sx={{ color: iconColor, fontSize: 20 }} />
        </Badge>
      </IconButton>
      <Link href={GITHUB_REPO_URL} rel="noopener noreferrer" target="_blank">
        <IconButton size="small">
          <GitHubIcon sx={{ color: iconColor, fontSize: 20 }} />
        </IconButton>
      </Link>
      {dark ? (
        <S.LangToggle onClick={toggleLang}>
          {lang === 'en' ? 'KO' : 'EN'}
        </S.LangToggle>
      ) : (
        <S.LangToggleLight onClick={toggleLang}>
          {lang === 'en' ? 'KO' : 'EN'}
        </S.LangToggleLight>
      )}
      {isLogin ? (
        <IconButton onClick={() => router.push('/my')} size="small">
          <Avatar alt="user-profile" src={userImg} sx={{ width: 32, height: 32 }} />
        </IconButton>
      ) : (
        <S.CTA onClick={onLogin}>{t.header.getStarted}</S.CTA>
      )}
    </S.Actions>
  );
};

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isLogin, userImg, handleGitLogin } = useAuth();
  const { t } = useLanguage();

  const isLanding = pathname === '/';

  useEffect(() => {
    if (!isLanding) return;

    const handleScroll = () => setCollapsed(window.scrollY > COLLAPSE_THRESHOLD);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLanding]);

  if (isLanding) {
    return (
      <S.LandingNav data-collapsed={collapsed}>
        <S.LandingInner data-collapsed={collapsed}>
          <S.FullRow data-collapsed={collapsed}>
            <Logo dark />
            <HeaderActions dark isLogin={isLogin} userImg={userImg} onLogin={handleGitLogin} />
          </S.FullRow>

          <S.PillRow data-collapsed={collapsed}>
            <S.PillName onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Git TIERS
            </S.PillName>
            <S.PillActions>
              {isLogin ? (
                <S.CTA onClick={() => router.push('/my')}>{t.header.myPage}</S.CTA>
              ) : (
                <S.CTA onClick={handleGitLogin}>{t.header.getStarted}</S.CTA>
              )}
            </S.PillActions>
          </S.PillRow>
        </S.LandingInner>
      </S.LandingNav>
    );
  }

  return (
    <S.Nav>
      <S.Inner>
        <Logo />
        <HeaderActions dark={false} isLogin={isLogin} userImg={userImg} onLogin={handleGitLogin} />
      </S.Inner>
    </S.Nav>
  );
};

const S = {
  LandingNav: styled.nav`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    display: flex;
    justify-content: center;
    padding: 0 24px;
    transition: padding 0.5s cubic-bezier(0.4, 0, 0.2, 1);

    &[data-collapsed='true'] {
      padding: 10px 24px;
    }
  `,

  LandingInner: styled.div`
    position: relative;
    width: 100%;
    max-width: 1200px;
    height: 52px;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(0, 0, 0, 0.72);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    border: 1px solid transparent;
    border-radius: 0;

    &[data-collapsed='true'] {
      max-width: 420px;
      height: 44px;
      border-radius: 980px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(30, 30, 30, 0.85);
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
    }
  `,

  FullRow: styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    opacity: 1;
    transition: opacity 0.3s ease;
    pointer-events: auto;

    &[data-collapsed='true'] {
      opacity: 0;
      pointer-events: none;
    }
  `,

  PillRow: styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 6px 0 20px;
    opacity: 0;
    transition: opacity 0.3s ease 0.15s;
    pointer-events: none;

    &[data-collapsed='true'] {
      opacity: 1;
      pointer-events: auto;
    }
  `,

  PillName: styled.button`
    font-size: 14px;
    font-weight: 600;
    color: #f5f5f7;
    background: none;
    border: none;
    cursor: pointer;
    white-space: nowrap;
    letter-spacing: -0.01em;
  `,

  PillActions: styled.div`
    display: flex;
    align-items: center;
  `,

  CTA: styled.button`
    padding: 7px 18px;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    background: #0071e3;
    border: none;
    border-radius: 980px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s ease;

    &:hover {
      background: #0077ed;
    }
  `,

  LangToggle: styled.button`
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 700;
    color: #f5f5f7;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 980px;
    cursor: pointer;
    letter-spacing: 0.02em;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.18);
    }
  `,

  LangToggleLight: styled.button`
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 700;
    color: #1d1d1f;
    background: rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 980px;
    cursor: pointer;
    letter-spacing: 0.02em;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.08);
    }
  `,

  Nav: styled.nav`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 0 24px;
    background: rgba(251, 251, 253, 0.72);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  `,

  Inner: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    height: 52px;
  `,

  Actions: styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
  `,
};