import { NextResponse } from 'next/server';
import { fetchRankingEntries } from '../../../../firebase/ranking';
import {
  buildRankingSnapshot,
  sortRanking,
  type RankingSnapshot,
} from '@/utils/ranking';

export type RankingResponse = RankingSnapshot;

/**
 * 공개 랭킹(로그인 없이 볼 수 있음).
 * 가린 아이디와 티어만 내보내고 기여 수·전체 아이디는 응답에 넣지 않는다.
 * 로그인한 사람은 본인 순위와 같은 시점의 데이터를 보도록 /api/ranking/me 를 쓴다.
 */
export async function GET() {
  try {
    const body: RankingResponse = buildRankingSnapshot(
      sortRanking(await fetchRankingEntries())
    );
    return NextResponse.json(body, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load ranking' },
      { status: 500 }
    );
  }
}
