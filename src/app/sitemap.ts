import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/constants/links';

/** 검색에 내보낼 공개 페이지. 새 공개 페이지를 만들면 여기에 더한다. */
const PUBLIC_PATHS = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/tiers', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/ranking', changeFrequency: 'daily', priority: 0.8 },
  { path: '/notice', changeFrequency: 'weekly', priority: 0.5 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
] as const satisfies readonly {
  path: string;
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]['changeFrequency']
  >;
  priority: number;
}[];

/** /sitemap.xml */
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }));
}
