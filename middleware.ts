import { NextResponse, NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import NextAuth from 'next-auth';
import authConfig from "@/auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";

// Create localization middleware
const localeMiddleware = createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
});


export default async function middleware(req: any) {
  const { nextUrl } = req;

  // Apply locale middleware first
  const localeResponse = localeMiddleware(req);
  if (localeResponse) return localeResponse;

  // Authentication logic
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  return NextResponse.next();
}

// Middleware config
export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)', // Match all pages except static files
    '/',
    '/(api|trpc)(.*)',
    '/(ar|en)/:path*' // Also match localized paths
  ],
};
