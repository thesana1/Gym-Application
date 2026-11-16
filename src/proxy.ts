import { NextRequest, NextResponse } from 'next/server';

import { PROTECTED_ROUTES } from '@/shared/const/routes.const';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const sessionToken =
    req.cookies.get('authjs.session-token')?.value ??
    req.cookies.get('__Secure-authjs.session-token')?.value;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtected && !sessionToken) {
    const loginUrl = new URL('/sign-in', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Lets the protected layout know the current page (layouts do not get the path).
  const headers = new Headers(req.headers);
  headers.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up'],
};
