/** @type {import('next').NextConfig} */
const nextConfig = {
  // 最小化配置
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 移除 standalone 输出，可能导致问题
  // output: 'standalone',
};

export default nextConfig;
