import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: process.env.NODE_ENV === 'production',
  sassOptions: {
    includePaths: [path.join(process.cwd(), 'src/styles')], //
  },
};

export default withNextIntl(nextConfig);
