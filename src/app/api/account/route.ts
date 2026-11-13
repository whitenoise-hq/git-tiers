import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { deleteUserData } from '../../../../firebase/users';
import { revokeGithubGrant } from '@/utils/githubOAuth';

/**
 * 회원 탈퇴.
 * 1) Firestore 에서 사용자 문서를 지운다(개인정보 파기).
 * 2) GitHub 앱 연결(권한)을 해제한다. 실패해도 탈퇴는 완료로 보고, 결과만 알려 준다.
 * 로그아웃(세션 쿠키 삭제)은 응답을 받은 클라이언트가 한다.
 */
export async function DELETE(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.githubId || !token?.loginId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await deleteUserData({
      githubId: token.githubId as string,
      login: token.loginId as string,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }

  const githubRevoked = await revokeGithubGrant((token.accessToken as string | undefined) ?? '');

  return NextResponse.json({ success: true, githubRevoked });
}
