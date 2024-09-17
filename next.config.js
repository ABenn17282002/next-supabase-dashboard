/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Forwarded-Host',
              value: process.env.NEXT_PUBLIC_BASE_URL, // 環境変数からホストを取得
            },
            {
              key: 'Origin',
              value: process.env.NEXT_PUBLIC_BASE_URL, // 環境変数を使用
            },
          ],
        },
      ];
    },
  };
  
  module.exports = nextConfig;
  