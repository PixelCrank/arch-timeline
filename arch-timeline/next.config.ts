import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Disable turbopack to avoid Sanity-related build issues
    turbo: undefined,
  },
};

export default nextConfig;
