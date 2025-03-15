import { NextResponse, NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getToken } from "next-auth/jwt";
import {
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
  getDefaultLoginRedirect,
} from "@/routes";
import { routing } from './i18n/routing';

// Create localization middleware
const localeMiddleware = createMiddleware(routing);

// Define protected routes
const protectedRoutes = ['/profile', '/packages'];
const isProtectedRoute = (pathname: string) => {
  return protectedRoutes.some(route => pathname.includes(route));
};

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = pathname.split('/')[1] || 'en';

  // Check authentication first
  const token = await getToken({ req: request });
  const isLoggedIn = !!token;

  // Authentication logic
  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);
  const isProtected = isProtectedRoute(pathname);

  // Apply locale middleware
  const localeResponse = localeMiddleware(request);
  if (localeResponse) {
    if (!isLoggedIn && isProtected) {
      let callbackUrl = pathname;
      if (request.nextUrl.search) {
        callbackUrl += request.nextUrl.search;
      }

      const encodedCallbackUrl = encodeURIComponent(callbackUrl);
      return NextResponse.redirect(
        new URL(`/${locale}/auth/login?callbackUrl=${encodedCallbackUrl}`, request.url)
      );
    }
    
    return localeResponse;
  }

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(getDefaultLoginRedirect(locale), request.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && (isProtected || (!isPublicRoute && !isAuthRoute))) {
    let callbackUrl = pathname;
    if (request.nextUrl.search) {
      callbackUrl += request.nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return NextResponse.redirect(
      new URL(`/${locale}/auth/login?callbackUrl=${encodedCallbackUrl}`, request.url)
    );
  }

  return NextResponse.next();
}

// Middleware config
export const config = {
  matcher: [
    '/(ar|en)/((?!.+\\.[\\w]+$|_next).*)', 
    '/',
    '/(ar|en)/(api|trpc)(.*)',
    '/(ar|en)/:path*' 
  ],
};
