import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  fetchRankingEntries: vi.fn(),
  getToken: vi.fn(),
}));

vi.mock('../../../../firebase/ranking', () => ({
  fetchRankingEntries: mocks.fetchRankingEntries,
}));
vi.mock('next-auth/jwt', () => ({ getToken: mocks.getToken }));

const { GET: getRanking } = await import('./route');
const { GET: getMyRank } = await import('./me/route');

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

    expect(body.total).toBe(4);
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
    expect(body.distribution[0]).toEqual({ tier: 'Iron', count: 1 });
  });

  it('공용 캐시를 쓴다', async () => {
    const res = await getRanking();
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=600');
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
  });

  it('로그인하지 않으면 401', async () => {
    mocks.getToken.mockResolvedValue(null);
    expect((await call()).status).toBe(401);
  });

  it('본인 순위와 다음 단계를 준다(개인 캐시 금지)', async () => {
    const res = await call();
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
    expect((await res.json()).me).toMatchObject({
      rank: 3,
      total: 4,
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
