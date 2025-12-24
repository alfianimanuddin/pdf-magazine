import { Magazine, MagazinePage } from '@prisma/client'

export interface StructuredDataProps {
  magazine: Magazine & {
    pages: MagazinePage[]
  }
  baseUrl?: string
}

/**
 * Generate Periodical/PublicationIssue schema for a magazine
 * Based on schema.org/Periodical and schema.org/PublicationIssue
 * This enables rich snippets in Google search results
 */
export function generateMagazineSchema(props: StructuredDataProps) {
  const { magazine, baseUrl = 'https://majalah.tadatodays.com' } = props

  // Determine the best cover image
  const coverImage =
    magazine.coverImage ||
    magazine.pages[0]?.imagePath ||
    '/og-image.jpg'

  // Ensure absolute URL for schema.org compliance
  const absoluteCoverImage = coverImage.startsWith('http')
    ? coverImage
    : `${baseUrl}${coverImage.startsWith('/') ? coverImage : '/' + coverImage}`

  return {
    '@context': 'https://schema.org',
    '@type': 'PublicationIssue',
    '@id': `${baseUrl}/detail/${magazine.slug}`,
    name: magazine.title,
    description:
      magazine.description ||
      `Baca ${magazine.title} - Majalah Digital Tadatodays`,
    url: `${baseUrl}/detail/${magazine.slug}`,
    image: {
      '@type': 'ImageObject',
      url: absoluteCoverImage,
      width: 1200,
      height: 630,
    },
    datePublished: magazine.createdAt.toISOString(),
    dateModified: magazine.updatedAt.toISOString(),
    inLanguage: 'id-ID',
    numberOfPages: magazine.totalPages,
    publisher: {
      '@type': 'Organization',
      '@id': `${baseUrl}#organization`,
      name: 'Tadatodays',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icon.svg`,
      },
    },
    isPartOf: {
      '@type': 'Periodical',
      '@id': `${baseUrl}#periodical`,
      name: 'Majalah Digital Tadatodays',
      description:
        'Platform majalah digital Indonesia dengan pengalaman membaca interaktif',
      publisher: {
        '@id': `${baseUrl}#organization`,
      },
    },
  }
}

/**
 * Generate Organization schema for Tadatodays
 * Used as a referenced entity across multiple pages
 */
export function generateOrganizationSchema(
  baseUrl = 'https://majalah.tadatodays.com'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: 'Tadatodays',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/icon.svg`,
    },
    sameAs: [
      'https://twitter.com/tadatodays',
      // Add other social media profiles here as needed
    ],
  }
}

/**
 * Generate WebSite schema with potential SearchAction
 * Enables site-wide features in search results
 */
export function generateWebSiteSchema(
  baseUrl = 'https://majalah.tadatodays.com'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}#website`,
    name: 'Majalah Digital Tadatodays',
    url: baseUrl,
    description:
      'Platform majalah digital Indonesia dengan pengalaman membaca interaktif berkelas',
    inLanguage: 'id-ID',
    publisher: {
      '@id': `${baseUrl}#organization`,
    },
  }
}

/**
 * Generate BreadcrumbList schema for magazine detail page
 * Improves navigation understanding for search engines
 */
export function generateBreadcrumbSchema(
  magazine: Magazine,
  baseUrl = 'https://majalah.tadatodays.com'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: magazine.title,
        item: `${baseUrl}/detail/${magazine.slug}`,
      },
    ],
  }
}
