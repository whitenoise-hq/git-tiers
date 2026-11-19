import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/constants/links';

/**
 * /robots.txt — 공개 페이지는 검색에 열고, 관리자·API·개인 페이지는 막는다.
 * 배지 이미지(/api/tier/...)는 GitHub 가 직접 가져가므로 막아도 README 에는 그대로 보인다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/my'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
