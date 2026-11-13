import { afterEach, describe, expect, it, vi } from 'vitest';
import { isDevPreviewEnabled, parsePreviewLogin } from './devPreview';

describe('parsePreviewLogin', () => {
  it.each(['octocat', 'devwoodie', 'KIM-JU-BIN', 'a', 'a'.repeat(39)])('%s 는 허용', (login) => {
    expect(parsePreviewLogin(login)).toBe(login);
  });

  it.each([null, undefined, '', '-start', 'end-', 'bad_login', 'has space', '../etc', 'a'.repeat(40)])(
    '%s 는 거부',
    (login) => {
      expect(parsePreviewLogin(login)).toBeNull();
    },
  );
});

describe('isDevPreviewEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('development 에서만 켜진다', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(isDevPreviewEnabled()).toBe(true);
    vi.stubEnv('NODE_ENV', 'production');
    expect(isDevPreviewEnabled()).toBe(false);
    vi.stubEnv('NODE_ENV', 'test');
    expect(isDevPreviewEnabled()).toBe(false);
  });
});
