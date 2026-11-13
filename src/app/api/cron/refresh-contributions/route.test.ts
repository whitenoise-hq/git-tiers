import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ refreshAllContributions: vi.fn() }));

vi.mock('../../../../../firebase/contributions', () => ({
  refreshAllContributions: mocks.refreshAllContributions,
}));

const { GET } = await import('./route');

const call = (authorization?: string) =>
  GET(
    new NextRequest('http://localhost/api/cron/refresh-contributions', {
      headers: authorization ? { authorization } : {},
    })
  );

describe('GET /api/cron/refresh-contributions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CRON_SECRET', 'cron-secret');
    mocks.refreshAllContributions.mockResolvedValue({
      updated: 3,
      failed: 0,
      skipped: 1,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('비밀값이 없거나 틀리면 401 이고 실행하지 않는다', async () => {
    expect((await call()).status).toBe(401);
    expect((await call('Bearer wrong')).status).toBe(401);
    expect(mocks.refreshAllContributions).not.toHaveBeenCalled();
  });

  it('CRON_SECRET 이 설정되지 않았으면 항상 401', async () => {
    vi.stubEnv('CRON_SECRET', '');
    expect((await call('Bearer ')).status).toBe(401);
  });

  it('맞으면 전체 갱신 결과를 돌려준다', async () => {
    const res = await call('Bearer cron-secret');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ updated: 3, failed: 0, skipped: 1 });
  });

  it('갱신 중 오류는 500', async () => {
    mocks.refreshAllContributions.mockRejectedValue(new Error('no token'));
    expect((await call('Bearer cron-secret')).status).toBe(500);
  });
});
