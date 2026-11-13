import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  deleteUserData: vi.fn(),
  revokeGithubGrant: vi.fn(),
}));

vi.mock('next-auth/jwt', () => ({ getToken: mocks.getToken }));
vi.mock('../../../../firebase/users', () => ({ deleteUserData: mocks.deleteUserData }));
vi.mock('@/utils/githubOAuth', () => ({ revokeGithubGrant: mocks.revokeGithubGrant }));

const { DELETE } = await import('./route');

const call = () => DELETE(new NextRequest('http://localhost/api/account', { method: 'DELETE' }));

describe('DELETE /api/account', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getToken.mockResolvedValue({ githubId: '583231', loginId: 'octocat', accessToken: 'gho_user' });
    mocks.deleteUserData.mockResolvedValue(['583231']);
    mocks.revokeGithubGrant.mockResolvedValue(true);
  });

  it('로그인하지 않으면 401 이고 아무것도 지우지 않는다', async () => {
    mocks.getToken.mockResolvedValue(null);
    expect((await call()).status).toBe(401);
    expect(mocks.deleteUserData).not.toHaveBeenCalled();
  });

  it('내 문서를 지우고 GitHub 연결을 해제한다', async () => {
    const res = await call();
    expect(await res.json()).toEqual({ success: true, githubRevoked: true });
    expect(mocks.deleteUserData).toHaveBeenCalledWith({ githubId: '583231', login: 'octocat' });
    expect(mocks.revokeGithubGrant).toHaveBeenCalledWith('gho_user');
  });

  it('GitHub 연결 해제가 실패해도 탈퇴(삭제)는 완료로 본다', async () => {
    mocks.revokeGithubGrant.mockResolvedValue(false);
    const res = await call();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, githubRevoked: false });
  });

  it('삭제가 실패하면 500 이고 GitHub 연결은 그대로 둔다', async () => {
    mocks.deleteUserData.mockRejectedValue(new Error('firestore down'));
    expect((await call()).status).toBe(500);
    expect(mocks.revokeGithubGrant).not.toHaveBeenCalled();
  });
});
