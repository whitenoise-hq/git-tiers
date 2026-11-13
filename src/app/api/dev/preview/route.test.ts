import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  findUserByLogin: vi.fn(),
  getContributeCount: vi.fn(),
}));

vi.mock('../../../../../firebase/users', () => ({ findUserByLogin: mocks.findUserByLogin }));
vi.mock('@/utils/github', () => ({ getContributeCount: mocks.getContributeCount }));

const { GET } = await import('./route');

const call = (login: string) =>
  GET(new NextRequest(`http://localhost/api/dev/preview?login=${encodeURIComponent(login)}`));

const githubUser = {
  login: 'octocat',
  name: 'The Octocat',
  avatar_url: 'https://avatars.githubusercontent.com/u/583231',
  email: null,
  company: '@github',
  location: 'San Francisco',
  bio: null,
};

describe('GET /api/dev/preview', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('GITHUB_TOKEN', 'server-token');
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue(new Response(JSON.stringify(githubUser), { status: 200 }));
    mocks.getContributeCount.mockResolvedValue(321);
    mocks.findUserByLogin.mockResolvedValue({
      docId: '583231',
      data: { imageSettings: { isCard: 'image', isText: 'none', isMode: 'dark', lastUpdated: 'x' } },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('운영 모드에서는 404 이고 아무것도 조회하지 않는다', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect((await call('octocat')).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mocks.findUserByLogin).not.toHaveBeenCalled();
  });

  it('올바르지 않은 아이디는 400', async () => {
    expect((await call('bad_login!')).status).toBe(400);
    expect((await call('-start')).status).toBe(400);
  });

  it('GITHUB_TOKEN 이 없으면 500', async () => {
    vi.stubEnv('GITHUB_TOKEN', '');
    expect((await call('octocat')).status).toBe(500);
  });

  it('프로필·기여 수·저장된 표시 옵션을 돌려준다', async () => {
    const res = await call('octocat');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      profile: {
        loginId: 'octocat',
        name: 'The Octocat',
        image: githubUser.avatar_url,
        email: '',
        company: '@github',
        location: 'San Francisco',
        bio: null,
      },
      contributions: 321,
      imageSettings: { isCard: 'image', isText: 'none', isMode: 'dark' },
    });
    expect(mocks.getContributeCount).toHaveBeenCalledWith({
      accessToken: 'server-token',
      loginId: 'octocat',
    });
  });

  it('DB 에 없거나 DB 조회가 실패해도 프로필은 보여준다', async () => {
    mocks.findUserByLogin.mockRejectedValue(new Error('no firebase'));
    const res = await call('octocat');
    expect(res.status).toBe(200);
    expect((await res.json()).imageSettings).toBeNull();
  });

  it('기여 수 조회가 실패하면 contributions 는 null', async () => {
    mocks.getContributeCount.mockResolvedValue('ERROR');
    expect((await (await call('octocat')).json()).contributions).toBeNull();
  });

  it('GitHub 에 없는 아이디는 404', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 404 }));
    expect((await call('nobody')).status).toBe(404);
  });

  it('GitHub API 오류는 502', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 403 }));
    expect((await call('octocat')).status).toBe(502);
  });
});
