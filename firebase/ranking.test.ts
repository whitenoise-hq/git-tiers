import { describe, expect, it, vi } from 'vitest';

vi.mock('./admin', () => ({ usersCollection: vi.fn() }));

const { toRankingEntries } = await import('./ranking');

describe('toRankingEntries', () => {
  it('아이디와 기여 수가 모두 있는 문서만 랭킹 대상으로 바꾼다', () => {
    expect(
      toRankingEntries([
        {
          id: '1',
          data: {
            login_id: 'a',
            contributions: { count: 10, updatedAt: 'x' },
            first_login: 'f',
          },
        },
        { id: '2', data: { login_id: 'b' } },
        {
          id: '3',
          data: { login_id: null, contributions: { count: 5, updatedAt: 'x' } },
        },
        {
          id: '4',
          data: { login_id: 'd', contributions: { count: 0, updatedAt: 'x' } },
        },
      ])
    ).toEqual([
      { githubId: '1', login: 'a', count: 10, firstLogin: 'f' },
      { githubId: '4', login: 'd', count: 0, firstLogin: undefined },
    ]);
  });
});
