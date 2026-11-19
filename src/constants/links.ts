/** Git TIERS 저장소(예전 git-tiers/gittiers 는 이 주소로 넘어온다) */
export const GITHUB_REPO_URL = 'https://github.com/whitenoise-hq/git-tiers';

/** README 의 각 절로 바로 가는 주소 */
export const README_URL = {
  intro: `${GITHUB_REPO_URL}?tab=readme-ov-file#git-tiers`,
  howToUse: `${GITHUB_REPO_URL}?tab=readme-ov-file#how-to-use`,
} as const;

/** 운영 사이트 주소(robots.txt · sitemap.xml 에 쓴다) */
export const SITE_URL = 'https://git-tiers.devwoodie.com';
