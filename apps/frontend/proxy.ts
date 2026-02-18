import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
const publicRoutes = ['/sign-in', '/sign-up'];
export async function proxy(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
    // THIS IS NOT SECURE!
    // This is the recommended approach to optimistically redirect users
    // We recommend handling auth checks in each page/route
	if (sessionCookie && publicRoutes.includes(request.nextUrl.pathname)) {
		return NextResponse.redirect(new URL("/app", request.url));
	}
	if (!sessionCookie && !publicRoutes.includes(request.nextUrl.pathname)) {
		return NextResponse.redirect(new URL("/", request.url));
	}
	return NextResponse.next();
}
export const config = {
	matcher: ["/app/:path*",'/sign-in','/sign-up'], // Specify the routes the middleware applies to
};