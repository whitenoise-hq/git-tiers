import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../../../../firebase/firebase';
import { UserData } from '@/types/api';
import { generateTierSvg } from '@/utils/generateTierSvg';

const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = await params;

    if (!userId || !GITHUB_USERNAME_REGEX.test(userId)) {
      return new NextResponse('Invalid user ID', { status: 400 });
    }

    const userRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return new NextResponse('User not found', { status: 404 });
    }

    const userData: UserData = userDoc.data() as UserData;
    const settings = userData.imageSettings;

    if (!settings) {
      return new NextResponse('Tier settings not found', { status: 404 });
    }

    const svg = generateTierSvg({
      contributeCount: settings.contributeCount || 0,
      settings,
    });

    const allowedOrigin = process.env.NEXTAUTH_URL || 'https://git-tiers.devwoodie.com';

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
        'Access-Control-Allow-Origin': allowedOrigin,
      },
    });
  } catch {
    return new NextResponse('Internal server error', { status: 500 });
  }
}
