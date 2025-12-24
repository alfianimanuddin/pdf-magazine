import { PDFDocument } from 'pdf-lib'
import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'
import { fromPath } from 'pdf2pic'

export interface ProcessedPDF {
  totalPages: number
  coverImage: string
  pages: string[]
}

/**
 * Process PDF file: extract pages as images
 */
export async function processPDF(
  pdfBuffer: Buffer,
  magazineId: string,
  uploadDir: string
): Promise<ProcessedPDF> {
  console.log(`Starting PDF processing for magazine ${magazineId}`)

  // Validate input
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error('Invalid PDF buffer: buffer is empty')
  }

  if (!magazineId) {
    throw new Error('Magazine ID is required')
  }

  // Create directories
  const magazineDir = path.join(uploadDir, 'magazines', magazineId)
  const pagesDir = path.join(magazineDir, 'pages')

  try {
    await fs.mkdir(magazineDir, { recursive: true })
    await fs.mkdir(pagesDir, { recursive: true })
    console.log(`Created directories: ${magazineDir}`)
  } catch (error) {
    console.error('Error creating directories:', error)
    throw new Error(`Failed to create upload directories: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Save PDF temporarily
  const tempPdfPath = path.join(magazineDir, 'original.pdf')
  try {
    await fs.writeFile(tempPdfPath, pdfBuffer)
    console.log(`Saved PDF to ${tempPdfPath}, size: ${pdfBuffer.length} bytes`)
  } catch (error) {
    console.error('Error saving PDF file:', error)
    throw new Error(`Failed to save PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Get total pages
  let pdfDoc: PDFDocument
  let totalPages: number

  try {
    pdfDoc = await PDFDocument.load(pdfBuffer)
    totalPages = pdfDoc.getPageCount()
    console.log(`PDF loaded successfully: ${totalPages} pages`)

    if (totalPages === 0) {
      throw new Error('PDF has no pages')
    }
  } catch (error) {
    console.error('Error loading PDF:', error)
    throw new Error(`Failed to load PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Convert PDF pages to images using pdf2pic
  const options = {
    density: 200, // DPI
    saveFilename: 'page',
    savePath: pagesDir,
    format: 'png',
    width: 1920,
    height: 2560,
  }

  const convert = fromPath(tempPdfPath, options)

  const pages: string[] = new Array(totalPages)
  let coverImage = ''

  // Process pages in parallel with batching to avoid overwhelming the system
  const BATCH_SIZE = 5 // Process 5 pages at a time
  const batches: number[][] = []

  for (let i = 1; i <= totalPages; i += BATCH_SIZE) {
    const batch = []
    for (let j = i; j < i + BATCH_SIZE && j <= totalPages; j++) {
      batch.push(j)
    }
    batches.push(batch)
  }

  console.log(`Processing ${totalPages} pages in ${batches.length} batches...`)

  // Process each batch sequentially, but pages within batch in parallel
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex]
    console.log(`Processing batch ${batchIndex + 1}/${batches.length} (pages ${batch[0]}-${batch[batch.length - 1]})`)

    const batchPromises = batch.map(async (pageNum) => {
      try {
        const pageResult = await convert(pageNum, { responseType: 'image' })

        if (pageResult.path) {
          // Optimize image with sharp
          const optimizedPath = path.join(pagesDir, `page-${pageNum}.webp`)

          await sharp(pageResult.path)
            .webp({ quality: 78 })
            .toFile(optimizedPath)

          // Delete original PNG
          await fs.unlink(pageResult.path)

          const relativePath = `/uploads/magazines/${magazineId}/pages/page-${pageNum}.webp`

          // Store in correct position (pageNum - 1 for 0-indexed array)
          pages[pageNum - 1] = relativePath

          if (pageNum === 1) {
            coverImage = relativePath
          }

          return relativePath
        }
        return null
      } catch (error) {
        console.error(`Error processing page ${pageNum}:`, error)
        throw new Error(`Failed to process page ${pageNum}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })

    // Wait for all pages in this batch to complete
    await Promise.all(batchPromises)
  }

  console.log(`Successfully processed all ${totalPages} pages`)

  return {
    totalPages,
    coverImage,
    pages: pages.filter(p => p), // Remove any null entries
  }
}

/**
 * Delete magazine files
 */
export async function deleteMagazineFiles(
  magazineId: string,
  uploadDir: string
): Promise<void> {
  const magazineDir = path.join(uploadDir, 'magazines', magazineId)
  
  try {
    await fs.rm(magazineDir, { recursive: true, force: true })
  } catch (error) {
    console.error('Error deleting magazine files:', error)
  }
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
