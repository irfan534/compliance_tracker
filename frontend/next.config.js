const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next-runtime',
  outputFileTracingRoot: path.join(__dirname, '../'),
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
