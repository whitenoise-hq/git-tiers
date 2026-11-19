import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  listUsersForAdmin,
  type AdminUserRow,
} from '../../../../../firebase/adminUsers';
import { isAdminGithubId } from '@/utils/admin';

export interface AdminUsersResponse {
  readonly users: readonly AdminUserRow[];
}

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' };

/** 관리자 사용자 목록. 관리자가 아니면 페이지가 없는 것처럼 404. */
export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!isAdminGithubId(token?.githubId)) {
    return NextResponse.json(
      { error: 'Not Found' },
      { status: 404, headers: PRIVATE_HEADERS }
    );
  }

  try {
    const body: AdminUsersResponse = { users: await listUsersForAdmin() };
    return NextResponse.json(body, { headers: PRIVATE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load users' },
      { status: 500, headers: PRIVATE_HEADERS }
    );
  }
}
