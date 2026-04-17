import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  try {
    const decodedToken = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!decodedToken) {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate',
      );
      return response;
    }

  } catch (error) {
    console.log(error)
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // "/my",
  ],
};
