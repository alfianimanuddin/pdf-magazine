import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { MagazineViewer } from '@/components/magazine/magazine-viewer'
import { headers } from 'next/headers'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps) {
  const magazine = await prisma.magazine.findUnique({
    where: { slug: params.slug, published: true },
  })

  if (!magazine) {
    return {
      title: 'Magazine Not Found',
    }
  }

  return {
    title: `${magazine.title} - Tada Todays Magazine`,
    description: magazine.description || `Read ${magazine.title} online`,
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
    <MagazineViewer
      pages={magazine.pages}
      title={magazine.title}
    />
  )
}
