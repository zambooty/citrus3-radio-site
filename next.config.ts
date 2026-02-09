import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '142.4.215.64',
      },
      {
        protocol: 'https',
        hostname: '**.mzstatic.com', // Apple Music artwork
      },
    ],
  },
};

export default nextConfig;
