/**
 * 개발 모드 전용 마이페이지 미리보기(/my?preview=<GitHub 아이디>).
 * 로컬에서 로그인 없이 다른 사용자의 마이페이지를 읽기 전용으로 확인할 때 쓴다.
 * 운영(production) 빌드에서는 항상 꺼진다.
 */

export const DEV_PREVIEW_PARAM = 'preview';

/** GitHub 아이디 규칙: 영문·숫자·하이픈, 1~39자, 하이픈으로 시작·끝나지 않음 */
const GITHUB_LOGIN_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export const isDevPreviewEnabled = (): boolean =>
  process.env.NODE_ENV === 'development';

/** 올바른 GitHub 아이디면 그대로, 아니면 null */
export const parsePreviewLogin = (
  value: string | null | undefined
): string | null => (value && GITHUB_LOGIN_REGEX.test(value) ? value : null);
