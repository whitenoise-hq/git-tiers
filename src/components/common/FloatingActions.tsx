'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import GitHubIcon from '@mui/icons-material/GitHub';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export const FloatingActions = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <S.Wrap data-visible={visible}>
      <S.Button onClick={() => router.push('/notice')} aria-label="Notice">
        <NotificationsNoneIcon sx={{ fontSize: 18 }} />
      </S.Button>
      <S.LinkButton
        href="https://github.com/git-tiers/gittiers"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub">
        <GitHubIcon sx={{ fontSize: 18 }} />
      </S.LinkButton>
      <S.Button onClick={scrollToTop} aria-label="Back to top">
        <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
      </S.Button>
    </S.Wrap>
  );
};

const S = {
  Wrap: styled.div`
    position: fixed;
    bottom: 32px;
    right: 32px;
    z-index: 900;
    display: flex;
    flex-direction: column;
    gap: 8px;
    opacity: 0;
    transform: translateY(16px);
    pointer-events: none;
    transition: opacity 0.3s ease, transform 0.3s ease;

    &[data-visible='true'] {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    @media (max-width: 768px) {
      bottom: 24px;
      right: 20px;
    }
  `,

  Button: styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 50%;
    background: rgba(30, 30, 30, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: #f5f5f7;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;

    &:hover {
      background: rgba(60, 60, 60, 0.9);
      border-color: rgba(255, 255, 255, 0.2);
    }
  `,

  LinkButton: styled.a`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 50%;
    background: rgba(30, 30, 30, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: #f5f5f7;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;

    &:hover {
      background: rgba(60, 60, 60, 0.9);
      border-color: rgba(255, 255, 255, 0.2);
    }
  `,
};