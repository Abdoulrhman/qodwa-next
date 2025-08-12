// Global type exports
export * from './api';

// Global TypeScript declarations
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      STRIPE_SECRET_KEY: string;
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
      DATABASE_URL: string;
      RESEND_API_KEY: string;
    }
  }
}

export {};
