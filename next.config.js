/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'majalah.tadatodays.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Enable modern image formats for better performance
    formats: ['image/avif', 'image/webp'],
    // Responsive breakpoints for optimal image sizing
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 30 days
    minimumCacheTTL: 2592000,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  output: 'standalone',
}

module.exports = nextConfig
