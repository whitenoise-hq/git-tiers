import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getContributeCount } from '@/utils/github';

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.accessToken || !token?.loginId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await getContributeCount({
    accessToken: token.accessToken as string,
    loginId: token.loginId as string,
  });

  if (result === 'ERROR') {
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 502 });
  }

  return NextResponse.json({ contributions: result });
}
