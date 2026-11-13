import { describe, expect, it } from 'vitest';
import { isValidImageOptions } from './api';

const valid = { isCard: 'card', isText: 'exist', isMode: 'light' };

describe('isValidImageOptions', () => {
  it('기본 옵션을 통과시킨다', () => {
    expect(isValidImageOptions(valid)).toBe(true);
  });

  it.each(['#abc', '#A1B2C3'])('사용자 색상 %s 를 통과시킨다', (isMode) => {
    expect(isValidImageOptions({ ...valid, isMode })).toBe(true);
  });

  it.each(['#abcd', '#abcde', '#abcdef0', 'abc', '#ggg', 'purple', '"/><script>'])(
    '잘못된 색상 %s 는 거절한다',
    (isMode) => {
      expect(isValidImageOptions({ ...valid, isMode })).toBe(false);
    },
  );

  it.each([null, undefined, 'card', 1, []])('객체가 아닌 값 %j 는 거절한다', (value) => {
    expect(isValidImageOptions(value)).toBe(false);
  });

  it('카드 유형·텍스트 표시 값이 허용 목록 밖이면 거절한다', () => {
    expect(isValidImageOptions({ ...valid, isCard: 'poster' })).toBe(false);
    expect(isValidImageOptions({ ...valid, isText: 'maybe' })).toBe(false);
  });
});
