import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  getContributeCount: vi.fn(),
  set: vi.fn(),
  doc: vi.fn(),
}));

vi.mock('next-auth/jwt', () => ({ getToken: mocks.getToken }));
vi.mock('@/utils/github', () => ({ getContributeCount: mocks.getContributeCount }));
vi.mock('../../../../../firebase/admin', () => ({
  usersCollection: () => ({ doc: mocks.doc }),
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
    mocks.doc.mockReturnValue({ set: mocks.set });
    mocks.set.mockResolvedValue(undefined);
    mocks.getToken.mockResolvedValue({ loginId: 'octocat', accessToken: 'gho_test' });
    mocks.getContributeCount.mockResolvedValue(1234);
  });

  it('로그인하지 않으면 401 이고 저장하지 않는다', async () => {
    mocks.getToken.mockResolvedValue(null);
    const res = await POST(request({ imageSettings: options }));
    expect(res.status).toBe(401);
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it('토큰에 accessToken 이 없으면 401 이다', async () => {
    mocks.getToken.mockResolvedValue({ loginId: 'octocat' });
    const res = await POST(request({ imageSettings: options }));
    expect(res.status).toBe(401);
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
    expect(mocks.doc).toHaveBeenCalledWith('octocat');

    const [saved, setOptions] = mocks.set.mock.calls[0];
    expect(saved.imageSettings).toEqual({ ...options, contributeCount: 1234 });
    expect(saved.imageSettings).not.toHaveProperty('admin');
    expect(setOptions).toEqual({ merge: true });
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
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it('저장이 실패하면 500 이다', async () => {
    mocks.set.mockRejectedValue(new Error('firestore down'));
    const res = await POST(request({ imageSettings: options }));
    expect(res.status).toBe(500);
  });
});
