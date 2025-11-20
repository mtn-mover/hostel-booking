import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbo: {
    root: "./",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'a0.muscache.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'z1.muscache.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'airbnb.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.airbnb.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
