import React from 'react';
import type { Metadata } from 'next';

import { Providers } from '@/app/provider';
import '@/styles/globals.css';
import '@/styles/reset.css';
import { Header } from '@/components/common/Header';
import { Container } from '@/components/common/Container';
import { GoogleAdSense } from '@/components/common/GoogleAdSense';

export const metadata: Metadata = {
  title: '깃티어 | Git TIERS - GitHub 커밋 기반 티어 시스템',
  description:
    '깃티어(Git TIERS) - 매일의 커밋으로 실력을 증명하세요. GitHub 기여도에 따라 Iron부터 Challenger까지 9단계 티어가 부여됩니다. 깃허브 티어 배지를 README에 표시하세요.',
  keywords: [
    '깃티어',
    'git tiers',
    '깃허브 티어',
    'github tier',
    '깃허브 기여도',
    '커밋 티어',
    'github contributions',
    '깃허브 배지',
    'github badge',
    '개발자 티어',
  ],
  metadataBase: new URL('https://git-tiers.devwoodie.com'),
  openGraph: {
    title: '깃티어 | Git TIERS - GitHub 커밋 기반 티어 시스템',
    description:
      '매일의 커밋으로 실력을 증명하세요. GitHub 기여도에 따라 Iron부터 Challenger까지 9단계 티어가 부여됩니다.',
    url: 'https://git-tiers.devwoodie.com',
    siteName: '깃티어 | Git TIERS',
    images: [
      {
        url: '/og-image.png',
        width: 976,
        height: 569,
        alt: 'Git TIERS',
      },
    ],
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '깃티어 | Git TIERS - GitHub 커밋 기반 티어 시스템',
    description:
      '매일의 커밋으로 실력을 증명하세요. GitHub 기여도에 따라 Iron부터 Challenger까지 9단계 티어가 부여됩니다.',
  },
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
          <Container>{children}</Container>
          <GoogleAdSense />
        </Providers>
      </body>
    </html>
  );
}
