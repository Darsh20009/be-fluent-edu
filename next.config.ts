import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    allowedDevOrigins: ['*'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
