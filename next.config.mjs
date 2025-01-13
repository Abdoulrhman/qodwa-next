import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: process.env.NODE_ENV === 'production',
  sassOptions: {
    includePaths: [path.join(process.cwd(), 'src/styles')], //
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  },
};

export default withNextIntl(nextConfig);
