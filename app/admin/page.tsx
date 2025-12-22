import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen, Plus, LogOut, Eye, Edit, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'

export default async function AdminDashboard() {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  const magazines = await prisma.magazine.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { views: true },
      },
    },
  })

  const stats = {
    total: magazines.length,
    published: magazines.filter((m) => m.published).length,
    draft: magazines.filter((m) => !m.published).length,
    totalViews: magazines.reduce((acc, m) => acc + m._count.views, 0),
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-slate-700" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-slate-500">
                  {session.user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Lihat Website
                </Button>
              </Link>
              <form
                action={async () => {
                  'use server'
                  const { signOut } = await import('@/lib/auth')
                  await signOut()
                }}
              >
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-sm text-slate-500 mb-1">Total Majalah</div>
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-sm text-slate-500 mb-1">Terpublikasi</div>
            <div className="text-3xl font-bold text-green-600">
              {stats.published}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-sm text-slate-500 mb-1">Draft</div>
            <div className="text-3xl font-bold text-amber-600">
              {stats.draft}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-sm text-slate-500 mb-1">Total Views</div>
            <div className="text-3xl font-bold text-slate-900">
              {stats.totalViews}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Daftar Majalah
          </h2>
          <Link href="/admin/upload">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Majalah
            </Button>
          </Link>
        </div>

        {/* Magazine List */}
        {magazines.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              Belum Ada Majalah
            </h3>
            <p className="text-slate-500 mb-6">
              Upload majalah PDF pertama Anda untuk memulai
            </p>
            <Link href="/admin/upload">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Majalah
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Majalah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Halaman
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {magazines.map((magazine) => (
                  <tr key={magazine.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-16 w-12 flex-shrink-0 relative bg-slate-100 rounded">
                          {magazine.coverImage ? (
                            <Image
                              src={magazine.coverImage}
                              alt={magazine.title}
                              fill
                              className="object-cover rounded"
                            />
                          ) : (
                            <BookOpen className="h-6 w-6 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {magazine.title}
                          </div>
                          {magazine.description && (
                            <div className="text-sm text-slate-500 line-clamp-1">
                              {magazine.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {magazine.published ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {magazine.totalPages}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {magazine._count.views}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(magazine.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {magazine.published && (
                          <Link
                            href={`/magazine/${magazine.slug}`}
                            target="_blank"
                          >
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Link href={`/admin/edit/${magazine.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <form
                          action={async () => {
                            'use server'
                            const { prisma } = await import('@/lib/prisma')
                            const { deleteMagazineFiles } = await import('@/lib/pdf-processor')
                            
                            await prisma.magazine.delete({
                              where: { id: magazine.id },
                            })
                            
                            await deleteMagazineFiles(
                              magazine.id,
                              process.env.UPLOAD_DIR || './public/uploads'
                            )
                            
                            const { revalidatePath } = await import('next/cache')
                            revalidatePath('/admin')
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            type="submit"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
