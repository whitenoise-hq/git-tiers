import { describe, expect, it, vi } from 'vitest';

vi.mock('./admin', () => ({ usersCollection: vi.fn() }));
const { toAdminUserRows } = await import('./adminUsers');

describe('toAdminUserRows', () => {
  it('티어 · 순위 · 설정을 채우고, 기여 수가 없으면 순위도 없다', () => {
    const rows = toAdminUserRows([
      {
        id: '1',
        data: {
          login_id: 'devwoodie',
          first_login: '2025-01-01T00:00:00.000Z',
          contributions: { count: 2736, updatedAt: '2026-11-19T00:00:00.000Z' },
          imageSettings: { isCard: 'compact', isText: 'exist', isMode: 'dark' },
        },
      },
      {
        id: '2',
        data: {
          login_id: 'top',
          contributions: { count: 5000, updatedAt: 'x' },
        },
      },
      { id: '3', data: { login_id: 'newbie' } },
    ]);

    expect(rows[0]).toMatchObject({
      githubId: '1',
      login: 'devwoodie',
      contributions: 2736,
      tierText: 'Master 2',
      rank: 2,
      imageSettings: { isCard: 'compact', isText: 'exist', isMode: 'dark' },
    });
    expect(rows[1].rank).toBe(1);
    expect(rows[2]).toMatchObject({
      contributions: null,
      tierText: null,
      rank: null,
    });
  });
});
