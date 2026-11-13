/**
 * 사용자가 이 OAuth 앱에 준 권한(grant)을 취소한다.
 * 취소하면 다음 로그인 때 GitHub 동의 화면이 처음처럼 다시 뜬다.
 * https://docs.github.com/en/rest/apps/oauth-applications#delete-an-app-authorization
 */
export const revokeGithubGrant = async (accessToken: string): Promise<boolean> => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret || !accessToken) return false;

  try {
    const res = await fetch(`https://api.github.com/applications/${clientId}/grant`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token: accessToken }),
    });
    // 204: 취소됨, 404: 이미 취소됐거나 만료된 토큰 — 둘 다 연결이 끊긴 상태다.
    return res.status === 204 || res.status === 404;
  } catch {
    return false;
  }
};
