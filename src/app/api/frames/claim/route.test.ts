import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  claimActiveFrames: vi.fn(),
}));

vi.mock('next-auth/jwt', () => ({ getToken: mocks.getToken }));
vi.mock('../../../../../firebase/frames', () => ({
  claimActiveFrames: mocks.claimActiveFrames,
}));

const { POST } = await import('./route');
const call = () =>
  POST(
    new NextRequest('http://localhost/api/frames/claim', { method: 'POST' })
  );

describe('POST /api/frames/claim', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('로그인하지 않으면 401 이고 지급하지 않는다', async () => {
    mocks.getToken.mockResolvedValue(null);
    const res = await call();
    expect(res.status).toBe(401);
    expect(mocks.claimActiveFrames).not.toHaveBeenCalled();
  });

  it('내 숫자 ID 로 받고, 새로 받은 목록을 캐시 없이 돌려준다', async () => {
    mocks.getToken.mockResolvedValue({
      githubId: '583231',
      loginId: 'octocat',
    });
    mocks.claimActiveFrames.mockResolvedValue(['xmas-2026']);
    const res = await call();
    expect(mocks.claimActiveFrames).toHaveBeenCalledWith('583231');
    expect(await res.json()).toEqual({ granted: ['xmas-2026'] });
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
  });

  it('지급이 실패하면 500', async () => {
    mocks.getToken.mockResolvedValue({ githubId: '583231' });
    mocks.claimActiveFrames.mockRejectedValue(new Error('down'));
    expect((await call()).status).toBe(500);
  });
});
