import { describe, expect, it, vi } from 'vitest';

vi.mock('./admin', () => ({ getAdminDb: vi.fn(), usersCollection: vi.fn() }));
const { kstDateKey, recentDateKeys } = await import('./stats');

describe('kstDateKey', () => {
  it('한국 시간 기준 날짜(UTC 15:00 이후는 다음 날)', () => {
    expect(kstDateKey(Date.parse('2026-11-19T14:59:00Z'))).toBe('2026-11-19');
    expect(kstDateKey(Date.parse('2026-11-19T15:00:00Z'))).toBe('2026-11-20');
  });
});

describe('recentDateKeys', () => {
  it('오늘을 포함한 최근 n일, 오래된 날부터', () => {
    expect(recentDateKeys(3, Date.parse('2026-11-19T03:00:00Z'))).toEqual([
      '2026-11-17',
      '2026-11-18',
      '2026-11-19',
    ]);
  });
});
