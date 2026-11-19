import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getImageSettings, saveImageSettings } from '../../../../../firebase/users';
import { ImageOptions, isValidImageOptions } from '@/types/api';

const readSession = async (request: NextRequest) => {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.githubId || !token?.loginId) return null;
  return { githubId: token.githubId as string, login: token.loginId as string };
};

/** 저장된 표시 옵션(카드 형태·텍스트·배경) */
export async function GET(request: NextRequest) {
  const session = await readSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await getImageSettings(session.githubId);
    const imageSettings = settings
      ? { isCard: settings.isCard, isText: settings.isText, isMode: settings.isMode }
      : null;
    return NextResponse.json({ imageSettings });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

/**
 * 표시 옵션 저장. 마이페이지에서 옵션을 바꿀 때마다 자동으로 호출된다.
 * 기여 수는 받지도 저장하지도 않는다(배지를 요청할 때 서버가 조회한다).
 */
export async function POST(request: NextRequest) {
  const session = await readSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const requested = (body as { imageSettings?: unknown } | null)?.imageSettings;
  if (!isValidImageOptions(requested)) {
    return NextResponse.json({ error: 'Invalid settings' }, { status: 400 });
  }

  // 허용한 필드만 골라 저장한다(요청 본문의 다른 필드는 버린다).
  const options: ImageOptions = {
    isCard: requested.isCard,
    isText: requested.isText,
    isMode: requested.isMode,
  };

  try {
    await saveImageSettings({ githubId: session.githubId, login: session.login, options });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
