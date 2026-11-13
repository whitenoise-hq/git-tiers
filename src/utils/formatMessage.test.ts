import { describe, expect, it } from 'vitest';
import { formatMessage } from './formatMessage';

describe('formatMessage', () => {
  it('자리 표시자를 값으로 바꾼다', () => {
    expect(formatMessage('{total}명 중 {rank}위', { total: 10, rank: 4 })).toBe(
      '10명 중 4위'
    );
  });

  it('없는 값은 그대로 둔다', () => {
    expect(formatMessage('{a} {b}', { a: 1 })).toBe('1 {b}');
  });
});
