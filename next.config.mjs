/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
    outputFileTracingIncludes: {
      '/**': ['./prisma/dev.db', './prisma/**/*'],
    },
  },
};

export default nextConfig;
