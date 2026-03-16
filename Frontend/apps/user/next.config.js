/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/auth', '@repo/ui', '@repo/fonts'],
};

export default nextConfig;
