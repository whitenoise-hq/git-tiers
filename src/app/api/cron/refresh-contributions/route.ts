import { NextRequest, NextResponse } from 'next/server';
import { refreshAllContributions } from '../../../../../firebase/contributions';

/** 사용자가 많아져도 한 번에 끝나도록 함수 실행 시간을 늘린다(Vercel Hobby 최대 60초). */
export const maxDuration = 60;

/**
 * 매일 한 번(GitHub Actions: .github/workflows/refresh-contributions.yml) 모든 사용자의 기여 수를 새로 조회한다.
 * 호출할 때 `Authorization: Bearer <CRON_SECRET>` 를 붙이므로, 그 값이 맞을 때만 실행한다.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const summary = await refreshAllContributions();
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json(
      { error: 'Failed to refresh contributions' },
      { status: 500 }
    );
  }
}
