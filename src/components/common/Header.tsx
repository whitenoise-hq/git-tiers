'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { useSession } from 'next-auth/react';

import { Avatar } from '@/components/common/Avatar';
import {
  AdminPanelSettingsIcon,
  EmojiEventsIcon,
  GitHubIcon,
  NotificationsIcon,
} from '@/components/common/icons';
import { Logo } from '@/components/common/Logo';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Color } from '@/styles/color';
import { GITHUB_REPO_URL } from '@/constants/links';

const COLLAPSE_THRESHOLD = 200;

/** 헤더의 동그란 아이콘 버튼(알림·랭킹·GitHub·관리자·프로필) */
const iconButtonStyle = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  color: inherit;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

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
  const { data: session } = useSession();
  const iconColor = dark ? Color.TextLight : Color.TextPrimary;

  return (
    <S.Actions style={{ color: iconColor }}>
      <S.IconButton type="button" onClick={() => router.push('/notice')} aria-label="Notice">
        <S.BadgeWrap>
          <NotificationsIcon size={20} />
          <S.BadgeCount aria-hidden>1</S.BadgeCount>
        </S.BadgeWrap>
      </S.IconButton>
      {/* 다른 아이콘(알림·GitHub)처럼 채워진 모양을 써서 크기가 같아 보이게 한다. */}
      <S.IconButton type="button" onClick={() => router.push('/ranking')} aria-label={t.header.ranking}>
        <EmojiEventsIcon size={20} />
      </S.IconButton>
      <S.IconLink href={GITHUB_REPO_URL} rel="noopener noreferrer" target="_blank" aria-label="GitHub">
        <GitHubIcon size={20} />
      </S.IconLink>
      {dark ? (
        <S.LangToggle onClick={toggleLang}>
          {lang === 'en' ? 'KO' : 'EN'}
        </S.LangToggle>
      ) : (
        <S.LangToggleLight onClick={toggleLang}>
          {lang === 'en' ? 'KO' : 'EN'}
        </S.LangToggleLight>
      )}
      {/* 관리자에게만 보이는 메뉴. 다른 사람이 주소로 들어와도 프록시·API 가 막는다. */}
      {isLogin && session?.isAdmin && (
        <S.IconButton type="button" onClick={() => router.push('/admin/stats')} aria-label="Admin">
          <AdminPanelSettingsIcon size={20} />
        </S.IconButton>
      )}
      {isLogin ? (
        <S.IconButton type="button" onClick={() => router.push('/my')} aria-label={t.header.myPage}>
          <Avatar alt="user-profile" src={userImg} size={32} />
        </S.IconButton>
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
        <Logo dark />
        <HeaderActions dark isLogin={isLogin} userImg={userImg} onLogin={handleGitLogin} />
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
    color: ${Color.TextLight};
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
    background: ${Color.Link};
    border: none;
    border-radius: 980px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s ease;

    &:hover {
      background: ${Color.LinkHover};
    }
  `,

  LangToggle: styled.button`
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 700;
    color: ${Color.TextLight};
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
    color: ${Color.TextPrimary};
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

  // 랜딩 외 페이지: 투명 배경으로 맨 위에만 두고 스크롤하면 본문과 함께 올라간다.
  // 본문(Container)이 헤더 높이만큼 위 여백을 두므로 흐름에서 빼(absolute) 겹치지 않게 한다.
  Nav: styled.nav`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 0 24px;
    background: transparent;
  `,

  Inner: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    height: 52px;
    /* 랜딩 헤더와 로고·버튼 위치를 맞춘다: 랜딩 안쪽 여백 24px + 테두리 1px */
    padding: 0 25px;
  `,

  Actions: styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
  `,

  IconButton: styled.button`
    ${iconButtonStyle}
  `,

  IconLink: styled(Link)`
    ${iconButtonStyle}
  `,

  BadgeWrap: styled.span`
    position: relative;
    display: inline-flex;
  `,

  // 읽지 않은 공지 표시. 아이콘 오른쪽 위 모서리에 걸친다.
  BadgeCount: styled.span`
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    color: #fff;
    background: ${Color.Red200};
    border-radius: 10px;
  `,
};