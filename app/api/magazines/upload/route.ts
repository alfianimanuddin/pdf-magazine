import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { processPDF, generateSlug } from '@/lib/pdf-processor'
import fs from 'fs/promises'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const published = formData.get('published') === 'true'

    if (!file || !title) {
      return NextResponse.json(
        { error: 'File and title are required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (50MB)
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

    // Create magazine record first to get ID
    const slug = generateSlug(title)

    // Clean up any orphaned/incomplete records with this slug
    // (these are records where PDF processing failed previously)
    await prisma.magazine.deleteMany({
      where: {
        slug,
        OR: [
          { pdfPath: '' },
          { totalPages: 0 },
        ],
      },
    })

    // Check if slug exists (after cleanup)
    const existingMagazine = await prisma.magazine.findUnique({
      where: { slug },
    })

    if (existingMagazine) {
      return NextResponse.json(
        { error: 'Majalah dengan judul serupa sudah ada' },
        { status: 400 }
      )
    }

    const magazine = await prisma.magazine.create({
      data: {
        title,
        description,
        slug,
        published,
        userId: session.user.id,
        pdfPath: '', // Will be updated after processing
        totalPages: 0, // Will be updated after processing
      },
    })

    // Process PDF
    const uploadDir = process.env.UPLOAD_DIR || './public/uploads'
    await fs.mkdir(uploadDir, { recursive: true })

    try {
      const { totalPages, coverImage, pages } = await processPDF(
        buffer,
        magazine.id,
        uploadDir
      )

      // Save original PDF
      const pdfPath = `/uploads/magazines/${magazine.id}/original.pdf`

      // Update magazine with processed data
      await prisma.magazine.update({
        where: { id: magazine.id },
        data: {
          totalPages,
          coverImage,
          pdfPath,
        },
      })

      // Create page records
      await prisma.magazinePage.createMany({
        data: pages.map((imagePath, index) => ({
          magazineId: magazine.id,
          pageNumber: index + 1,
          imagePath,
        })),
      })

      return NextResponse.json({
        success: true,
        magazine: {
          id: magazine.id,
          title: magazine.title,
          slug: magazine.slug,
        },
      })
    } catch (processingError) {
      // Delete magazine if processing fails
      try {
        await prisma.magazine.delete({
          where: { id: magazine.id },
        })
      } catch (deleteError) {
        console.error('Failed to cleanup magazine after processing error:', deleteError)
        // Continue to throw the original processing error
      }
      throw processingError
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
