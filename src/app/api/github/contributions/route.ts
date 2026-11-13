import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getUserById } from '../../../../../firebase/users';
import { getContributionCount } from '../../../../../firebase/contributions';

/** 마이페이지용. 배지와 같은 값(서버 토큰 조회 + 캐시)을 돌려준다. */
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.githubId || !token?.loginId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const githubId = token.githubId as string;

  try {
    // 로그인 때 문서 저장이 실패했어도 아이디로 조회할 수 있게 토큰 값으로 대신한다.
    const user = (await getUserById(githubId)) ?? {
      docId: githubId,
      data: { github_id: Number(githubId), login_id: token.loginId as string },
    };

    const contributions = await getContributionCount(user);
    if (contributions === null) {
      return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 502 });
    }

    return NextResponse.json({ contributions });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 });
  }
}
