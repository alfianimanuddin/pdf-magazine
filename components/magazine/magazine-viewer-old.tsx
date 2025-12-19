'use client'

import React, { useRef, useState, useCallback } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface Page {
  id: string
  pageNumber: number
  imagePath: string
}

interface MagazineViewerProps {
  pages: Page[]
  title: string
}

export function MagazineViewer({ pages, title }: MagazineViewerProps) {
  const bookRef = useRef<any>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalPages = pages.length

  const goToNextPage = useCallback(() => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext()
    }
  }, [])

  const goToPrevPage = useCallback(() => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev()
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.2, 2))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.2, 0.6))
  }, [])

  const onFlip = useCallback((e: any) => {
    setCurrentPage(e.data)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-sm px-6 py-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-gray-800 text-m font-semibold">{title}</h1>
            <span className="text-gray-600 text-sm font-medium">
              pages {currentPage + 1} - {Math.min(currentPage + 2, totalPages)} of {totalPages}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomOut}
              className="text-gray-700 hover:bg-gray-200"
              disabled={zoom <= 0.6}
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <span className="text-gray-700 text-sm min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomIn}
              className="text-gray-700 hover:bg-gray-200"
              disabled={zoom >= 2}
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-gray-700 hover:bg-gray-200"
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Magazine Book */}
      <div className="relative z-10 magazine-container">
        <HTMLFlipBook
          ref={bookRef}
          width={900 * zoom}
          height={1200 * zoom}
          size="stretch"
          minWidth={500 * zoom}
          maxWidth={1800 * zoom}
          minHeight={667 * zoom}
          maxHeight={2400 * zoom}
          showCover={true}
          flippingTime={1000}
          usePortrait={false}
          startPage={0}
          drawShadow={true}
          maxShadowOpacity={0.5}
          showPageCorners={true}
          disableFlipByClick={false}
          style={{}}
          startZIndex={0}
          autoSize={true}
          mobileScrollSupport={true}
          useMouseEvents={true}
          swipeDistance={30}
          clickEventForward={true}
          renderOnlyPageLengthChange={false}
          onFlip={onFlip}
          className="magazine-book"
        >
          {pages.map((page) => (
            <div
              key={page.id}
              className="page bg-white shadow-2xl"
              data-density="hard"
            >
              <div className="page-content relative w-full h-full">
                <Image
                  src={page.imagePath}
                  alt={`Page ${page.pageNumber}`}
                  fill
                  className="object-contain"
                  priority={page.pageNumber <= 2}
                />
              </div>
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      {/* Navigation Controls - Left & Right Buttons */}
      {/* Previous Page Button - Left Side */}
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevPage}
        disabled={currentPage === 0}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-12 w-12 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg text-gray-700 hover:bg-gray-100 disabled:opacity-30"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      {/* Next Page Button - Right Side */}
      <Button
        variant="ghost"
        size="icon"
        onClick={goToNextPage}
        disabled={currentPage >= totalPages - 1}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-12 w-12 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg text-gray-700 hover:bg-gray-100 disabled:opacity-30"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Page Thumbnails (Optional - can be toggled) */}
      {/* <div className="absolute right-4 top-24 bottom-24 overflow-y-auto z-20 hidden lg:block">
        <div className="flex flex-col gap-2 p-2 bg-black/40 backdrop-blur-sm rounded-lg">
          {pages.map((page, idx) => (
            <button
              key={page.id}
              onClick={() => bookRef.current?.pageFlip().flip(idx)}
              className={cn(
                "relative w-16 h-20 rounded overflow-hidden border-2 transition-all",
                currentPage === idx
                  ? "border-white scale-110"
                  : "border-white/20 hover:border-white/50"
              )}
            >
              <Image
                src={page.imagePath}
                alt={`Thumbnail ${page.pageNumber}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div> */}
    </div>
  )
}
