'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from "react-hot-toast";
import { Color } from '@/styles/color';
import { LanguageProvider } from '@/i18n/LanguageContext';

type TProps = {
  children: ReactNode,
}

export const Providers = ({ children }: TProps) => {

  return (
    <SessionProvider>
      <LanguageProvider>
        {children}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            className: '',
            duration: 3000,
            style: {
              maxWidth: "600px",
            },
            success: {
              style:{
                background: Color.AlertSuccess,
              },
            },
            error: {
              style:{
                background: Color.AlertError,
              },
            }
          }}
        />
      </LanguageProvider>
    </SessionProvider>
  );
}