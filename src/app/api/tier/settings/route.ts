import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../../../../firebase/firebase';
import { UserData } from '@/types/api';

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.loginId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginId = token.loginId as string;

  try {
    const userRef = doc(firestore, 'users', loginId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json({ imageSettings: null });
    }

    const userData = userDoc.data() as UserData;
    return NextResponse.json({ imageSettings: userData.imageSettings || null });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
