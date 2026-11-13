import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../../../../../firebase/firebase';
import { ImageSettings, isValidImageOptions } from '@/types/api';
import { getContributeCount } from '@/utils/github';

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.loginId || !token?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginId = token.loginId as string;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const options = (body as { imageSettings?: unknown } | null)?.imageSettings;
  if (!isValidImageOptions(options)) {
    return NextResponse.json({ error: 'Invalid settings' }, { status: 400 });
  }

  // 기여 수는 클라이언트 값을 믿지 않고 서버가 GitHub 에서 직접 조회한다.
  const contributeCount = await getContributeCount({
    accessToken: token.accessToken as string,
    loginId,
  });

  if (contributeCount === 'ERROR') {
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 502 });
  }

  // 허용한 필드만 골라 저장한다(요청 본문의 다른 필드는 버린다).
  const imageSettings: ImageSettings = {
    isCard: options.isCard,
    isText: options.isText,
    isMode: options.isMode,
    contributeCount,
  };

  try {
    const userRef = doc(firestore, 'users', loginId);
    await setDoc(
      userRef,
      {
        lastUpdated: new Date().toISOString(),
        imageSettings,
      },
      { merge: true },
    );

    return NextResponse.json({ success: true, contributeCount });
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
