import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds
    ignoreBuildErrors: false,
  },
  experimental: {
    // Disable turbopack to avoid Sanity-related build issues
    turbo: undefined,
  },
};

export default nextConfig;
