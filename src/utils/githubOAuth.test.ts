import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { revokeGithubGrant } from './githubOAuth';

describe('revokeGithubGrant', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv('GITHUB_CLIENT_ID', 'client-id');
    vi.stubEnv('GITHUB_CLIENT_SECRET', 'client-secret');
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('앱 인증 정보로 grant 삭제를 요청한다', async () => {
    fetchMock.mockResolvedValue({ status: 204 });
    expect(await revokeGithubGrant('gho_user')).toBe(true);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.github.com/applications/client-id/grant');
    expect(init.method).toBe('DELETE');
    expect(init.headers.Authorization).toBe(
      `Basic ${Buffer.from('client-id:client-secret').toString('base64')}`,
    );
    expect(JSON.parse(init.body)).toEqual({ access_token: 'gho_user' });
  });

  it('이미 해제된 토큰(404)도 해제된 것으로 본다', async () => {
    fetchMock.mockResolvedValue({ status: 404 });
    expect(await revokeGithubGrant('gho_user')).toBe(true);
  });

  it('그 밖의 응답이나 네트워크 오류는 false', async () => {
    fetchMock.mockResolvedValueOnce({ status: 422 });
    expect(await revokeGithubGrant('gho_user')).toBe(false);
    fetchMock.mockRejectedValueOnce(new Error('network'));
    expect(await revokeGithubGrant('gho_user')).toBe(false);
  });

  it('토큰이나 앱 설정이 없으면 요청하지 않는다', async () => {
    expect(await revokeGithubGrant('')).toBe(false);
    vi.stubEnv('GITHUB_CLIENT_SECRET', '');
    expect(await revokeGithubGrant('gho_user')).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
