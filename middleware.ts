import { NextResponse, NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { auth } from './auth'; // Import NextAuth.js authentication

import {
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
  protectedRoutes,
  getDefaultLoginRedirect,
} from '@/routes';
import { routing } from './i18n/routing';

// Create localization middleware
const localeMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  // Extract locale from the pathname (assuming URLs start with /en/ or /ar/)
  const pathnameParts = nextUrl.pathname.split('/');
  const locale =
    pathnameParts[1] === 'ar' || pathnameParts[1] === 'en'
      ? pathnameParts[1]
      : 'en'; // Default to 'en'

  // Apply locale middleware first
  const localeResponse = localeMiddleware(req);
  if (localeResponse) return localeResponse;

  // Fetch the user session from NextAuth
  const session = await auth();
  const isLoggedIn = !!session?.user; // Check if the user is authenticated

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isProtectedRoute = protectedRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from authentication pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(
      new URL(getDefaultLoginRedirect(locale), nextUrl)
    );
  }

  // Redirect non-logged-in users trying to access protected routes
  if (isProtectedRoute && !isLoggedIn) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return NextResponse.redirect(
      new URL(
        `/${locale}/auth/login?callbackUrl=${encodedCallbackUrl}`,
        nextUrl
      )
    );
  }

  return NextResponse.next();
}

// Middleware config
export const config = {
  matcher: [
    '/(ar|en)/((?!.+\\.[\\w]+$|_next).*)', // Match all pages except static files
    '/',
    '/(ar|en)/(api|trpc)(.*)',
    '/(ar|en)/:path*', // Also match localized paths
  ],
};
