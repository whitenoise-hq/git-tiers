import { NextRequest, NextResponse } from 'next/server';
import { findUserByLogin } from '../../../../../firebase/users';
import { getContributionCount } from '../../../../../firebase/contributions';
import { DEFAULT_IMAGE_OPTIONS } from '@/types/api';
import { generatePlaceholderSvg, generateTierSvg } from '@/utils/generateTierSvg';

const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

/**
 * README 이미지 캐시. 기여 수 자체는 Firestore 에 3시간 캐시되므로(firebase/contributions.ts),
 * 여기서는 표시 옵션 변경이 너무 늦지 않게 짧게 두고, 만료 뒤에는 이전 이미지를 쓰면서 갱신한다.
 */
const BADGE_CACHE_CONTROL = 'public, max-age=600, s-maxage=600, stale-while-revalidate=86400';

const svgResponse = (svg: string): NextResponse => {
  const allowedOrigin = process.env.NEXTAUTH_URL || 'https://git-tiers.devwoodie.com';

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': BADGE_CACHE_CONTROL,
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
    if (!user) {
      // 한 번도 로그인하지 않은 사용자: README 에 깨진 이미지 대신 안내 배지
      return svgResponse(generatePlaceholderSvg());
    }

    // 기여 수는 요청할 때마다 갱신된다(캐시 TTL 안이면 캐시). 사용자가 사이트에 다시 오지 않아도 된다.
    const contributeCount = await getContributionCount(user);
    if (contributeCount === null) {
      return svgResponse(generatePlaceholderSvg());
    }

    return svgResponse(
      generateTierSvg({
        contributeCount,
        settings: user.data.imageSettings ?? DEFAULT_IMAGE_OPTIONS,
      }),
    );
  } catch {
    return new NextResponse('Internal server error', { status: 500 });
  }
}
