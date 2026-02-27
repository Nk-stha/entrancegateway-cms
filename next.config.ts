import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'entrance-gateway.fa3d020396e83193c3a9edec52dd9e71.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'api.entrancegateway.com',
      },
    ],
  },
};

export default nextConfig;
