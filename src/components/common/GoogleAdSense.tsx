'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

const ALLOWED_PATHS = ['/my'];

export const GoogleAdSense = () => {
  const pathname = usePathname();

  if (!ALLOWED_PATHS.includes(pathname)) {
    return null;
  }

  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9671858264073035"
      crossOrigin="anonymous"
    />
  );
};
