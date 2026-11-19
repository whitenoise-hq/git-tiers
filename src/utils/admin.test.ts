import { describe, expect, it } from 'vitest';
import { isAdminGithubId, parseAdminIds } from './admin';

describe('parseAdminIds', () => {
  it('쉼표로 나누고 숫자 ID 만 남긴다', () => {
    expect([...parseAdminIds(' 86578755, abc ,123,')]).toEqual([
      '86578755',
      '123',
    ]);
  });

  it('비어 있으면 아무도 관리자가 아니다', () => {
    expect(parseAdminIds(undefined).size).toBe(0);
    expect(parseAdminIds('').size).toBe(0);
  });
});

describe('isAdminGithubId', () => {
  it('목록에 있는 숫자 ID 만 관리자', () => {
    expect(isAdminGithubId('86578755', '86578755')).toBe(true);
    expect(isAdminGithubId('1', '86578755')).toBe(false);
  });

  it('아이디 문자열이나 다른 타입은 관리자가 아니다', () => {
    expect(isAdminGithubId('devwoodie', 'devwoodie')).toBe(false);
    expect(isAdminGithubId(86578755, '86578755')).toBe(false);
    expect(isAdminGithubId(undefined, '86578755')).toBe(false);
  });
});
