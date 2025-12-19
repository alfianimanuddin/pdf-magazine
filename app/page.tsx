import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { BookOpen } from 'lucide-react'

export const revalidate = 60 // Revalidate every minute

export default async function HomePage() {
  const magazines = await prisma.magazine.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { views: true },
      },
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-slate-700" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Tada Todays Magazine
                </h1>
                <p className="text-sm text-slate-500">
                  Platform Majalah Digital Interaktif
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {magazines.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-700 mb-2">
              Belum Ada Majalah
            </h2>
            <p className="text-slate-500">
              Majalah digital akan muncul di sini setelah dipublikasikan.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Koleksi Majalah
              </h2>
              <p className="text-slate-600">
                Jelajahi koleksi majalah digital kami dengan pengalaman baca
                yang interaktif
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {magazines.map((magazine) => (
                <Link
                  key={magazine.id}
                  href={`/magazine/${magazine.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    {/* Cover Image */}
                    <div className="relative aspect-[3/4] bg-slate-100">
                      {magazine.coverImage ? (
                        <Image
                          src={magazine.coverImage}
                          alt={magazine.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Magazine Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-slate-900 mb-1 line-clamp-2 group-hover:text-slate-700">
                        {magazine.title}
                      </h3>
                      {magazine.description && (
                        <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                          {magazine.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{magazine.totalPages} halaman</span>
                        <span>{magazine._count.views} views</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {formatDate(magazine.createdAt)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} Tada Todays. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
