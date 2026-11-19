import { NextRequest, NextResponse } from 'next/server';
import { incrementDaily } from '../../../../../firebase/stats';
import { BADGE_REF } from '@/utils/badgeTag';

/**
 * README 배지를 눌러 들어온 방문을 센다(랜딩에서 ?ref=badge 일 때 한 번 호출).
 * 숫자만 올리고 방문자 정보는 저장하지 않는다.
 */
export async function POST(request: NextRequest) {
  let ref: unknown;
  try {
    ref = ((await request.json()) as { ref?: unknown }).ref;
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  if (ref !== BADGE_REF) {
    return NextResponse.json({ error: 'Unknown ref' }, { status: 400 });
  }
  await incrementDaily('badgeVisits');
  return new NextResponse(null, { status: 204 });
}
