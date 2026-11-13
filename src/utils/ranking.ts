import {
  TIER_THRESHOLDS,
  TierName,
  getTierMin,
} from '@/constants/tierThresholds';
import { getTierImage, getTierText } from './getTier';

/**
 * 랭킹 계산(순수 함수).
 * 공개 화면에는 가린 아이디와 티어만 내보내고, 기여 수는 정렬에만 쓴다.
 * 총 인원도 드러내지 않는다(순위 비율·티어별 인원수를 내보내지 않음).
 */

/** 가린 부분은 길이를 드러내지 않도록 항상 같은 개수로 표시한다. */
export const MASK = '***';

/** 랭킹 화면에 보여 줄 상위 인원 */
export const PODIUM_SIZE = 3;

export const maskLogin = (login: string): string => {
  const { length } = login;
  if (length >= 8) return `${login.slice(0, 3)}${MASK}${login.slice(-2)}`;
  if (length >= 5) return `${login.slice(0, 2)}${MASK}${login.slice(-1)}`;
  if (length >= 1) return `${login.slice(0, 1)}${MASK}`;
  return MASK;
};

export interface RankingEntry {
  readonly githubId: string;
  readonly login: string;
  readonly count: number;
  readonly firstLogin?: string;
}

/** 첫 로그인 시각이 없는 사람은 동점일 때 뒤로 보낸다. */
const compareFirstLogin = (a: RankingEntry, b: RankingEntry): number => {
  if (a.firstLogin === b.firstLogin) return 0;
  if (!a.firstLogin) return 1;
  if (!b.firstLogin) return -1;
  return a.firstLogin < b.firstLogin ? -1 : 1;
};

/** 기여 수 내림차순, 동점이면 먼저 가입한 사람이 위. 입력 배열은 바꾸지 않는다. */
export const sortRanking = (entries: readonly RankingEntry[]): RankingEntry[] =>
  [...entries].sort(
    (a, b) =>
      b.count - a.count ||
      compareFirstLogin(a, b) ||
      a.githubId.localeCompare(b.githubId)
  );

const LOWEST_TIER = TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1];

export const getTierName = (count: number): TierName =>
  (TIER_THRESHOLDS.find((tier) => count >= getTierMin(tier)) ?? LOWEST_TIER)
    .name;

export interface PublicRankItem {
  readonly rank: number;
  readonly maskedLogin: string;
  readonly tierName: TierName;
  readonly tierText: string;
  readonly tierImage: string;
}

export const toPublicRankItem = (
  entry: RankingEntry,
  rank: number
): PublicRankItem => ({
  rank,
  maskedLogin: maskLogin(entry.login),
  tierName: getTierName(entry.count),
  tierText: getTierText(entry.count),
  tierImage: getTierImage(entry.count),
});

export interface TierBucket {
  readonly tier: TierName;
  /**
   * 가장 많은 티어 대비 비율(0~1, 0.1 단위).
   * 인원수·총 인원이 드러나지 않도록 실제 수는 내보내지 않는다.
   * 사람이 있는 티어는 최소 0.1 로 보여 준다.
   */
  readonly ratio: number;
}

const roundToTenth = (value: number): number => Math.round(value * 10) / 10;

/** 티어별 상대 비율(낮은 티어부터) */
export const buildTierDistribution = (
  entries: readonly RankingEntry[]
): TierBucket[] => {
  const counts = [...TIER_THRESHOLDS].reverse().map((tier) => ({
    tier: tier.name,
    count: entries.filter((entry) => getTierName(entry.count) === tier.name)
      .length,
  }));
  const max = Math.max(0, ...counts.map((bucket) => bucket.count));
  return counts.map(({ tier, count }) => ({
    tier,
    ratio:
      count === 0 || max === 0 ? 0 : Math.max(0.1, roundToTenth(count / max)),
  }));
};

/** 모든 세부 단계의 최소 기여 수(오름차순) */
const STEP_MINIMUMS: readonly number[] = TIER_THRESHOLDS.flatMap(
  (tier) => tier.subTiers
).sort((a, b) => a - b);

export interface NextTier {
  readonly tierText: string;
  readonly remaining: number;
  /** 지금 세부 단계 안에서 다음 단계까지 진행한 비율(0~1, 소수 둘째 자리) */
  readonly progress: number;
}

/** 바로 위 세부 단계, 남은 기여 수, 진행 비율. 가장 높은 단계면 null */
export const getNextTier = (count: number): NextTier | null => {
  const next = STEP_MINIMUMS.find((min) => min > count);
  if (next === undefined) return null;
  const current = [...STEP_MINIMUMS].reverse().find((min) => min <= count) ?? 0;
  const progress =
    Math.round(((count - current) / (next - current)) * 100) / 100;
  return { tierText: getTierText(next), remaining: next - count, progress };
};

export interface MyRank {
  readonly rank: number;
  readonly count: number;
  readonly tierName: TierName;
  readonly tierText: string;
  readonly tierImage: string;
  readonly next: NextTier | null;
}

/** 정렬된 목록에서 본인 순위. 목록에 없으면 null */
export const findMyRank = (
  sorted: readonly RankingEntry[],
  githubId: string
): MyRank | null => {
  const index = sorted.findIndex((entry) => entry.githubId === githubId);
  if (index === -1) return null;
  const { count } = sorted[index];
  return {
    rank: index + 1,
    count,
    tierName: getTierName(count),
    tierText: getTierText(count),
    tierImage: getTierImage(count),
    next: getNextTier(count),
  };
};

/** 사용자가 직접 갱신한 뒤 다시 갱신할 수 있을 때까지의 시간 */
export const REFRESH_COOLDOWN_MS = 60 * 1000;

/** 마지막 갱신 시각으로 다음 갱신 가능 시각(epoch ms)을 구한다. */
export const getRefreshAvailableAt = (
  updatedAt: string | undefined,
  now: number
): number => {
  const last = updatedAt ? Date.parse(updatedAt) : Number.NaN;
  return Number.isFinite(last)
    ? Math.max(now, last + REFRESH_COOLDOWN_MS)
    : now;
};

export interface PodiumItem extends PublicRankItem {
  /** 로그인한 본인에게 보낼 때만 담는다. */
  readonly isMe?: boolean;
}

export interface RankingSnapshot {
  readonly podium: readonly PodiumItem[];
  readonly distribution: readonly TierBucket[];
}

/**
 * 포디움·분포·인원을 한 번에 만든다.
 * 본인 순위와 같은 데이터로 계산해야 「내 순위」와 포디움이 어긋나지 않는다.
 */
export const buildRankingSnapshot = (
  sorted: readonly RankingEntry[],
  viewerGithubId?: string
): RankingSnapshot => ({
  podium: sorted.slice(0, PODIUM_SIZE).map((entry, i) => ({
    ...toPublicRankItem(entry, i + 1),
    ...(viewerGithubId ? { isMe: entry.githubId === viewerGithubId } : {}),
  })),
  distribution: buildTierDistribution(sorted),
});
