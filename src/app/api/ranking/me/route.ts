import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { fetchRankingEntries } from '../../../../../firebase/ranking';
import { getUserById } from '../../../../../firebase/users';
import { refreshUserContribution } from '../../../../../firebase/contributions';
import {
  buildRankingSnapshot,
  findMyRank,
  getRefreshAvailableAt,
  sortRanking,
  type MyRank,
  type RankingSnapshot,
} from '@/utils/ranking';

export interface MyRankResponse extends RankingSnapshot {
  /** 기여 수가 아직 없어 순위가 없으면 null */
  readonly me: MyRank | null;
  /** 갱신 버튼을 다시 누를 수 있는 시각(epoch ms) */
  readonly refreshAvailableAt: number;
}

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' };

const readViewer = async (request: NextRequest) => {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  return token?.githubId ? { githubId: token.githubId as string } : null;
};

/** 포디움·분포와 본인 순위를 같은 데이터로 한 번에 계산한다. */
const buildMyRankResponse = async (
  githubId: string,
  now: number
): Promise<MyRankResponse> => {
  const [entries, user] = await Promise.all([
    fetchRankingEntries(),
    getUserById(githubId),
  ]);
  const sorted = sortRanking(entries);
  return {
    ...buildRankingSnapshot(sorted, githubId),
    me: findMyRank(sorted, githubId),
    refreshAvailableAt: getRefreshAvailableAt(
      user?.data.contributions?.updatedAt,
      now
    ),
  };
};

const unauthorized = () =>
  NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401, headers: PRIVATE_HEADERS }
  );

/** 로그인한 본인 기준 랭킹. 본인 기여 수와 다음 단계까지 남은 수도 담는다. */
export async function GET(request: NextRequest) {
  const viewer = await readViewer(request);
  if (!viewer) return unauthorized();

  try {
    const body = await buildMyRankResponse(viewer.githubId, Date.now());
    return NextResponse.json(body, { headers: PRIVATE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load my rank' },
      { status: 500, headers: PRIVATE_HEADERS }
    );
  }
}

/**
 * 본인 기여 수를 지금 새로 조회한다(갱신 버튼).
 * 마지막 갱신 후 1분 안에는 다시 할 수 없다(429).
 */
export async function POST(request: NextRequest) {
  const viewer = await readViewer(request);
  if (!viewer) return unauthorized();

  try {
    const now = Date.now();
    const user = await getUserById(viewer.githubId);
    const login = user?.data.login_id;
    if (!user || !login) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: PRIVATE_HEADERS }
      );
    }

    const availableAt = getRefreshAvailableAt(
      user.data.contributions?.updatedAt,
      now
    );
    if (availableAt > now) {
      return NextResponse.json(
        { error: 'Too many requests', refreshAvailableAt: availableAt },
        {
          status: 429,
          headers: {
            ...PRIVATE_HEADERS,
            'Retry-After': String(Math.ceil((availableAt - now) / 1000)),
          },
        }
      );
    }

    const count = await refreshUserContribution(user.docId, login, now);
    if (count === null) {
      return NextResponse.json(
        { error: 'Failed to fetch contributions' },
        { status: 502, headers: PRIVATE_HEADERS }
      );
    }

    const body = await buildMyRankResponse(viewer.githubId, now);
    return NextResponse.json(body, { headers: PRIVATE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: 'Failed to refresh' },
      { status: 500, headers: PRIVATE_HEADERS }
    );
  }
}
