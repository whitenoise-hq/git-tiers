import { describe, expect, it } from 'vitest';
import {
  buildRankingSnapshot,
  buildTierDistribution,
  getRefreshAvailableAt,
  REFRESH_COOLDOWN_MS,
  findMyRank,
  getNextTier,
  getTierName,
  maskLogin,
  sortRanking,
  toPublicRankItem,
  type RankingEntry,
} from './ranking';

const entry = (
  githubId: string,
  count: number,
  firstLogin?: string,
  login = `user${githubId}`
): RankingEntry => ({
  githubId,
  login,
  count,
  firstLogin,
});

describe('maskLogin', () => {
  it.each([
    ['devwoodie', 'dev***ie'],
    ['younghyundev', 'you***ev'],
    ['abcdefgh', 'abc***gh'],
    ['juns07', 'ju***7'],
    ['abcde', 'ab***e'],
    ['abcd', 'a***'],
    ['a', 'a***'],
    ['', '***'],
  ])('%s → %s', (login, masked) => {
    expect(maskLogin(login)).toBe(masked);
  });

  it('가린 부분은 길이와 상관없이 별표 3개다', () => {
    expect(maskLogin('a'.repeat(39))).toBe('aaa***aa');
  });
});

describe('sortRanking', () => {
  it('기여 수 내림차순', () => {
    const sorted = sortRanking([
      entry('1', 10),
      entry('2', 300),
      entry('3', 50),
    ]);
    expect(sorted.map((e) => e.githubId)).toEqual(['2', '3', '1']);
  });

  it('동점이면 먼저 가입한 사람이 위, 가입 시각이 없으면 뒤', () => {
    const sorted = sortRanking([
      entry('1', 100),
      entry('2', 100, '2026-03-01T00:00:00.000Z'),
      entry('3', 100, '2025-01-01T00:00:00.000Z'),
    ]);
    expect(sorted.map((e) => e.githubId)).toEqual(['3', '2', '1']);
  });

  it('입력 배열을 바꾸지 않는다', () => {
    const input = [entry('1', 1), entry('2', 2)];
    sortRanking(input);
    expect(input.map((e) => e.githubId)).toEqual(['1', '2']);
  });
});

describe('toPublicRankItem', () => {
  it('가린 아이디와 티어만 담고 기여 수는 담지 않는다', () => {
    const item = toPublicRankItem(entry('1', 2736, undefined, 'devwoodie'), 1);
    expect(item).toEqual({
      rank: 1,
      maskedLogin: 'dev***ie',
      tierName: 'Master',
      tierText: 'Master 2',
      tierImage: '/tiers/7_master.png',
    });
    expect(JSON.stringify(item)).not.toContain('2736');
    expect(JSON.stringify(item)).not.toContain('devwoodie');
  });
});

describe('getTierName', () => {
  it.each([
    [0, 'Iron'],
    [199, 'Iron'],
    [200, 'Bronze'],
    [4800, 'Challenger'],
    [99999, 'Challenger'],
  ])('%i → %s', (count, name) => {
    expect(getTierName(count)).toBe(name);
  });
});

describe('buildTierDistribution', () => {
  it('사람이 있는 티어는 최소 0.1, 비율은 0.1 단위', () => {
    const many = Array.from({ length: 30 }, (_, i) => entry(String(i), 0));
    const buckets = buildTierDistribution([...many, entry('x', 2736)]);
    expect(buckets[0].ratio).toBe(1);
    expect(buckets.find((b) => b.tier === 'Master')?.ratio).toBe(0.1);
  });

  it('아무도 없으면 모두 0', () => {
    expect(buildTierDistribution([]).every((b) => b.ratio === 0)).toBe(true);
  });

  it('낮은 티어부터 9개 티어의 인원을 센다', () => {
    const buckets = buildTierDistribution([
      entry('1', 0),
      entry('2', 10),
      entry('3', 2736),
    ]);
    expect(buckets).toHaveLength(9);
    // 가장 많은 Iron(2명)이 1, Master(1명)는 0.5, 빈 티어는 0
    expect(buckets[0]).toEqual({ tier: 'Iron', ratio: 1 });
    expect(buckets.find((b) => b.tier === 'Master')?.ratio).toBe(0.5);
    expect(buckets[8]).toEqual({ tier: 'Challenger', ratio: 0 });
    expect(JSON.stringify(buckets)).not.toContain('count');
  });
});

describe('getNextTier', () => {
  it('바로 위 세부 단계까지 남은 수', () => {
    expect(getNextTier(2736)).toEqual({ tierText: 'Master 1', remaining: 164 });
    expect(getNextTier(0)).toEqual({ tierText: 'Iron 3', remaining: 50 });
    expect(getNextTier(150)).toEqual({ tierText: 'Bronze 4', remaining: 50 });
  });

  it('가장 높은 단계면 null', () => {
    expect(getNextTier(6300)).toBeNull();
    expect(getNextTier(9000)).toBeNull();
  });
});

describe('findMyRank', () => {
  const sorted = sortRanking([
    entry('1', 10),
    entry('2', 2736),
    entry('3', 500),
  ]);

  it('본인 순위와 다음 단계', () => {
    expect(findMyRank(sorted, '3')).toEqual({
      rank: 2,
      count: 500,
      tierName: 'Silver',
      tierText: 'Silver 2',
      tierImage: '/tiers/3_silver.png',
      next: { tierText: 'Silver 1', remaining: 50 },
    });
  });

  it('목록에 없으면 null', () => {
    expect(findMyRank(sorted, '999')).toBeNull();
  });
});

describe('getRefreshAvailableAt', () => {
  const NOW = Date.parse('2026-11-13T12:00:00.000Z');

  it('갱신한 적 없으면 지금 바로 가능', () => {
    expect(getRefreshAvailableAt(undefined, NOW)).toBe(NOW);
    expect(getRefreshAvailableAt('broken', NOW)).toBe(NOW);
  });

  it('마지막 갱신 + 1분', () => {
    const last = new Date(NOW - 10_000).toISOString();
    expect(getRefreshAvailableAt(last, NOW)).toBe(
      NOW - 10_000 + REFRESH_COOLDOWN_MS
    );
  });

  it('1분이 지났으면 지금', () => {
    const last = new Date(NOW - 5 * 60_000).toISOString();
    expect(getRefreshAvailableAt(last, NOW)).toBe(NOW);
  });
});

describe('buildRankingSnapshot', () => {
  const sorted = sortRanking([
    entry('1', 10),
    entry('2', 2736),
    entry('3', 500),
  ]);

  it('공개용에는 isMe 를 넣지 않는다', () => {
    const snapshot = buildRankingSnapshot(sorted);
    expect('total' in snapshot).toBe(false);
    expect(snapshot.podium).toHaveLength(3);
    expect('isMe' in snapshot.podium[0]).toBe(false);
  });

  it('보는 사람이 있으면 본인 칸에만 isMe', () => {
    const snapshot = buildRankingSnapshot(sorted, '3');
    expect(snapshot.podium.map((p) => p.isMe)).toEqual([false, true, false]);
  });
});
