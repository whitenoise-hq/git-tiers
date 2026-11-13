import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  fetchRankingEntries: vi.fn(),
  getToken: vi.fn(),
  getUserById: vi.fn(),
  refreshUserContribution: vi.fn(),
}));

vi.mock('../../../../firebase/ranking', () => ({
  fetchRankingEntries: mocks.fetchRankingEntries,
}));
vi.mock('next-auth/jwt', () => ({ getToken: mocks.getToken }));
vi.mock('../../../../firebase/users', () => ({
  getUserById: mocks.getUserById,
}));
vi.mock('../../../../firebase/contributions', () => ({
  refreshUserContribution: mocks.refreshUserContribution,
}));

const { GET: getRanking } = await import('./route');
const { GET: getMyRank, POST: refreshMyRank } = await import('./me/route');

const entries = [
  {
    githubId: '1',
    login: 'devwoodie',
    count: 2736,
    firstLogin: '2025-01-01T00:00:00.000Z',
  },
  { githubId: '2', login: 'younghyundev', count: 1812 },
  { githubId: '3', login: 'partykyoung', count: 1034 },
  { githubId: '4', login: 'abc', count: 12 },
];

describe('GET /api/ranking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fetchRankingEntries.mockResolvedValue(entries);
  });

  it('상위 3명을 가린 아이디와 티어로만 돌려준다', async () => {
    const res = await getRanking();
    const body = await res.json();

    expect('total' in body).toBe(false);
    expect(
      body.podium.map((p: { maskedLogin: string }) => p.maskedLogin)
    ).toEqual(['dev***ie', 'you***ev', 'par***ng']);
    expect(body.podium[0]).toMatchObject({ rank: 1, tierText: 'Master 2' });

    const raw = JSON.stringify(body);
    expect(raw).not.toContain('devwoodie');
    expect(raw).not.toContain('2736');
    expect(raw).not.toContain('a***');
  });

  it('티어 분포를 함께 준다', async () => {
    const body = await (await getRanking()).json();
    expect(body.distribution).toHaveLength(9);
    // 티어마다 1명씩이라 모두 가장 많은 티어와 같은 비율(1). 인원수는 내보내지 않는다.
    expect(body.distribution[0]).toEqual({ tier: 'Iron', ratio: 1 });
    expect(JSON.stringify(body.distribution)).not.toContain('count');
  });

  it('공용 캐시를 쓴다', async () => {
    const res = await getRanking();
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=60,');
  });

  it('DB 오류는 500', async () => {
    mocks.fetchRankingEntries.mockRejectedValue(new Error('down'));
    expect((await getRanking()).status).toBe(500);
  });
});

describe('GET /api/ranking/me', () => {
  const call = () =>
    getMyRank(new NextRequest('http://localhost/api/ranking/me'));

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fetchRankingEntries.mockResolvedValue(entries);
    mocks.getToken.mockResolvedValue({ githubId: '3', loginId: 'partykyoung' });
    mocks.getUserById.mockResolvedValue({ docId: '3', data: {} });
  });

  it('로그인하지 않으면 401', async () => {
    mocks.getToken.mockResolvedValue(null);
    expect((await call()).status).toBe(401);
  });

  it('포디움을 본인 순위와 같은 데이터로 주고 본인 표시를 붙인다', async () => {
    const body = await (await call()).json();
    expect('total' in body).toBe(false);
    expect(body.podium.map((p: { isMe: boolean }) => p.isMe)).toEqual([
      false,
      false,
      true,
    ]);
    expect(body.me.rank).toBe(3);
    expect(JSON.stringify(body.podium)).not.toContain('partykyoung');
  });

  it('본인 순위와 다음 단계를 준다(개인 캐시 금지)', async () => {
    const res = await call();
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
    expect((await res.json()).me).toMatchObject({
      rank: 3,
      count: 1034,
      tierText: 'Platinum 2',
      next: { tierText: 'Platinum 1', remaining: 66 },
    });
  });

  it('랭킹에 없으면 me 는 null', async () => {
    mocks.getToken.mockResolvedValue({ githubId: '999' });
    expect((await (await call()).json()).me).toBeNull();
  });
});

describe('POST /api/ranking/me (갱신)', () => {
  const NOW = Date.parse('2026-11-13T12:00:00.000Z');
  const call = () =>
    refreshMyRank(
      new NextRequest('http://localhost/api/ranking/me', { method: 'POST' })
    );
  const userWithUpdatedAt = (updatedAt?: string) => ({
    docId: '3',
    data: {
      login_id: 'partykyoung',
      ...(updatedAt ? { contributions: { count: 1034, updatedAt } } : {}),
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    mocks.fetchRankingEntries.mockResolvedValue(entries);
    mocks.getToken.mockResolvedValue({ githubId: '3', loginId: 'partykyoung' });
    mocks.refreshUserContribution.mockResolvedValue(1100);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('로그인하지 않으면 401 이고 갱신하지 않는다', async () => {
    mocks.getToken.mockResolvedValue(null);
    expect((await call()).status).toBe(401);
    expect(mocks.refreshUserContribution).not.toHaveBeenCalled();
  });

  it('마지막 갱신 1분 안이면 429 와 다시 가능한 시각', async () => {
    mocks.getUserById.mockResolvedValue(
      userWithUpdatedAt(new Date(NOW - 20_000).toISOString())
    );
    const res = await call();
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('40');
    expect((await res.json()).refreshAvailableAt).toBe(NOW + 40_000);
    expect(mocks.refreshUserContribution).not.toHaveBeenCalled();
  });

  it('1분이 지났으면 새로 조회하고 다음 가능 시각을 돌려준다', async () => {
    mocks.getUserById
      .mockResolvedValueOnce(
        userWithUpdatedAt(new Date(NOW - 61_000).toISOString())
      )
      .mockResolvedValueOnce(userWithUpdatedAt(new Date(NOW).toISOString()));
    const res = await call();
    expect(res.status).toBe(200);
    expect(mocks.refreshUserContribution).toHaveBeenCalledWith(
      '3',
      'partykyoung',
      NOW
    );
    expect((await res.json()).refreshAvailableAt).toBe(NOW + 60_000);
  });

  it('GitHub 조회 실패는 502', async () => {
    mocks.getUserById.mockResolvedValue(userWithUpdatedAt());
    mocks.refreshUserContribution.mockResolvedValue(null);
    expect((await call()).status).toBe(502);
  });

  it('사용자 문서가 없으면 404', async () => {
    mocks.getUserById.mockResolvedValue(null);
    expect((await call()).status).toBe(404);
  });
});
