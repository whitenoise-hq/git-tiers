import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getImageSettings } from '../../../../../firebase/users';

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.githubId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const imageSettings = await getImageSettings(token.githubId as string);
    return NextResponse.json({ imageSettings });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
