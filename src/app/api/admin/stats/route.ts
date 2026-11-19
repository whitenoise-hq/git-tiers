import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  getDailyStats,
  getLastRefresh,
  getTotals,
  type DailyStats,
  type RefreshRun,
  type StatsTotals,
} from '../../../../../firebase/stats';
import { isAdminGithubId } from '@/utils/admin';

export interface AdminStatsResponse {
  readonly daily: readonly DailyStats[];
  readonly totals: StatsTotals;
  readonly lastRefresh: RefreshRun | null;
}

const STATS_DAYS = 30;
const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' };

/** 관리자 통계. 관리자가 아니면 페이지가 없는 것처럼 404 를 돌려준다. */
export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!isAdminGithubId(token?.githubId)) {
    return NextResponse.json(
      { error: 'Not Found' },
      { status: 404, headers: PRIVATE_HEADERS }
    );
  }

  try {
    const [daily, totals, lastRefresh] = await Promise.all([
      getDailyStats(STATS_DAYS),
      getTotals(),
      getLastRefresh(),
    ]);
    const body: AdminStatsResponse = { daily, totals, lastRefresh };
    return NextResponse.json(body, { headers: PRIVATE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load stats' },
      { status: 500, headers: PRIVATE_HEADERS }
    );
  }
}
