import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ findUserByLogin: vi.fn(), getContributionCount: vi.fn() }));

vi.mock('../../../../../firebase/users', () => ({
  findUserByLogin: mocks.findUserByLogin,
}));
vi.mock('../../../../../firebase/contributions', () => ({
  getContributionCount: mocks.getContributionCount,
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
    mocks.getContributionCount.mockResolvedValue(1300);
  });

  it('잘못된 아이디 형식은 400 이다', async () => {
    const res = await call('-bad-');
    expect(res.status).toBe(400);
    expect(mocks.findUserByLogin).not.toHaveBeenCalled();
  });

  it('한 번도 로그인하지 않은 사용자는 안내 배지를 200 으로 돌려준다', async () => {
    mocks.findUserByLogin.mockResolvedValue(null);
    const res = await call('octocat');
    expect(mocks.findUserByLogin).toHaveBeenCalledWith('octocat');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/svg+xml');
    expect(await res.text()).toContain('NOT RANKED YET');
  });

  it('옵션을 저장하지 않은 사용자도 기본 옵션으로 티어 배지를 그린다', async () => {
    mocks.findUserByLogin.mockResolvedValue(user({ login_id: 'octocat' }));
    const svg = await (await call('octocat')).text();
    expect(svg).toContain('DIAMOND 4');
    expect(svg).toContain('fill="#FFFFFF"'); // 기본 배경 light
  });

  it('기여 수는 저장값이 아니라 매번 getContributionCount 로 가져온다(자동 갱신)', async () => {
    const record = user({
      login_id: 'octocat',
      imageSettings: { isCard: 'card', isText: 'exist', isMode: 'dark', contributeCount: 10 },
    });
    mocks.findUserByLogin.mockResolvedValue(record);
    mocks.getContributionCount.mockResolvedValue(4800);

    const svg = await (await call('octocat')).text();
    expect(mocks.getContributionCount).toHaveBeenCalledWith(record);
    expect(svg).toContain('CHALLENGER 4');
    expect(svg).toContain('4,800');
  });

  it('기여 수를 전혀 알 수 없으면 안내 배지를 돌려준다', async () => {
    mocks.findUserByLogin.mockResolvedValue(user({ login_id: 'octocat' }));
    mocks.getContributionCount.mockResolvedValue(null);
    expect(await (await call('octocat')).text()).toContain('NOT RANKED YET');
  });

  it('README 이미지 캐시 헤더를 붙인다', async () => {
    mocks.findUserByLogin.mockResolvedValue(user({ login_id: 'octocat' }));
    const res = await call('octocat');
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=600');
  });

  it('저장한 사용자는 티어 배지를 돌려준다', async () => {
    mocks.findUserByLogin.mockResolvedValue(
      user({
        imageSettings: { isCard: 'card', isText: 'exist', isMode: 'dark' },
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
