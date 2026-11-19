import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isAdminGithubId } from "@/utils/admin";

const NO_STORE = 'no-store, no-cache, must-revalidate, proxy-revalidate';

/** 관리자 페이지가 있다는 것 자체를 숨기려고, 관리자가 아니면 없는 주소처럼 404 를 보여 준다. */
const notFound = (request: NextRequest) => {
  const response = NextResponse.rewrite(new URL("/__not-found", request.url));
  response.headers.set('Cache-Control', NO_STORE);
  return response;
};

export async function proxy(request: NextRequest) {
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");

  // 개발 모드는 마이페이지를 로그인 없이 볼 수 있게 둔다(관리자 페이지는 아래에서 그대로 검사).
  if (process.env.NODE_ENV === "development" && !isAdminPath) {
    return NextResponse.next();
  }

  try {
    const decodedToken = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (isAdminPath) {
      return isAdminGithubId(decodedToken?.githubId) ? NextResponse.next() : notFound(request);
    }

    if (!decodedToken) {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.headers.set('Cache-Control', NO_STORE);
      return response;
    }
  } catch {
    // silently redirect on auth error
    return isAdminPath ? notFound(request) : NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/my",
    "/admin/:path*",
  ],
};
