/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Skip ESLint errors during `next build`
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
