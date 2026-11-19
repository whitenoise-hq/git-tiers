import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  getImageSettings: vi.fn(),
  saveImageSettings: vi.fn(),
}));

vi.mock('next-auth/jwt', () => ({ getToken: mocks.getToken }));
vi.mock('../../../../../firebase/users', () => ({
  getImageSettings: mocks.getImageSettings,
  saveImageSettings: mocks.saveImageSettings,
}));

const { GET, POST } = await import('./route');

const url = 'http://localhost/api/tier/settings';
const post = (body: unknown) =>
  POST(
    new NextRequest(url, {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );

const options = { isCard: 'card', isText: 'none', isMode: '#1a2b3c' };

describe('/api/tier/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getToken.mockResolvedValue({ githubId: '583231', loginId: 'octocat' });
    mocks.saveImageSettings.mockResolvedValue(undefined);
  });

  describe('GET', () => {
    it('로그인하지 않으면 401', async () => {
      mocks.getToken.mockResolvedValue(null);
      expect((await GET(new NextRequest(url))).status).toBe(401);
    });

    it('표시 옵션만 돌려준다(예전에 저장된 기여 수는 빼고)', async () => {
      mocks.getImageSettings.mockResolvedValue({ ...options, contributeCount: 999 });
      const res = await GET(new NextRequest(url));
      expect(await res.json()).toEqual({ imageSettings: options });
      expect(mocks.getImageSettings).toHaveBeenCalledWith('583231');
    });

    it('저장한 적이 없으면 null', async () => {
      mocks.getImageSettings.mockResolvedValue(null);
      expect(await (await GET(new NextRequest(url))).json()).toEqual({ imageSettings: null });
    });
  });

  describe('POST', () => {
    it('로그인하지 않으면 401 이고 저장하지 않는다', async () => {
      mocks.getToken.mockResolvedValue({ loginId: 'octocat' });
      expect((await post({ imageSettings: options })).status).toBe(401);
      expect(mocks.saveImageSettings).not.toHaveBeenCalled();
    });

    it('표시 옵션을 저장한다(텍스트 숨김 none 포함)', async () => {
      const res = await post({ imageSettings: options });
      expect(res.status).toBe(200);
      expect(mocks.saveImageSettings).toHaveBeenCalledWith({
        githubId: '583231',
        login: 'octocat',
        options,
      });
    });

    it('기여 수 등 다른 필드를 보내도 표시 옵션만 저장한다', async () => {
      await post({ imageSettings: { ...options, contributeCount: 99999, admin: true } });
      expect(mocks.saveImageSettings).toHaveBeenCalledWith({
        githubId: '583231',
        login: 'octocat',
        options,
      });
    });

    it.each([
      ['잘못된 색상', { imageSettings: { ...options, isMode: '#abcd' } }],
      ['예전 숨김 값 delete', { imageSettings: { ...options, isText: 'delete' } }],
      ['옵션 없음', {}],
    ])('%s 이면 400', async (_label, body) => {
      expect((await post(body)).status).toBe(400);
      expect(mocks.saveImageSettings).not.toHaveBeenCalled();
    });

    it('본문이 JSON 이 아니면 400', async () => {
      expect((await post('not-json')).status).toBe(400);
    });

    it('저장이 실패하면 500', async () => {
      mocks.saveImageSettings.mockRejectedValue(new Error('firestore down'));
      expect((await post({ imageSettings: options })).status).toBe(500);
    });
  });
});
