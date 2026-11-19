import { describe, expect, it } from 'vitest';
import {
  activeFrameIds,
  isFrameId,
  ownedFrameIds,
  supportsFrame,
} from './catalog';

describe('activeFrameIds', () => {
  it('크리스마스 리스는 한국 시간 12월 1일 0시부터 12월 25일 24시 전까지 지급한다', () => {
    expect(activeFrameIds(Date.parse('2026-11-30T23:59:59+09:00'))).toEqual([]);
    expect(activeFrameIds(Date.parse('2026-12-01T00:00:00+09:00'))).toEqual([
      'xmas-2026',
    ]);
    expect(activeFrameIds(Date.parse('2026-12-25T23:59:59+09:00'))).toEqual([
      'xmas-2026',
    ]);
    expect(activeFrameIds(Date.parse('2026-12-26T00:00:00+09:00'))).toEqual([]);
  });
});

describe('ownedFrameIds', () => {
  it('아는 테두리만 남기고 배열이 아니면 빈 목록', () => {
    expect(ownedFrameIds(['unknown', 'xmas-2026'])).toEqual(['xmas-2026']);
    expect(ownedFrameIds(undefined)).toEqual([]);
    expect(ownedFrameIds('xmas-2026')).toEqual([]);
  });
});

describe('isFrameId · supportsFrame', () => {
  it('테두리 id 를 구분하고, 작은 배지는 테두리를 두르지 않는다', () => {
    expect(isFrameId('xmas-2026')).toBe(true);
    expect(isFrameId('gold')).toBe(false);
    expect(supportsFrame('card')).toBe(true);
    expect(supportsFrame('image')).toBe(true);
    expect(supportsFrame('compact')).toBe(false);
  });
});
