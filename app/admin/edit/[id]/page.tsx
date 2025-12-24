'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Magazine {
  id: string
  title: string
  description: string | null
  published: boolean
  slug: string
  totalPages: number
  coverImage: string | null
}

export default function EditMagazinePage() {
  const router = useRouter()
  const params = useParams()
  const magazineId = params.id as string

  const [magazine, setMagazine] = useState<Magazine | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [published, setPublished] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadMagazine() {
      try {
        const response = await fetch(`/api/magazines/${magazineId}`)

        if (!response.ok) {
          throw new Error('Failed to load magazine')
        }

        const data = await response.json()
        setMagazine(data.magazine)
        setTitle(data.magazine.title)
        setDescription(data.magazine.description || '')
        setPublished(data.magazine.published)
      } catch (error) {
        console.error('Load error:', error)
        setErrorMessage('Gagal memuat data majalah')
      } finally {
        setIsLoading(false)
      }
    }

    loadMagazine()
  }, [magazineId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 52428800, // 50MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0])
      }
    },
    onDropRejected: (fileRejections) => {
      if (fileRejections[0]?.errors[0]?.code === 'file-too-large') {
        setErrorMessage('File terlalu besar. Maksimal 50MB')
      } else {
        setErrorMessage('File tidak valid. Hanya file PDF yang diizinkan')
      }
    },
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title) {
      setErrorMessage('Mohon isi judul majalah')
      return
    }

    setIsUpdating(true)
    setUploadStatus('uploading')
    setUploadProgress(0)
    setErrorMessage('')

    try {
      const formData = new FormData()
      if (file) {
        formData.append('file', file)
      }
      formData.append('title', title)
      formData.append('description', description)
      formData.append('published', published.toString())

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 200)

      // Create AbortController with extended timeout (10 minutes for large PDFs)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 600000) // 10 minutes

      const response = await fetch(`/api/magazines/${magazineId}`, {
        method: 'PUT',
        body: formData,
        signal: controller.signal,
      }).finally(() => {
        clearTimeout(timeoutId)
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json()
          throw new Error(error.error || 'Update gagal')
        } else {
          throw new Error(`Update gagal: ${response.status} ${response.statusText}`)
        }
      }

      setUploadStatus('processing')
      setUploadProgress(100)

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Respons server tidak valid')
      }

      await response.json()

      setTimeout(() => {
        setUploadStatus('success')
        setTimeout(() => {
          router.push('/admin')
          router.refresh()
        }, 1500)
      }, 500)
    } catch (error) {
      console.error('Update error:', error)
      setUploadStatus('error')

      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setErrorMessage('Update timeout - PDF terlalu besar atau koneksi lambat. Silakan coba lagi atau gunakan file yang lebih kecil.')
        } else {
          setErrorMessage(error.message)
        }
      } else {
        setErrorMessage('Terjadi kesalahan saat update')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Memuat data majalah...</p>
        </div>
      </div>
    )
  }

  if (!magazine) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Majalah tidak ditemukan
          </h2>
          <p className="text-slate-600 mb-6">{errorMessage || 'Majalah yang Anda cari tidak ada'}</p>
          <Link href="/admin">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Edit Majalah
              </h1>
              <p className="text-sm text-slate-500">
                Perbarui informasi majalah atau ganti file PDF
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle>Ganti File PDF (Opsional)</CardTitle>
              <CardDescription>
                Upload file PDF baru untuk mengganti yang lama. File maksimal 50MB.
                {!file && (
                  <span className="block mt-2 text-slate-600">
                    File saat ini: <span className="font-medium">{magazine.totalPages} halaman</span>
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary/50'}
                  ${file ? 'bg-slate-50' : ''}
                `}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-slate-900">{file.name}</p>
                      <p className="text-sm text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-1">
                      Drag & drop file PDF di sini, atau klik untuk memilih file
                    </p>
                    <p className="text-sm text-slate-400">
                      Biarkan kosong jika tidak ingin mengganti file
                    </p>
                  </div>
                )}
              </div>
              {errorMessage && uploadStatus === 'idle' && (
                <div className="mt-4 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errorMessage}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Magazine Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Majalah</CardTitle>
              <CardDescription>
                Informasi yang akan ditampilkan di website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Majalah *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Tada Todays Edisi Januari 2025"
                  required
                  disabled={isUpdating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi singkat tentang isi majalah ini..."
                  rows={3}
                  disabled={isUpdating}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  disabled={isUpdating}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
                <Label htmlFor="published" className="cursor-pointer">
                  Publikasikan
                </Label>
              </div>
              <p className="text-sm text-slate-500">
                Jika tidak dipublikasikan, majalah akan disimpan sebagai draft
              </p>
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {uploadStatus !== 'idle' && (
            <Card>
              <CardContent className="pt-6">
                {uploadStatus === 'uploading' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">
                        {file ? 'Mengupload file...' : 'Menyimpan perubahan...'}
                      </span>
                      <span className="font-medium">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {uploadStatus === 'processing' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">
                        {file ? 'Memproses PDF...' : 'Menyimpan...'}
                      </span>
                      <span className="font-medium">100%</span>
                    </div>
                    <Progress value={100} />
                    {file && (
                      <p className="text-xs text-slate-500 mt-2">
                        Mengkonversi halaman PDF menjadi gambar berkualitas tinggi. Untuk PDF dengan banyak halaman,
                        proses ini bisa memakan waktu beberapa menit. Mohon jangan tutup halaman ini.
                      </p>
                    )}
                  </div>
                )}

                {uploadStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Update berhasil! Mengalihkan...</span>
                  </div>
                )}

                {uploadStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">{errorMessage}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/admin">
              <Button type="button" variant="outline" disabled={isUpdating}>
                Batal
              </Button>
            </Link>
            <Button type="submit" disabled={isUpdating || !title}>
              {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
