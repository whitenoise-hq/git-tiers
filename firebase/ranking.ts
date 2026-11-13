import { usersCollection } from './admin';
import type { UserData } from '../src/types/api';
import type { RankingEntry } from '../src/utils/ranking';

/** 아이디와 기여 수가 있는 문서만 랭킹 대상으로 바꾼다. */
export const toRankingEntries = (
  docs: readonly { readonly id: string; readonly data: UserData }[]
): RankingEntry[] =>
  docs.flatMap(({ id, data }) => {
    const login = data.login_id;
    const count = data.contributions?.count;
    if (!login || typeof count !== 'number') return [];
    return [{ githubId: id, login, count, firstLogin: data.first_login }];
  });

/**
 * 전체 사용자의 랭킹 대상 목록.
 * 사용자 수가 적어 한 번에 읽는다. 많아지면 contributions.count 정렬 쿼리 + 집계로 바꾼다.
 */
export const fetchRankingEntries = async (): Promise<RankingEntry[]> => {
  const snapshot = await usersCollection().get();
  return toRankingEntries(
    snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() as UserData }))
  );
};
