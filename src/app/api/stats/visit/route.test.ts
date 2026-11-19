import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ incrementDaily: vi.fn() }));
vi.mock('../../../../../firebase/stats', () => ({
  incrementDaily: mocks.incrementDaily,
}));

const { POST } = await import('./route');
const call = (body: string) =>
  POST(
    new NextRequest('http://localhost/api/stats/visit', {
      method: 'POST',
      body,
    })
  );

describe('POST /api/stats/visit', () => {
  beforeEach(() => vi.clearAllMocks());

  it('ref=badge 면 배지 유입을 1 올린다', async () => {
    expect((await call(JSON.stringify({ ref: 'badge' }))).status).toBe(204);
    expect(mocks.incrementDaily).toHaveBeenCalledWith('badgeVisits');
  });

  it('다른 값이나 깨진 본문은 세지 않는다', async () => {
    expect((await call(JSON.stringify({ ref: 'other' }))).status).toBe(400);
    expect((await call('not json')).status).toBe(400);
    expect(mocks.incrementDaily).not.toHaveBeenCalled();
  });
});
