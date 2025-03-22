import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { auth } from '@/auth';

import {
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
  protectedRoutes,
  DEFAULT_LOGIN_REDIRECT,
} from '@/routes';
import { routing } from './i18n/routing';

// Create localization middleware
const localeMiddleware = createMiddleware(routing);

export default async function middleware(request: any) {
  const { nextUrl } = request;

  // Apply locale middleware first
  const localeResponse = localeMiddleware(request);
  if (localeResponse) return localeResponse;

  // Get the pathname of the request
  const pathname = nextUrl.pathname;

  // Check if the pathname is an API auth route
  if (pathname.startsWith(apiAuthPrefix)) {
    return NextResponse.next();
  }

  // Get the token from the session
  const session = await auth();
  const isLoggedIn = !!session;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname.startsWith(route) || pathname === route
  );

  // Check if the route is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname.startsWith(route) || pathname === route
  );

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some(
    (route) => pathname.startsWith(route) || pathname === route
  );

  // If the route is protected and the user isn't logged in,
  // redirect to the login page
  if (isProtectedRoute && !isLoggedIn) {
    const redirectUrl = new URL('/auth/login', nextUrl);
    redirectUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If the route is an auth route and the user is logged in,
  // redirect to the default page
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
