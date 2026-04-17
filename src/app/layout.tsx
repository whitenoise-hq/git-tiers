import React from 'react';
import type { Metadata } from "next";

import { Providers } from '@/app/provider';
import '@/styles/globals.css';
import '@/styles/reset.css';
import { Header } from '@/components/common/Header';
import { Container } from '@/components/common/Container';
import { GoogleAdSense } from '@/components/common/GoogleAdSense';

export const metadata: Metadata = {
  title: "Git TIERS",
  description: "Git TIERS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <Header />
          <Container>
            {children}
          </Container>
          <GoogleAdSense />
        </Providers>
      </body>
    </html>
  );
}
