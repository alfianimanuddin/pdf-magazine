import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering to ensure fresh sitemap
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://majalah.tadatodays.com'

  // Fetch all published magazines
  const magazines = await prisma.magazine.findMany({
    where: { published: true },
    select: {
      slug: true,
      updatedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Magazine URLs
  const magazineUrls: MetadataRoute.Sitemap = magazines.map((magazine) => ({
    url: `${baseUrl}/detail/${magazine.slug}`,
    lastModified: magazine.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ]

  return [...staticPages, ...magazineUrls]
}
