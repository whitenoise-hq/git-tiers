import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ findUserByLogin: vi.fn() }));

vi.mock('../../../../../firebase/users', () => ({
  findUserByLogin: mocks.findUserByLogin,
}));

const { GET } = await import('./route');

const call = (userId: string) =>
  GET(new NextRequest(`http://localhost/api/tier/${userId}`), {
    params: Promise.resolve({ userId }),
  });

const user = (data: unknown) => ({ docId: '583231', data });

describe('GET /api/tier/[userId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('잘못된 아이디 형식은 400 이다', async () => {
    const res = await call('-bad-');
    expect(res.status).toBe(400);
    expect(mocks.findUserByLogin).not.toHaveBeenCalled();
  });

  it('없는 사용자는 안내 배지를 200 으로 돌려준다', async () => {
    mocks.findUserByLogin.mockResolvedValue(null);
    const res = await call('octocat');
    expect(mocks.findUserByLogin).toHaveBeenCalledWith('octocat');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/svg+xml');
    expect(await res.text()).toContain('NOT RANKED YET');
  });

  it('설정을 저장하지 않은 사용자도 안내 배지를 돌려준다', async () => {
    mocks.findUserByLogin.mockResolvedValue(user({ login_id: 'octocat' }));
    const res = await call('octocat');
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('NOT RANKED YET');
  });

  it('저장한 사용자는 티어 배지를 돌려준다', async () => {
    mocks.findUserByLogin.mockResolvedValue(
      user({
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
    mocks.findUserByLogin.mockRejectedValue(new Error('firestore down'));
    const res = await call('octocat');
    expect(res.status).toBe(500);
  });
});
