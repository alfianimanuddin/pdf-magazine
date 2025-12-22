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
    // Disable optimization for local uploads to ensure they work in standalone mode
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
