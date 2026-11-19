import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  getDailyStats: vi.fn(),
  getTotals: vi.fn(),
  getLastRefresh: vi.fn(),
}));

vi.mock('next-auth/jwt', () => ({ getToken: mocks.getToken }));
vi.mock('../../../../../firebase/stats', () => ({
  getDailyStats: mocks.getDailyStats,
  getTotals: mocks.getTotals,
  getLastRefresh: mocks.getLastRefresh,
}));

const { GET } = await import('./route');
const call = () => GET(new NextRequest('http://localhost/api/admin/stats'));

describe('GET /api/admin/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('ADMIN_GITHUB_IDS', '86578755');
    mocks.getDailyStats.mockResolvedValue([
      { date: '2026-11-19', badgeVisits: 3, signups: 1 },
    ]);
    mocks.getTotals.mockResolvedValue({ users: 12, ranked: 10 });
    mocks.getLastRefresh.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('로그인하지 않았으면 404 이고 통계를 읽지 않는다', async () => {
    mocks.getToken.mockResolvedValue(null);
    expect((await call()).status).toBe(404);
    expect(mocks.getTotals).not.toHaveBeenCalled();
  });

  it('관리자가 아닌 사용자도 404', async () => {
    mocks.getToken.mockResolvedValue({ githubId: '1', loginId: 'someone' });
    expect((await call()).status).toBe(404);
  });

  it('관리자 목록이 비어 있으면 아무도 볼 수 없다', async () => {
    vi.stubEnv('ADMIN_GITHUB_IDS', '');
    mocks.getToken.mockResolvedValue({ githubId: '86578755' });
    expect((await call()).status).toBe(404);
  });

  it('관리자는 통계를 받는다(캐시 금지)', async () => {
    mocks.getToken.mockResolvedValue({
      githubId: '86578755',
      loginId: 'devwoodie',
    });
    const res = await call();
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
    expect(await res.json()).toEqual({
      daily: [{ date: '2026-11-19', badgeVisits: 3, signups: 1 }],
      totals: { users: 12, ranked: 10 },
      lastRefresh: null,
    });
  });
});
