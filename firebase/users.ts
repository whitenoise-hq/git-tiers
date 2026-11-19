import { usersCollection } from './admin';
import type { ImageOptions, ImageSettings, UserData } from '../src/types/api';

/**
 * users 컬렉션 접근을 한곳에 모은다.
 *
 * - 문서 ID: GitHub 숫자 ID (아이디를 바꿔도 데이터가 이어진다)
 * - 배지 URL 은 아이디(/api/tier/{login})라서 login_lower 로 찾는다
 * (예전 아이디 키 문서는 2026-11-13 에 모두 숫자 ID 문서로 옮겼다)
 */

export interface UserRecord {
  readonly docId: string;
  readonly data: UserData;
}

const nowIso = () => new Date().toISOString();

export const getUserById = async (githubId: string): Promise<UserRecord | null> => {
  const snap = await usersCollection().doc(githubId).get();
  return snap.exists ? { docId: snap.id, data: snap.data() as UserData } : null;
};

/** 배지 조회용. 아이디로 사용자를 찾는다(대소문자 무시). */
export const findUserByLogin = async (login: string): Promise<UserRecord | null> => {
  const snap = await usersCollection()
    .where('login_lower', '==', login.toLowerCase())
    .limit(1)
    .get();

  const found = snap.docs[0];
  return found ? { docId: found.id, data: found.data() as UserData } : null;
};

/**
 * 로그인할 때 호출한다.
 * 1) 숫자 ID 문서에 현재 아이디와 로그인 시각을 기록한다(처음이면 만든다).
 * 2) 같은 아이디를 들고 있는 다른 사용자 문서(아이디를 바꾼 예전 주인)는 아이디를 비운다.
 * @returns created — 처음 가입한 사용자인지(가입 수 집계용)
 */
export const upsertUserOnLogin = async ({
  githubId,
  login,
}: {
  githubId: string;
  login: string;
}): Promise<{ created: boolean }> => {
  const users = usersCollection();
  const userRef = users.doc(githubId);
  const loginLower = login.toLowerCase();
  const now = nowIso();

  const current = await userRef.get();
  const firstLogin = (current.data() as UserData | undefined)?.first_login ?? now;

  await userRef.set(
    {
      first_login: firstLogin,
      github_id: Number(githubId),
      login_id: login,
      login_lower: loginLower,
      last_login: now,
    },
    { merge: true },
  );

  const sameLogin = await users.where('login_lower', '==', loginLower).get();
  await Promise.all(
    sameLogin.docs
      .filter((doc) => doc.id !== githubId)
      .map((doc) => doc.ref.set({ login_id: null, login_lower: null }, { merge: true })),
  );

  return { created: !current.exists };
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

/**
 * 회원 탈퇴. 내 숫자 ID 문서를 지운다.
 * @returns 지운 문서 ID 목록(문서가 없었으면 빈 배열)
 */
export const deleteUserData = async ({
  githubId,
}: {
  githubId: string;
  login?: string;
}): Promise<string[]> => {
  const current = await usersCollection().doc(githubId).get();
  if (!current.exists) return [];
  await current.ref.delete();
  return [current.id];
};
