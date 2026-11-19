import { usersCollection } from './admin';
import { toRankingEntries } from './ranking';
import { toImageOptions } from '../src/types/api';
import type { ImageOptions, UserData } from '../src/types/api';
import { getTierText } from '../src/utils/getTier';
import { sortRanking } from '../src/utils/ranking';
import { ownedFrameIds, type FrameId } from '../src/utils/frames/catalog';

/** 관리자 사용자 목록 한 줄. 토큰 같은 비밀값은 원래 저장하지 않으므로 담을 것도 없다. */
export interface AdminUserRow {
  readonly githubId: string;
  readonly login: string | null;
  readonly firstLogin: string | null;
  readonly lastLogin: string | null;
  readonly contributions: number | null;
  readonly contributionsUpdatedAt: string | null;
  readonly tierText: string | null;
  /** 랭킹 순위(기여 수가 없으면 null) */
  readonly rank: number | null;
  readonly imageSettings: ImageOptions | null;
  readonly settingsUpdatedAt: string | null;
  /** 이벤트로 받은 테두리 */
  readonly frames: readonly FrameId[];
}

/** 문서 → 관리자 행. 순위는 정렬된 랭킹 목록에서 찾는다. */
export const toAdminUserRows = (
  docs: readonly { readonly id: string; readonly data: UserData }[]
): AdminUserRow[] => {
  const ranked = sortRanking(toRankingEntries(docs));
  const rankById = new Map(ranked.map((entry, i) => [entry.githubId, i + 1]));

  return docs.map(({ id, data }) => {
    const count = data.contributions?.count ?? null;
    const settings = data.imageSettings;
    return {
      githubId: id,
      login: data.login_id ?? null,
      firstLogin: data.first_login ?? null,
      lastLogin: data.last_login ?? null,
      contributions: count,
      contributionsUpdatedAt: data.contributions?.updatedAt ?? null,
      tierText: count === null ? null : getTierText(count),
      rank: rankById.get(id) ?? null,
      imageSettings: settings ? toImageOptions(settings) : null,
      frames: ownedFrameIds(data.frames),
      settingsUpdatedAt: data.lastUpdated ?? null,
    };
  });
};

/** 전체 사용자(최근 로그인순). 사용자 수가 적어 한 번에 읽는다. */
export const listUsersForAdmin = async (): Promise<AdminUserRow[]> => {
  const snapshot = await usersCollection().get();
  const rows = toAdminUserRows(
    snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() as UserData }))
  );
  return [...rows].sort((a, b) =>
    (b.lastLogin ?? '').localeCompare(a.lastLogin ?? '')
  );
};
