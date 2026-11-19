import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  listUsersForAdmin: vi.fn(),
}));
vi.mock('next-auth/jwt', () => ({ getToken: mocks.getToken }));
vi.mock('../../../../../firebase/adminUsers', () => ({
  listUsersForAdmin: mocks.listUsersForAdmin,
}));

const { GET } = await import('./route');
const call = () => GET(new NextRequest('http://localhost/api/admin/users'));

describe('GET /api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('ADMIN_GITHUB_IDS', '86578755');
    mocks.listUsersForAdmin.mockResolvedValue([{ githubId: '1', login: 'a' }]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('관리자가 아니면 404 이고 사용자 목록을 읽지 않는다', async () => {
    mocks.getToken.mockResolvedValue({ githubId: '1' });
    expect((await call()).status).toBe(404);
    mocks.getToken.mockResolvedValue(null);
    expect((await call()).status).toBe(404);
    expect(mocks.listUsersForAdmin).not.toHaveBeenCalled();
  });

  it('관리자는 목록을 받는다(캐시 금지)', async () => {
    mocks.getToken.mockResolvedValue({ githubId: '86578755' });
    const res = await call();
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
    expect(await res.json()).toEqual({
      users: [{ githubId: '1', login: 'a' }],
    });
  });
});
