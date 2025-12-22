import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Tada Todays Magazine Platform",
    template: "%s | Tada Todays",
  },
  description: "Digital magazine platform with interactive page flipping. Read the latest issues of Tada Todays magazine online.",
  keywords: ["magazine", "digital magazine", "Tada Todays", "online reading", "flip book", "interactive magazine"],
  authors: [{ name: "Tada Todays" }],
  creator: "Tada Todays",
  publisher: "Tada Todays",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://majalah.tadatodays.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://majalah.tadatodays.com",
    title: "Tada Todays Magazine Platform",
    description: "Digital magazine platform with interactive page flipping. Read the latest issues of Tada Todays magazine online.",
    siteName: "Tada Todays Magazine",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tada Todays Magazine Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tada Todays Magazine Platform",
    description: "Digital magazine platform with interactive page flipping. Read the latest issues of Tada Todays magazine online.",
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
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml" },
    ],
  },
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
