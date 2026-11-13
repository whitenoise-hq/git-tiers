import { usersCollection } from './admin';
import { isLegacyUser, type UserRecord } from './users';
import { getContributeCount } from '../src/utils/github';

/**
 * 기여 수 자동 갱신.
 *
 * 배지·마이페이지 모두 서버 토큰(GITHUB_TOKEN)으로 GitHub 를 조회해, GitHub 프로필에 보이는 숫자와 같게 맞춘다.
 * 배지는 README 가 열릴 때마다 요청되므로 결과를 users 문서에 캐시하고, TTL 이 지나면 다시 조회한다.
 */

/** 이 시간 안에 조회한 값은 다시 조회하지 않는다. */
export const CONTRIBUTIONS_TTL_MS = 3 * 60 * 60 * 1000;

/** 문서에서 조회에 쓸 GitHub 아이디. 예전 문서는 문서 ID 가 아이디다. */
const loginOf = (user: UserRecord): string | null =>
  user.data.login_id ?? (isLegacyUser(user.data) ? user.docId : null);

/** 캐시가 만료됐거나 조회에 실패했을 때 쓸 마지막 값 */
const lastKnownCount = (user: UserRecord): number | null =>
  user.data.contributions?.count ?? user.data.imageSettings?.contributeCount ?? null;

const isFresh = (updatedAt: string | undefined, now: number): boolean => {
  if (!updatedAt) return false;
  const time = Date.parse(updatedAt);
  return Number.isFinite(time) && now - time < CONTRIBUTIONS_TTL_MS;
};

/**
 * 사용자의 최근 1년 기여 수. 캐시가 신선하면 캐시를, 아니면 GitHub 를 조회해 캐시를 갱신한다.
 * 조회에 실패하면 마지막으로 알던 값을 쓰고, 그것도 없으면 null.
 */
export const getContributionCount = async (
  user: UserRecord,
  now: number = Date.now(),
): Promise<number | null> => {
  const cached = user.data.contributions;
  if (cached && isFresh(cached.updatedAt, now)) {
    return cached.count;
  }

  const login = loginOf(user);
  const serverToken = process.env.GITHUB_TOKEN;
  if (!login || !serverToken) {
    return lastKnownCount(user);
  }

  const count = await getContributeCount({ accessToken: serverToken, loginId: login });
  if (count === 'ERROR') {
    return lastKnownCount(user);
  }

  try {
    await usersCollection()
      .doc(user.docId)
      .set({ contributions: { count, updatedAt: new Date(now).toISOString() } }, { merge: true });
  } catch {
    // 캐시 저장에 실패해도 조회한 값은 돌려준다.
  }

  return count;
};
