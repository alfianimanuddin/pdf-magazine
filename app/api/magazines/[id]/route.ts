import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { processPDF, generateSlug, deleteMagazineFiles } from '@/lib/pdf-processor'
import fs from 'fs/promises'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const magazine = await prisma.magazine.findUnique({
      where: { id },
    })

    if (!magazine) {
      return NextResponse.json({ error: 'Magazine not found' }, { status: 404 })
    }

    if (magazine.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ magazine })
  } catch (error) {
    console.error('Get magazine error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get magazine' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if magazine exists and belongs to user
    const existingMagazine = await prisma.magazine.findUnique({
      where: { id },
    })

    if (!existingMagazine) {
      return NextResponse.json({ error: 'Magazine not found' }, { status: 404 })
    }

    if (existingMagazine.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const published = formData.get('published') === 'true'

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Generate new slug if title changed
    const slug = title !== existingMagazine.title
      ? generateSlug(title)
      : existingMagazine.slug

    // Check if new slug conflicts with another magazine
    if (slug !== existingMagazine.slug) {
      const slugConflict = await prisma.magazine.findUnique({
        where: { slug },
      })

      if (slugConflict) {
        return NextResponse.json(
          { error: 'Majalah dengan judul serupa sudah ada' },
          { status: 400 }
        )
      }
    }

    // If no file is uploaded, just update the metadata
    if (!file) {
      const updatedMagazine = await prisma.magazine.update({
        where: { id },
        data: {
          title,
          description,
          slug,
          published,
        },
      })

      return NextResponse.json({
        success: true,
        magazine: {
          id: updatedMagazine.id,
          title: updatedMagazine.title,
          slug: updatedMagazine.slug,
        },
      })
    }

    // Validate file if provided
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      )
    }

    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = process.env.UPLOAD_DIR || './public/uploads'
    await fs.mkdir(uploadDir, { recursive: true })

    try {
      // Delete old magazine files
      await deleteMagazineFiles(id, uploadDir)

      // Delete old page records
      await prisma.magazinePage.deleteMany({
        where: { magazineId: id },
      })

      // Process new PDF
      const { totalPages, coverImage, pages } = await processPDF(
        buffer,
        id,
        uploadDir
      )

      const pdfPath = `/uploads/magazines/${id}/original.pdf`

      // Update magazine with new data
      const updatedMagazine = await prisma.magazine.update({
        where: { id },
        data: {
          title,
          description,
          slug,
          published,
          totalPages,
          coverImage,
          pdfPath,
        },
      })

      // Create new page records
      await prisma.magazinePage.createMany({
        data: pages.map((imagePath, index) => ({
          magazineId: id,
          pageNumber: index + 1,
          imagePath,
        })),
      })

      return NextResponse.json({
        success: true,
        magazine: {
          id: updatedMagazine.id,
          title: updatedMagazine.title,
          slug: updatedMagazine.slug,
        },
      })
    } catch (processingError) {
      console.error('PDF processing error:', processingError)
      throw processingError
    }
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 }
    )
  }
}
