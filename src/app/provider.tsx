'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster, type ToasterProps } from 'react-hot-toast';
import { Color } from '@/styles/color';
import { LanguageProvider } from '@/i18n/LanguageContext';

type TProps = {
  children: ReactNode;
};

/** 사이트 다크 톤에 맞춘 유리 질감의 알약형 토스트 */
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
    background: 'rgba(28, 28, 30, 0.88)',
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
  },
  success: {
    iconTheme: { primary: '#30d158', secondary: Color.Black },
  },
  error: {
    iconTheme: { primary: Color.Red100, secondary: Color.White },
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
