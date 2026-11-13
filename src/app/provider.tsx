'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster, type ToasterProps } from 'react-hot-toast';
import { Color } from '@/styles/color';
import { LanguageProvider } from '@/i18n/LanguageContext';

type TProps = {
  children: ReactNode;
};

const TOAST_BASE_BG = 'rgba(28, 28, 30, 0.88)';

/** 사이트 다크 톤에 맞춘 유리 질감의 토스트 */
const TOAST_OPTIONS: ToasterProps['toastOptions'] = {
  duration: 3000,
  style: {
    maxWidth: 'min(520px, calc(100vw - 32px))',
    padding: '12px 18px',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.45,
    letterSpacing: '-0.01em',
    color: Color.TextLight,
    background: TOAST_BASE_BG,
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
  },
  // 기본 어두운 배경 위에 종류별 색을 살짝 얹는다.
  success: {
    iconTheme: { primary: '#30d158', secondary: Color.Black },
    style: {
      background: `linear-gradient(rgba(48, 209, 88, 0.14), rgba(48, 209, 88, 0.14)), ${TOAST_BASE_BG}`,
      border: '1px solid rgba(48, 209, 88, 0.28)',
    },
  },
  error: {
    iconTheme: { primary: Color.Red100, secondary: Color.White },
    style: {
      background: `linear-gradient(rgba(249, 68, 57, 0.16), rgba(249, 68, 57, 0.16)), ${TOAST_BASE_BG}`,
      border: '1px solid rgba(249, 68, 57, 0.32)',
    },
  },
  loading: {
    iconTheme: { primary: Color.TextLight, secondary: 'rgba(255, 255, 255, 0.2)' },
  },
};

export const Providers = ({ children }: TProps) => {
  return (
    <SessionProvider>
      <LanguageProvider>
        {children}
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={10}
          // 고정 헤더(52px) 아래에 뜨도록 내린다.
          containerStyle={{ top: 72 }}
          toastOptions={TOAST_OPTIONS}
        />
      </LanguageProvider>
    </SessionProvider>
  );
};
