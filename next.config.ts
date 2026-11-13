import { version } from './package.json';

/** @types {import('next').NextConfig} */
const nextConfig = {
  // 푸터에 보여 줄 앱 버전(package.json 의 version, 공지 버전과 같이 올린다)
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
  experimental: {
    externalDir: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
