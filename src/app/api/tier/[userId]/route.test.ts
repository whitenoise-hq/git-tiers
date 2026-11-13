import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ get: vi.fn(), doc: vi.fn() }));

vi.mock('../../../../../firebase/admin', () => ({
  usersCollection: () => ({ doc: mocks.doc }),
}));

const { GET } = await import('./route');

const call = (userId: string) =>
  GET(new NextRequest(`http://localhost/api/tier/${userId}`), {
    params: Promise.resolve({ userId }),
  });

const snapshot = (data: unknown) => ({ exists: data !== undefined, data: () => data });

describe('GET /api/tier/[userId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.doc.mockReturnValue({ get: mocks.get });
  });

  it('잘못된 아이디 형식은 400 이다', async () => {
    const res = await call('-bad-');
    expect(res.status).toBe(400);
    expect(mocks.doc).not.toHaveBeenCalled();
  });

  it('없는 사용자는 안내 배지를 200 으로 돌려준다', async () => {
    mocks.get.mockResolvedValue(snapshot(undefined));
    const res = await call('octocat');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/svg+xml');
    expect(await res.text()).toContain('NOT RANKED YET');
  });

  it('설정을 저장하지 않은 사용자도 안내 배지를 돌려준다', async () => {
    mocks.get.mockResolvedValue(snapshot({ login_id: 'octocat' }));
    const res = await call('octocat');
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('NOT RANKED YET');
  });

  it('저장한 사용자는 티어 배지를 돌려준다', async () => {
    mocks.get.mockResolvedValue(
      snapshot({
        imageSettings: { isCard: 'card', isText: 'exist', isMode: 'dark', contributeCount: 1300 },
      }),
    );
    const res = await call('octocat');
    const svg = await res.text();
    expect(res.status).toBe(200);
    expect(svg).toContain('DIAMOND 4');
    expect(svg).toContain('1,300');
  });

  it('조회 중 오류가 나면 500 이다', async () => {
    mocks.get.mockRejectedValue(new Error('firestore down'));
    const res = await call('octocat');
    expect(res.status).toBe(500);
  });
});
