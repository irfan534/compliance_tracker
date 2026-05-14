/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next-runtime',
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    devtoolSegmentExplorer: false,
    webpackBuildWorker: false,
  },
};

module.exports = nextConfig;
