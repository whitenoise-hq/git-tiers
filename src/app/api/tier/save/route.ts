import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../../../../../firebase/firebase';

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.loginId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginId = token.loginId as string;

  try {
    const body = await request.json();
    const { imageSettings } = body;

    if (!imageSettings) {
      return NextResponse.json({ error: 'Invalid settings' }, { status: 400 });
    }

    const userRef = doc(firestore, 'users', loginId);
    await setDoc(
      userRef,
      {
        lastUpdated: new Date().toISOString(),
        imageSettings,
      },
      { merge: true },
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
