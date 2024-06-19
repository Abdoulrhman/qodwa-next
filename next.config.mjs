import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
 
const withNextIntl = createNextIntlPlugin();
 
/** @type {import('next').NextConfig} */
const nextConfig = {
    sassOptions: {
      includePaths: [path.join(process.cwd(), 'src/styles')],  // 
    },
  };
 
export default withNextIntl(nextConfig);