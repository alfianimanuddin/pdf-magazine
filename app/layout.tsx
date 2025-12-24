import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/structured-data"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Majalah Digital Tadatodays",
    template: "%s | Tadatodays",
  },
  description:
    "Majalah digital Tadatodays menghadirkan liputan khusus, cerita mendalam, dan perspektif editorial pilihan dalam pengalaman membaca interaktif berkelas.",
  keywords: [
    "majalah digital",
    "majalah online Indonesia",
    "majalah digital Indonesia",
    "baca majalah online",
    "majalah interaktif",
    "Tadatodays",
    "majalah editorial",
    "liputan khusus",
    "jurnalisme mendalam",
    "media digital Indonesia",
    "berita mendalam",
  ],
  authors: [{ name: "Tadatodays" }],
  creator: "Tadatodays",
  publisher: "Tadatodays",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://majalah.tadatodays.com"),
  alternates: {
    canonical: "/",
    languages: {
      'id-ID': 'https://majalah.tadatodays.com',
      'id': 'https://majalah.tadatodays.com',
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://majalah.tadatodays.com",
    title: "Majalah Digital Tadatodays",
    description:
      "Ruang baca editorial Tadatodays untuk liputan khusus, cerita mendalam, dan narasi visual yang dikurasi dalam format majalah digital interaktif.",
    siteName: "Tadatodays Magazine",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Majalah Digital Tadatodays – Liputan Khusus & Editorial",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Majalah Digital Tadatodays",
    description:
      "Liputan khusus dan editorial pilihan Tadatodays, disajikan dalam format majalah digital interaktif berkelas.",
    images: ["/og-image.jpg"],
    creator: "@tadatodays",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.json",
  verification: {
    google: "5OgnD1t86ZI7HqW1qGdq0-KdXuL89Sj6T35kOfehHlE",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebSiteSchema()),
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
