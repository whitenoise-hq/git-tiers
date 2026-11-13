import { usersCollection } from './admin';
import type { ImageOptions, ImageSettings, UserData } from '../src/types/api';

/**
 * users 컬렉션 접근을 한곳에 모은다.
 *
 * - 문서 ID: GitHub 숫자 ID (아이디를 바꿔도 데이터가 이어진다)
 * - 배지 URL 은 아이디(/api/tier/{login})라서 login_lower 로 찾는다
 * - 예전 문서(문서 ID = 아이디, github_id 필드 없음)는 로그인할 때 숫자 ID 문서로 옮기고,
 *   그 전까지는 배지 조회에서 대신 찾는다
 */

export interface UserRecord {
  readonly docId: string;
  readonly data: UserData;
}

const nowIso = () => new Date().toISOString();

/** github_id 가 없으면 아이디를 문서 ID 로 쓰던 예전 문서다(숫자로만 된 아이디도 구분된다). */
export const isLegacyUser = (data: UserData | undefined): boolean =>
  !!data && typeof data.github_id !== 'number';

const earlier = (a?: string, b?: string): string | undefined => {
  if (!a) return b;
  if (!b) return a;
  return a < b ? a : b;
};

export const getUserById = async (githubId: string): Promise<UserRecord | null> => {
  const snap = await usersCollection().doc(githubId).get();
  return snap.exists ? { docId: snap.id, data: snap.data() as UserData } : null;
};

/**
 * 배지 조회용. 아이디로 사용자를 찾는다(대소문자 무시).
 * 숫자 ID 문서에서 못 찾으면 예전 문서(문서 ID = 아이디)를 찾는다.
 */
export const findUserByLogin = async (login: string): Promise<UserRecord | null> => {
  const snap = await usersCollection()
    .where('login_lower', '==', login.toLowerCase())
    .limit(1)
    .get();

  const found = snap.docs[0];
  if (found) {
    return { docId: found.id, data: found.data() as UserData };
  }

  const legacy = await usersCollection().doc(login).get();
  const legacyData = legacy.data() as UserData | undefined;
  return legacy.exists && isLegacyUser(legacyData)
    ? { docId: legacy.id, data: legacyData as UserData }
    : null;
};

/**
 * 로그인할 때 호출한다.
 * 1) 예전 문서(문서 ID = 아이디)가 있으면 내용을 숫자 ID 문서로 합치고 예전 문서를 지운다.
 * 2) 현재 아이디와 마지막 로그인 시각을 갱신한다.
 * 3) 같은 아이디를 들고 있는 다른 사용자 문서(아이디를 바꾼 예전 주인)는 아이디를 비운다.
 */
export const upsertUserOnLogin = async ({
  githubId,
  login,
}: {
  githubId: string;
  login: string;
}): Promise<void> => {
  const users = usersCollection();
  const userRef = users.doc(githubId);
  const loginLower = login.toLowerCase();
  const now = nowIso();

  const [current, legacyCandidate] = await Promise.all([userRef.get(), users.doc(login).get()]);

  const currentData = current.exists ? (current.data() as UserData) : undefined;
  const legacyRaw = legacyCandidate.data() as UserData | undefined;
  const legacyData =
    legacyCandidate.exists && legacyCandidate.id !== githubId && isLegacyUser(legacyRaw)
      ? legacyRaw
      : undefined;

  // 두 문서가 모두 있으면 숫자 ID 문서 값을 우선하고, 없는 값(예: 저장 설정)은 예전 문서에서 채운다.
  const merged: UserData = {
    ...(legacyData ?? {}),
    ...(currentData ?? {}),
    first_login: earlier(currentData?.first_login, legacyData?.first_login) ?? now,
  };

  await userRef.set(
    {
      ...merged,
      github_id: Number(githubId),
      login_id: login,
      login_lower: loginLower,
      last_login: now,
    },
    { merge: true },
  );

  if (legacyData) {
    await legacyCandidate.ref.delete();
  }

  const sameLogin = await users.where('login_lower', '==', loginLower).get();
  await Promise.all(
    sameLogin.docs
      .filter((doc) => doc.id !== githubId)
      .map((doc) => doc.ref.set({ login_id: null, login_lower: null }, { merge: true })),
  );
};

export const getImageSettings = async (githubId: string): Promise<ImageSettings | null> => {
  const user = await getUserById(githubId);
  return user?.data.imageSettings ?? null;
};

/**
 * 표시 옵션만 저장한다(기여 수는 firebase/contributions.ts 가 따로 캐시).
 * 아이디도 함께 기록해 두어, 로그인 때 기록이 실패했더라도 배지 조회가 된다.
 */
export const saveImageSettings = async ({
  githubId,
  login,
  options,
}: {
  githubId: string;
  login: string;
  options: ImageOptions;
}): Promise<void> => {
  const imageSettings: ImageOptions = {
    isCard: options.isCard,
    isText: options.isText,
    isMode: options.isMode,
  };

  await usersCollection().doc(githubId).set(
    {
      github_id: Number(githubId),
      login_id: login,
      login_lower: login.toLowerCase(),
      lastUpdated: nowIso(),
      imageSettings,
    },
    { merge: true },
  );
};
