import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { fetchRankingEntries } from '../../../../../firebase/ranking';
import { findMyRank, sortRanking, type MyRank } from '@/utils/ranking';

export interface MyRankResponse {
  /** 기여 수가 아직 없어 순위가 없으면 null */
  readonly me: MyRank | null;
}

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' };

/** 로그인한 본인의 순위. 본인 기여 수와 다음 단계까지 남은 수도 담는다. */
export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token?.githubId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: PRIVATE_HEADERS }
    );
  }

  try {
    const sorted = sortRanking(await fetchRankingEntries());
    const body: MyRankResponse = {
      me: findMyRank(sorted, token.githubId as string),
    };
    return NextResponse.json(body, { headers: PRIVATE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load my rank' },
      { status: 500, headers: PRIVATE_HEADERS }
    );
  }
}
