import "./lib/polyfills/server-localstorage";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    typedRoutes: false,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  productionBrowserSourceMaps: false,
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = 'eval-source-map';
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**', // unsplash.com의 모든 경로 허용
      },
      {
        protocol: 'https',
        hostname: 'shopping-phinf.pstatic.net',
        port: '',
        pathname: '/**', // 네이버 쇼핑 이미지 허용
      },
      {
        protocol: 'https',
        hostname: 'bookthumb-phinf.pstatic.net',
        port: '',
        pathname: '/**', // 네이버 책 이미지 허용
      },
      {
        protocol: 'https',
        hostname: 'bookcover-phinf.pstatic.net',
        port: '',
        pathname: '/**', // 네이버 책 표지 이미지 허용
      },
    ],
  },
};

export default nextConfig;
