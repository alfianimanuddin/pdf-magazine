import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { MagazineViewer } from '@/components/magazine/magazine-viewer'
import { headers } from 'next/headers'
import { generateMagazineSchema, generateBreadcrumbSchema } from '@/lib/structured-data'

interface PageProps {
  params: {
    slug: string
  }
}

// Force dynamic rendering because we use headers() for view tracking
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps) {
  const magazine = await prisma.magazine.findUnique({
    where: { slug: params.slug, published: true },
    include: {
      pages: {
        orderBy: { pageNumber: 'asc' },
        take: 1,
      },
    },
  })

  if (!magazine) {
    return {
      title: 'Magazine Not Found',
    }
  }

  // Use coverImage if available, otherwise use first page image, fallback to default
  const ogImagePath = magazine.coverImage ||
                      (magazine.pages[0]?.imagePath) ||
                      '/og-image.jpg'

  const baseUrl = 'https://majalah.tadatodays.com'
  const pageUrl = `${baseUrl}/detail/${magazine.slug}`

  // Ensure absolute URL for social media platforms (WhatsApp, Facebook, etc.)
  const ogImage = ogImagePath.startsWith('http')
    ? ogImagePath
    : `${baseUrl}${ogImagePath.startsWith('/') ? ogImagePath : '/' + ogImagePath}`

  return {
    title: `${magazine.title} - Tada Todays Magazine`,
    description: magazine.description || `Read ${magazine.title} online`,
    alternates: {
      canonical: `/detail/${magazine.slug}`,
    },
    openGraph: {
      type: 'article',
      locale: 'id_ID',
      url: pageUrl,
      title: magazine.title,
      description: magazine.description || `Read ${magazine.title} online`,
      siteName: 'Tadatodays Magazine',
      publishedTime: magazine.createdAt.toISOString(),
      modifiedTime: magazine.updatedAt.toISOString(),
      authors: ['Tadatodays'],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: magazine.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: magazine.title,
      description: magazine.description || `Read ${magazine.title} online`,
      images: [ogImage],
      creator: '@tadatodays',
    },
  }
}

export default async function MagazinePage({ params }: PageProps) {
  const magazine = await prisma.magazine.findUnique({
    where: { slug: params.slug, published: true },
    include: {
      pages: {
        orderBy: { pageNumber: 'asc' },
      },
    },
  })

  if (!magazine) {
    notFound()
  }

  // Track view (in production, you might want to do this via API to avoid blocking)
  const headersList = headers()
  const ipAddress = headersList.get('x-forwarded-for') || 
                    headersList.get('x-real-ip') || 
                    'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  // Create view record
  await prisma.magazineView.create({
    data: {
      magazineId: magazine.id,
      ipAddress,
      userAgent,
    },
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateMagazineSchema({ magazine })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(magazine)),
        }}
      />
      <MagazineViewer
        pages={magazine.pages}
        title={magazine.title}
      />
    </>
  )
}
