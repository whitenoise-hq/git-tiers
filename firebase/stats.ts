import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb, usersCollection } from './admin';

/**
 * 서비스 고유 통계(관리자 페이지용).
 * - stats/{YYYY-MM-DD}: 그날 배지로 들어온 방문 수, 새 가입 수 (한국 시간 기준 날짜)
 * - statsMeta/lastRefresh: 매일 기여 수 갱신 작업의 최근 결과
 * 개인을 식별하는 값은 저장하지 않고 숫자만 쌓는다.
 */

export type DailyCounter = 'badgeVisits' | 'signups';

export interface DailyStats {
  readonly date: string;
  readonly badgeVisits: number;
  readonly signups: number;
}

export interface RefreshRun {
  readonly updated: number;
  readonly failed: number;
  readonly skipped: number;
  readonly ranAt: string;
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 한국 시간 기준 날짜 키(YYYY-MM-DD) */
export const kstDateKey = (now: number): string =>
  new Date(now + KST_OFFSET_MS).toISOString().slice(0, 10);

/** 오늘을 포함한 최근 n일의 날짜 키(오래된 날부터) */
export const recentDateKeys = (days: number, now: number): string[] =>
  Array.from({ length: days }, (_, i) =>
    kstDateKey(now - (days - 1 - i) * DAY_MS)
  );

const statsCollection = () => getAdminDb().collection('stats');
const lastRefreshDoc = () =>
  getAdminDb().collection('statsMeta').doc('lastRefresh');

/** 그날 카운터를 1 올린다. 실패해도 본 기능(로그인·방문)은 막지 않는다. */
export const incrementDaily = async (
  counter: DailyCounter,
  now: number = Date.now()
): Promise<void> => {
  try {
    const date = kstDateKey(now);
    await statsCollection()
      .doc(date)
      .set({ date, [counter]: FieldValue.increment(1) }, { merge: true });
  } catch (error) {
    console.error('통계 저장 실패:', error);
  }
};

export const recordRefreshRun = async (
  summary: Omit<RefreshRun, 'ranAt'>,
  now: number = Date.now()
): Promise<void> => {
  try {
    await lastRefreshDoc().set({
      ...summary,
      ranAt: new Date(now).toISOString(),
    });
  } catch (error) {
    console.error('갱신 결과 저장 실패:', error);
  }
};

/** 최근 n일 통계(없는 날은 0) */
export const getDailyStats = async (
  days: number,
  now: number = Date.now()
): Promise<DailyStats[]> => {
  const keys = recentDateKeys(days, now);
  const refs = keys.map((key) => statsCollection().doc(key));
  const snaps = await getAdminDb().getAll(...refs);
  return snaps.map((snap, i) => {
    const data = snap.data() as Partial<DailyStats> | undefined;
    return {
      date: keys[i],
      badgeVisits: data?.badgeVisits ?? 0,
      signups: data?.signups ?? 0,
    };
  });
};

export interface StatsTotals {
  readonly users: number;
  readonly ranked: number;
}

/** 전체 사용자 수 · 랭킹 대상 수(기여 수가 있는 사용자) */
export const getTotals = async (): Promise<StatsTotals> => {
  const [all, ranked] = await Promise.all([
    usersCollection().count().get(),
    usersCollection().where('contributions.count', '>=', 0).count().get(),
  ]);
  return { users: all.data().count, ranked: ranked.data().count };
};

export const getLastRefresh = async (): Promise<RefreshRun | null> => {
  const snap = await lastRefreshDoc().get();
  return snap.exists ? (snap.data() as RefreshRun) : null;
};
