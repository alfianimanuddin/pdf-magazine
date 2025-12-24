/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'majalah.tadatodays.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Disable optimization in production for standalone mode compatibility
    // Images are already optimized during PDF processing (WebP conversion)
    unoptimized: process.env.NODE_ENV === 'production',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  output: 'standalone',
}

module.exports = nextConfig
