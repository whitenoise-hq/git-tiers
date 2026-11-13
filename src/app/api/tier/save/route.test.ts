import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  getContributeCount: vi.fn(),
  saveImageSettings: vi.fn(),
}));

vi.mock('next-auth/jwt', () => ({ getToken: mocks.getToken }));
vi.mock('@/utils/github', () => ({ getContributeCount: mocks.getContributeCount }));
vi.mock('../../../../../firebase/users', () => ({
  saveImageSettings: mocks.saveImageSettings,
}));

const { POST } = await import('./route');

const request = (body: unknown) =>
  new NextRequest('http://localhost/api/tier/save', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const options = { isCard: 'card', isText: 'exist', isMode: 'dark' };

describe('POST /api/tier/save', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.saveImageSettings.mockResolvedValue(undefined);
    mocks.getToken.mockResolvedValue({
      githubId: '583231',
      loginId: 'octocat',
      accessToken: 'gho_test',
    });
    mocks.getContributeCount.mockResolvedValue(1234);
  });

  it('로그인하지 않으면 401 이고 저장하지 않는다', async () => {
    mocks.getToken.mockResolvedValue(null);
    const res = await POST(request({ imageSettings: options }));
    expect(res.status).toBe(401);
    expect(mocks.saveImageSettings).not.toHaveBeenCalled();
  });

  it.each([
    ['accessToken', { githubId: '583231', loginId: 'octocat' }],
    ['githubId', { loginId: 'octocat', accessToken: 'gho_test' }],
  ])('토큰에 %s 가 없으면 401 이다', async (_missing, token) => {
    mocks.getToken.mockResolvedValue(token);
    const res = await POST(request({ imageSettings: options }));
    expect(res.status).toBe(401);
    expect(mocks.saveImageSettings).not.toHaveBeenCalled();
  });

  it('클라이언트가 보낸 contributeCount 는 무시하고 서버 조회값을 저장한다', async () => {
    const res = await POST(
      request({ imageSettings: { ...options, contributeCount: 99999, admin: true } }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, contributeCount: 1234 });
    expect(mocks.getContributeCount).toHaveBeenCalledWith({
      accessToken: 'gho_test',
      loginId: 'octocat',
    });
    expect(mocks.saveImageSettings).toHaveBeenCalledWith({
      githubId: '583231',
      login: 'octocat',
      imageSettings: { ...options, contributeCount: 1234 },
    });
  });

  it('잘못된 옵션이면 400 이고 GitHub 조회도 하지 않는다', async () => {
    const res = await POST(request({ imageSettings: { ...options, isMode: '#abcd' } }));
    expect(res.status).toBe(400);
    expect(mocks.getContributeCount).not.toHaveBeenCalled();
  });

  it('본문이 JSON 이 아니면 400 이다', async () => {
    const res = await POST(request('not-json'));
    expect(res.status).toBe(400);
  });

  it('GitHub 조회가 실패하면 502 이고 저장하지 않는다', async () => {
    mocks.getContributeCount.mockResolvedValue('ERROR');
    const res = await POST(request({ imageSettings: options }));
    expect(res.status).toBe(502);
    expect(mocks.saveImageSettings).not.toHaveBeenCalled();
  });

  it('저장이 실패하면 500 이다', async () => {
    mocks.saveImageSettings.mockRejectedValue(new Error('firestore down'));
    const res = await POST(request({ imageSettings: options }));
    expect(res.status).toBe(500);
  });
});
