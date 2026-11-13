import { NextResponse } from 'next/server';
import { fetchRankingEntries } from '../../../../firebase/ranking';
import {
  PODIUM_SIZE,
  buildTierDistribution,
  sortRanking,
  toPublicRankItem,
  type PublicRankItem,
  type TierBucket,
} from '@/utils/ranking';

export interface RankingResponse {
  readonly podium: readonly PublicRankItem[];
  readonly distribution: readonly TierBucket[];
  readonly total: number;
}

/**
 * 공개 랭킹(로그인 없이 볼 수 있음).
 * 가린 아이디와 티어만 내보내고 기여 수·전체 아이디는 응답에 넣지 않는다.
 */
export async function GET() {
  try {
    const sorted = sortRanking(await fetchRankingEntries());
    const body: RankingResponse = {
      podium: sorted
        .slice(0, PODIUM_SIZE)
        .map((entry, i) => toPublicRankItem(entry, i + 1)),
      distribution: buildTierDistribution(sorted),
      total: sorted.length,
    };
    return NextResponse.json(body, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load ranking' },
      { status: 500 }
    );
  }
}
