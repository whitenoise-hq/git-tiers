import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { claimActiveFrames } from '../../../../../firebase/frames';
import type { FrameId } from '@/utils/frames/catalog';

export interface ClaimFramesResponse {
  /** 이번에 새로 받은 테두리 */
  readonly granted: readonly FrameId[];
}

const NO_STORE = { 'Cache-Control': 'private, no-store' };

/**
 * 이벤트 테두리 받기. 로그인한 사용자가 이벤트 기간에 사이트에 들어오면 화면이 한 번 호출한다.
 * 기간 판단은 서버 시각으로 한다(클라이언트가 보낸 값은 쓰지 않는다).
 */
export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const githubId = token?.githubId as string | undefined;
  if (!githubId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: NO_STORE }
    );
  }

  try {
    const granted = await claimActiveFrames(githubId);
    const body: ClaimFramesResponse = { granted };
    return NextResponse.json(body, { headers: NO_STORE });
  } catch (error) {
    console.error('테두리 지급 실패:', error);
    return NextResponse.json(
      { error: 'Failed to claim' },
      { status: 500, headers: NO_STORE }
    );
  }
}
