import { describe, expect, it } from 'vitest';

import robots from './robots';
import sitemap from './sitemap';

describe('robots', () => {
  it('공개 페이지는 열고 관리자·API·마이페이지는 막는다', () => {
    const result = robots();
    expect(result.rules).toEqual({
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/my'],
    });
    expect(result.sitemap).toBe('https://git-tiers.devwoodie.com/sitemap.xml');
  });
});

describe('sitemap', () => {
  it('공개 페이지 5개를 운영 주소로 내보낸다', () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toEqual([
      'https://git-tiers.devwoodie.com',
      'https://git-tiers.devwoodie.com/tiers',
      'https://git-tiers.devwoodie.com/ranking',
      'https://git-tiers.devwoodie.com/notice',
      'https://git-tiers.devwoodie.com/privacy',
    ]);
  });

  it('관리자·마이페이지는 넣지 않는다', () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.some((url) => /\/(admin|my|api)/.test(url))).toBe(false);
  });
});
