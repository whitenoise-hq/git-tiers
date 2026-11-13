import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ fetchRankingEntries: vi.fn() }));

vi.mock('../../../../../firebase/ranking', () => ({
  fetchRankingEntries: mocks.fetchRankingEntries,
}));

const { GET } = await import('./route');

const call = (login: string) =>
  GET(
    new NextRequest(
      `http://localhost/api/dev/ranking-preview?login=${encodeURIComponent(login)}`
    )
  );

const entries = [
  { githubId: '1', login: 'devwoodie', count: 2736 },
  { githubId: '2', login: 'younghyundev', count: 4500 },
  { githubId: '3', login: 'abc', count: 12 },
];

describe('GET /api/dev/ranking-preview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', 'development');
    mocks.fetchRankingEntries.mockResolvedValue(entries);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('운영 모드에서는 404 이고 DB 를 읽지 않는다', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect((await call('devwoodie')).status).toBe(404);
    expect(mocks.fetchRankingEntries).not.toHaveBeenCalled();
  });

  it('올바르지 않은 아이디는 400', async () => {
    expect((await call('bad_login!')).status).toBe(400);
  });

  it('그 사람 기준으로 내 순위와 포디움 본인 표시를 준다(대소문자 무시)', async () => {
    const body = await (await call('DevWoodie')).json();
    expect(body.me).toMatchObject({ rank: 2, tierText: 'Master 2' });
    expect(body.podium.map((p: { isMe: boolean }) => p.isMe)).toEqual([
      false,
      true,
      false,
    ]);
  });

  it('랭킹에 없는 아이디면 me 는 null', async () => {
    expect((await (await call('nobody')).json()).me).toBeNull();
  });
});
