import { NextRequest, NextResponse } from 'next/server';
import { findUserByLogin } from '../../../../../firebase/users';
import { generatePlaceholderSvg, generateTierSvg } from '@/utils/generateTierSvg';

const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

const svgResponse = (svg: string): NextResponse => {
  const allowedOrigin = process.env.NEXTAUTH_URL || 'https://git-tiers.devwoodie.com';

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=60, s-maxage=60',
      'Access-Control-Allow-Origin': allowedOrigin,
    },
  });
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = await params;

    if (!userId || !GITHUB_USERNAME_REGEX.test(userId)) {
      return new NextResponse('Invalid user ID', { status: 400 });
    }

    // 문서 ID 는 GitHub 숫자 ID 라서 아이디로 찾는다(예전 문서도 함께 찾는다).
    const user = await findUserByLogin(userId);
    const settings = user?.data.imageSettings;

    // 가입 전이거나 아직 저장하지 않은 사용자도 README 에서 깨진 이미지가 아니라 안내 배지를 보게 한다.
    if (!settings) {
      return svgResponse(generatePlaceholderSvg());
    }

    return svgResponse(
      generateTierSvg({
        contributeCount: settings.contributeCount || 0,
        settings,
      }),
    );
  } catch {
    return new NextResponse('Internal server error', { status: 500 });
  }
}
