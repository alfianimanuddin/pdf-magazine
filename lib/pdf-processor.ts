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
  // Create directories
  const magazineDir = path.join(uploadDir, 'magazines', magazineId)
  const pagesDir = path.join(magazineDir, 'pages')
  
  await fs.mkdir(magazineDir, { recursive: true })
  await fs.mkdir(pagesDir, { recursive: true })

  // Save PDF temporarily
  const tempPdfPath = path.join(magazineDir, 'original.pdf')
  await fs.writeFile(tempPdfPath, pdfBuffer)

  // Get total pages
  const pdfDoc = await PDFDocument.load(pdfBuffer)
  const totalPages = pdfDoc.getPageCount()

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
  
  const pages: string[] = []
  let coverImage = ''

  // Convert each page
  for (let i = 1; i <= totalPages; i++) {
    const pageResult = await convert(i, { responseType: 'image' })
    
    if (pageResult.path) {
      // Optimize image with sharp
      const optimizedPath = path.join(pagesDir, `page-${i}.webp`)
      
      await sharp(pageResult.path)
        .webp({ quality: 78 })
        .toFile(optimizedPath)
      
      // Delete original PNG
      await fs.unlink(pageResult.path)
      
      const relativePath = `/uploads/magazines/${magazineId}/pages/page-${i}.webp`
      pages.push(relativePath)
      
      if (i === 1) {
        coverImage = relativePath
      }
    }
  }

  return {
    totalPages,
    coverImage,
    pages,
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
