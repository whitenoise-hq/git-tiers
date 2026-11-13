import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  getUserById: vi.fn(),
  getContributionCount: vi.fn(),
}));

vi.mock('next-auth/jwt', () => ({ getToken: mocks.getToken }));
vi.mock('../../../../../firebase/users', () => ({ getUserById: mocks.getUserById }));
vi.mock('../../../../../firebase/contributions', () => ({
  getContributionCount: mocks.getContributionCount,
}));

const { GET } = await import('./route');

const call = () => GET(new NextRequest('http://localhost/api/github/contributions'));

describe('GET /api/github/contributions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getToken.mockResolvedValue({ githubId: '583231', loginId: 'octocat' });
    mocks.getContributionCount.mockResolvedValue(1234);
  });

  it('로그인하지 않으면 401', async () => {
    mocks.getToken.mockResolvedValue(null);
    expect((await call()).status).toBe(401);
  });

  it('배지와 같은 함수로 기여 수를 가져온다', async () => {
    const record = { docId: '583231', data: { login_id: 'octocat' } };
    mocks.getUserById.mockResolvedValue(record);
    const res = await call();
    expect(await res.json()).toEqual({ contributions: 1234 });
    expect(mocks.getContributionCount).toHaveBeenCalledWith(record);
  });

  it('사용자 문서가 없으면 토큰의 아이디로 조회한다', async () => {
    mocks.getUserById.mockResolvedValue(null);
    await call();
    expect(mocks.getContributionCount).toHaveBeenCalledWith({
      docId: '583231',
      data: { github_id: 583231, login_id: 'octocat' },
    });
  });

  it('기여 수를 알 수 없으면 502', async () => {
    mocks.getUserById.mockResolvedValue(null);
    mocks.getContributionCount.mockResolvedValue(null);
    expect((await call()).status).toBe(502);
  });
});
