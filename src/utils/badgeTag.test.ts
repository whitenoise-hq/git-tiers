import { describe, expect, it } from 'vitest';
import { buildBadgeLink, buildBadgeTag } from './badgeTag';

const ORIGIN = 'https://git-tiers.devwoodie.com';

describe('buildBadgeTag', () => {
  it('배지를 누르면 사이트로 오고, 배지 유입임을 표시한다', () => {
    expect(buildBadgeLink(ORIGIN)).toBe('https://git-tiers.devwoodie.com/?ref=badge');
  });

  it('README 에 붙일 태그', () => {
    expect(buildBadgeTag(ORIGIN, 'devwoodie')).toBe(
      '<a href="https://git-tiers.devwoodie.com/?ref=badge"><img src="https://git-tiers.devwoodie.com/api/tier/devwoodie" alt="Git-TIERS" /></a>'
    );
  });

  it('GitHub 저장소가 아니라 사이트로 연결한다', () => {
    expect(buildBadgeTag(ORIGIN, 'a')).not.toContain('github.com');
  });
});
