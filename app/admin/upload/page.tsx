'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [published, setPublished] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 52428800, // 50MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0])
        if (!title) {
          const fileName = acceptedFiles[0].name.replace('.pdf', '')
          setTitle(fileName)
        }
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

    if (!file || !title) {
      setErrorMessage('Mohon isi semua field yang diperlukan')
      return
    }

    setIsUploading(true)
    setUploadStatus('uploading')
    setUploadProgress(0)
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)
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

      const response = await fetch('/api/magazines/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload gagal')
      }

      setUploadStatus('processing')
      setUploadProgress(100)

      const result = await response.json()

      setTimeout(() => {
        setUploadStatus('success')
        setTimeout(() => {
          router.push('/admin')
          router.refresh()
        }, 1500)
      }, 500)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Terjadi kesalahan saat upload')
    } finally {
      setIsUploading(false)
    }
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
                Upload Majalah Baru
              </h1>
              <p className="text-sm text-slate-500">
                Upload file PDF untuk membuat majalah digital
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload File PDF</CardTitle>
              <CardDescription>
                File maksimal 50MB. Halaman akan otomatis dikonversi menjadi gambar.
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
                      Maksimal 50MB
                    </p>
                  </div>
                )}
              </div>
              {errorMessage && (
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
                  disabled={isUploading}
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
                  disabled={isUploading}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  disabled={isUploading}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
                <Label htmlFor="published" className="cursor-pointer">
                  Publikasikan sekarang
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
                      <span className="text-slate-600">Mengupload file...</span>
                      <span className="font-medium">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {uploadStatus === 'processing' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Memproses PDF...</span>
                      <span className="font-medium">100%</span>
                    </div>
                    <Progress value={100} />
                    <p className="text-xs text-slate-500 mt-2">
                      Mengkonversi halaman PDF menjadi gambar. Ini mungkin memakan waktu beberapa saat...
                    </p>
                  </div>
                )}

                {uploadStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Upload berhasil! Mengalihkan...</span>
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
              <Button type="button" variant="outline" disabled={isUploading}>
                Batal
              </Button>
            </Link>
            <Button type="submit" disabled={isUploading || !file || !title}>
              {isUploading ? 'Mengupload...' : 'Upload Majalah'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
