/**
 * 관리자 판정 — GitHub 숫자 ID 로만 확인한다(아이디는 바꿀 수 있어서 쓰지 않는다).
 * 관리자 목록은 환경 변수 ADMIN_GITHUB_IDS (쉼표로 구분, 예: "86578755").
 */
export const parseAdminIds = (raw: string | undefined): ReadonlySet<string> =>
  new Set(
    (raw ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter((id) => /^\d+$/.test(id))
  );

export const isAdminGithubId = (
  githubId: unknown,
  raw: string | undefined = process.env.ADMIN_GITHUB_IDS
): boolean => typeof githubId === 'string' && parseAdminIds(raw).has(githubId);
