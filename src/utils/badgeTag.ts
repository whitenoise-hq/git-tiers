/**
 * README 에 붙일 배지 태그.
 * 배지를 누르면 Git TIERS 사이트로 오게 해서, README 를 본 사람이 바로 자기 티어를 확인하러 오게 한다.
 * ref=badge 로 배지를 통해 들어온 방문을 구분한다.
 */
export const BADGE_REF = 'badge';

export const buildBadgeLink = (origin: string): string => `${origin}/?ref=${BADGE_REF}`;

export const buildBadgeTag = (origin: string, loginId: string): string =>
  `<a href="${buildBadgeLink(origin)}"><img src="${origin}/api/tier/${encodeURIComponent(loginId)}" alt="Git-TIERS" /></a>`;
