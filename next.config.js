/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    // SCSS configuration
  },
  // Optimized for Vercel deployment
  output: 'standalone',
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    BAIDU_OCR_API_KEY: process.env.BAIDU_OCR_API_KEY,
    BAIDU_OCR_SECRET_KEY: process.env.BAIDU_OCR_SECRET_KEY,
    LLM_API_KEY: process.env.LLM_API_KEY,
  },
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
};

module.exports = nextConfig;
