const locales = ['en', 'ar']; // Add all supported locales

/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = locales.flatMap((locale) => [
  `/${locale}/`,
  `/${locale}/auth/new-verification`,
]);

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /dashboard
 * @type {string[]}
 */
export const authRoutes = locales.flatMap((locale) => [
  `/${locale}/auth/login`,
  `/${locale}/auth/register`,
  `/${locale}/auth/error`,
  `/${locale}/auth/reset`,
  `/${locale}/auth/new-password`,
  `/${locale}/auth/verify-email`,
]);

/**
 * An array of routes that require authentication
 * These routes will redirect to login if not authenticated
 * @type {string[]}
 */
export const protectedRoutes = locales.flatMap((locale) => [
  `/${locale}/dashboard`,
  `/${locale}/dashboard/profile`,
  `/${locale}/dashboard/teacher`,
  `/${locale}/dashboard/packages`,
  `/${locale}/dashboard/schedule`,
  `/${locale}/dashboard/progress`,
  `/${locale}/dashboard/messages`,
  `/${locale}/dashboard/payments`,
  `/${locale}/dashboard/learning-paths`,
  `/${locale}/dashboard/lesson-reports`,
]);

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = '/api/auth';

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const getDefaultLoginRedirect = (locale: string) =>
  `/${locale}/dashboard`;
