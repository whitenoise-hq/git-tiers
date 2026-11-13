import { NextRequest, NextResponse } from 'next/server';
import { fetchRankingEntries } from '../../../../../firebase/ranking';
import { isDevPreviewEnabled, parsePreviewLogin } from '@/utils/devPreview';
import { buildRankingSnapshot, findMyRank, sortRanking } from '@/utils/ranking';
import type { MyRankResponse } from '@/app/api/ranking/me/route';

/**
 * 개발 모드 전용: /ranking?preview=<GitHub 아이디> 에서 그 사람으로 로그인한 것처럼 랭킹을 본다.
 * 읽기만 한다. 운영에서는 404.
 */
export async function GET(request: NextRequest) {
  if (!isDevPreviewEnabled()) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const login = parsePreviewLogin(request.nextUrl.searchParams.get('login'));
  if (!login) {
    return NextResponse.json({ error: 'Invalid login' }, { status: 400 });
  }

  try {
    const sorted = sortRanking(await fetchRankingEntries());
    const viewer = sorted.find(
      (entry) => entry.login.toLowerCase() === login.toLowerCase()
    );
    const body: MyRankResponse = {
      ...buildRankingSnapshot(sorted, viewer?.githubId),
      me: viewer ? findMyRank(sorted, viewer.githubId) : null,
      refreshAvailableAt: Date.now(),
    };
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      { error: 'Failed to load preview' },
      { status: 502 }
    );
  }
}
