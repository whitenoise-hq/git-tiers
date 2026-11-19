import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, Record<string, unknown>>();
const update = vi.fn(async (id: string, data: Record<string, unknown>) => {
  const union = data.frames as { values: string[] };
  const prev = (store.get(id)?.frames as string[] | undefined) ?? [];
  store.set(id, {
    ...store.get(id),
    frames: [...prev, ...union.values.filter((v) => !prev.includes(v))],
  });
});

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { arrayUnion: (...values: string[]) => ({ values }) },
}));
vi.mock('./admin', () => ({
  usersCollection: () => ({
    doc: (id: string) => ({
      get: async () => ({ exists: store.has(id), data: () => store.get(id) }),
      update: (data: Record<string, unknown>) => update(id, data),
    }),
  }),
}));

const { claimActiveFrames, getOwnedFrames } = await import('./frames');

const DURING = Date.parse('2026-12-10T12:00:00+09:00');
const BEFORE = Date.parse('2026-11-19T12:00:00+09:00');

describe('claimActiveFrames', () => {
  beforeEach(() => {
    store.clear();
    update.mockClear();
  });

  it('이벤트 기간이 아니면 DB 를 건드리지 않는다', async () => {
    store.set('1', {});
    expect(await claimActiveFrames('1', BEFORE)).toEqual([]);
    expect(update).not.toHaveBeenCalled();
  });

  it('기간 안에 처음 오면 테두리를 받고, 두 번째부터는 다시 주지 않는다', async () => {
    store.set('1', { login_id: 'octocat' });
    expect(await claimActiveFrames('1', DURING)).toEqual(['xmas-2026']);
    expect(await claimActiveFrames('1', DURING)).toEqual([]);
    expect(update).toHaveBeenCalledTimes(1);
    expect(await getOwnedFrames('1')).toEqual(['xmas-2026']);
  });

  it('가입하지 않은 사용자(문서 없음)는 받지 않는다', async () => {
    expect(await claimActiveFrames('2', DURING)).toEqual([]);
    expect(update).not.toHaveBeenCalled();
  });
});
