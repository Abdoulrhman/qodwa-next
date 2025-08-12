/**
 * Application Configuration
 * Centralized configuration for the Qodwa application
 */

export const APP_CONFIG = {
  name: 'Qodwa',
  version: '1.0.0',
  description: 'Learn Quran Online Platform',

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 10000,
  },

  // Authentication
  auth: {
    sessionTimeout: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxLoginAttempts: 5,
  },

  // Stripe Configuration
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    currency: 'USD',
    defaultCurrency: 'USD',
  },

  // Internationalization
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar'],
    namespaces: ['common', 'auth', 'packages', 'dashboard'],
  },

  // UI Configuration
  ui: {
    defaultTheme: 'light',
    breakpoints: {
      mobile: '768px',
      tablet: '1024px',
      desktop: '1280px',
    },
  },

  // Feature Flags
  features: {
    enablePayments: true,
    enableTeacherDashboard: true,
    enableStudentDashboard: true,
    enableNotifications: true,
  },

  // Pagination
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
