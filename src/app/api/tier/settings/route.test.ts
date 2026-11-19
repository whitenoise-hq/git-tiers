import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  getUserById: vi.fn(),
  saveImageSettings: vi.fn(),
}));

vi.mock('next-auth/jwt', () => ({ getToken: mocks.getToken }));
vi.mock('../../../../../firebase/users', () => ({
  getUserById: mocks.getUserById,
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
/** 저장 · 응답은 테두리 칸(frame)을 늘 채운다 */
const saved = { ...options, frame: null };
const userWith = (data: Record<string, unknown>) => ({ docId: '583231', data });

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

    it('표시 옵션과 가진 테두리만 돌려준다(예전에 저장된 기여 수 · 모르는 테두리는 빼고)', async () => {
      mocks.getUserById.mockResolvedValue(
        userWith({
          imageSettings: { ...options, frame: 'xmas-2026', contributeCount: 999 },
          frames: ['xmas-2026', 'unknown'],
        }),
      );
      const res = await GET(new NextRequest(url));
      expect(await res.json()).toEqual({
        imageSettings: { ...options, frame: 'xmas-2026' },
        frames: ['xmas-2026'],
      });
      expect(mocks.getUserById).toHaveBeenCalledWith('583231');
    });

    it('저장한 적이 없으면 null · 빈 테두리 목록', async () => {
      mocks.getUserById.mockResolvedValue(null);
      expect(await (await GET(new NextRequest(url))).json()).toEqual({
        imageSettings: null,
        frames: [],
      });
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
        options: saved,
      });
    });

    it('기여 수 등 다른 필드를 보내도 표시 옵션만 저장한다', async () => {
      await post({ imageSettings: { ...options, contributeCount: 99999, admin: true } });
      expect(mocks.saveImageSettings).toHaveBeenCalledWith({
        githubId: '583231',
        login: 'octocat',
        options: saved,
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

    it('가진 테두리는 끼워서 저장한다', async () => {
      mocks.getUserById.mockResolvedValue(userWith({ frames: ['xmas-2026'] }));
      const res = await post({ imageSettings: { ...options, frame: 'xmas-2026' } });
      expect(res.status).toBe(200);
      expect(mocks.saveImageSettings).toHaveBeenCalledWith({
        githubId: '583231',
        login: 'octocat',
        options: { ...options, frame: 'xmas-2026' },
      });
    });

    it('받지 않은 테두리는 403 이고 저장하지 않는다', async () => {
      mocks.getUserById.mockResolvedValue(userWith({ frames: [] }));
      expect((await post({ imageSettings: { ...options, frame: 'xmas-2026' } })).status).toBe(403);
      expect(mocks.saveImageSettings).not.toHaveBeenCalled();
    });

    it('없는 테두리 id 는 400', async () => {
      expect((await post({ imageSettings: { ...options, frame: 'gold' } })).status).toBe(400);
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
