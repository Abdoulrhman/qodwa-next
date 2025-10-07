import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: process.env.NODE_ENV === 'production',
  experimental: {
    optimizePackageImports: ['@next/font'],
  },
  sassOptions: {
    includePaths: [path.join(process.cwd(), 'styles')],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd(), './src'),
      '@/components': path.resolve(process.cwd(), './components'),
      '@/lib': path.resolve(process.cwd(), './lib'),
      '@/hooks': path.resolve(process.cwd(), './hooks'),
      '@/contexts': path.resolve(process.cwd(), './contexts'),
      '@/services': path.resolve(process.cwd(), './services'),
      '@/schemas': path.resolve(process.cwd(), './schemas'),
      '@/data': path.resolve(process.cwd(), './data'),
      '@/actions': path.resolve(process.cwd(), './actions'),
      '@/messages': path.resolve(process.cwd(), './messages'),
      '@/i18n': path.resolve(process.cwd(), './i18n'),
      '@/config': path.resolve(process.cwd(), './config'),
      '@/types': path.resolve(process.cwd(), './src/types'),
      '@/utils': path.resolve(process.cwd(), './src/utils'),
      '@/constants': path.resolve(process.cwd(), './src/constants'),
      '@/auth': path.resolve(process.cwd(), './auth.ts'),
      '@/auth.config': path.resolve(process.cwd(), './auth.config.ts'),
      '@/routes': path.resolve(process.cwd(), './routes.ts'),
      '@/next-auth': path.resolve(process.cwd(), './next-auth.d.ts'),
      '@/public': path.resolve(process.cwd(), './public'),
    };
    return config;
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_FB_PIXEL_ID: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
    NEXT_PUBLIC_HOTJAR_ID: process.env.NEXT_PUBLIC_HOTJAR_ID,
  },
};

export default withNextIntl(nextConfig);
