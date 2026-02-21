import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const publicRoutes = ["/sign-in", "/sign-up"];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.includes(pathname) || pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
}

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const pathname = request.nextUrl.pathname;

  // Authenticated user on auth pages → send to app
  if (sessionCookie && isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Unauthenticated user on protected route → send to sign-in (auth proxy)
  if (!sessionCookie && !isPublicRoute(pathname)) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all pathnames except static assets and API
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:ico|png|jpg|jpeg|gif|svg|woff2?)$).*)"],
};
