'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, ZoomIn, ZoomOut, Share2 } from 'lucide-react'
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
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [showTitle, setShowTitle] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const magazineRef = useRef<HTMLDivElement>(null)

  const totalPages = pages.length

  // Detect screen size and window dimensions
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Responsive dimensions - recalculate when zoom or window size changes
  const dimensions = React.useMemo(() => {
    if (!windowSize.width) return { width: 300, height: 400, minWidth: 300, maxWidth: 300, minHeight: 400, maxHeight: 400 }

    // In fullscreen, use larger dimensions
    if (isFullscreen) {
      if (isMobile) {
        const pageWidth = windowSize.width * 0.96 // 96% of screen width
        const pageHeight = pageWidth * 1.414
        return {
          width: pageWidth * zoom,
          height: pageHeight * zoom,
          minWidth: 280 * zoom,
          maxWidth: pageWidth * zoom,
          minHeight: 396 * zoom,
          maxHeight: pageHeight * 2 * zoom, // Allow flexible height
        }
      } else if (isTablet) {
        const pageWidth = windowSize.width // Full width for tablet
        const pageHeight = pageWidth * 1.414
        return {
          width: pageWidth * zoom,
          height: Math.min(pageHeight, windowSize.height - 40) * zoom,
          minWidth: 500 * zoom,
          maxWidth: pageWidth * zoom,
          minHeight: 700 * zoom,
          maxHeight: (windowSize.height - 40) * zoom,
        }
      }
      // Desktop fullscreen - much larger
      return {
        width: 1200 * zoom,
        height: 1600 * zoom,
        minWidth: 800 * zoom,
        maxWidth: 2400 * zoom,
        minHeight: 1000 * zoom,
        maxHeight: 3200 * zoom,
      }
    }

    // Normal mode dimensions
    if (isMobile) {
      const pageWidth = windowSize.width * 0.96 // 96% of screen width
      const pageHeight = pageWidth * 1.414 // A4 aspect ratio (√2)
      return {
        width: pageWidth * zoom,
        height: pageHeight * zoom,
        minWidth: 280 * zoom,
        maxWidth: pageWidth * zoom,
        minHeight: 396 * zoom,
        maxHeight: pageHeight * 2 * zoom, // Allow flexible height
      }
    } else if (isTablet) {
      const pageWidth = windowSize.width // Full width for tablet
      const pageHeight = pageWidth * 1.414
      return {
        width: pageWidth * zoom,
        height: Math.min(pageHeight, windowSize.height - 120) * zoom,
        minWidth: 400 * zoom,
        maxWidth: pageWidth * zoom,
        minHeight: 534 * zoom,
        maxHeight: (windowSize.height - 120) * zoom,
      }
    }
    return {
      width: 900 * zoom,
      height: 1200 * zoom,
      minWidth: 500 * zoom,
      maxWidth: 1800 * zoom,
      minHeight: 667 * zoom,
      maxHeight: 2400 * zoom,
    }
  }, [isMobile, isTablet, zoom, windowSize.width, windowSize.height, isFullscreen])

  const goToNextPage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext()
    }
  }, [])

  const goToPrevPage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
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

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out ${title}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled or failed')
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }, [title])

  // Handle mouse movement to show/hide controls in fullscreen
  const handleMouseMove = useCallback(() => {
    if (!isFullscreen) return

    setShowControls(true)

    // Clear existing timeout
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }

    // Set new timeout to hide controls after 3 seconds of inactivity
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }, [isFullscreen])

  // Handle mouse enter to show controls
  const handleMouseEnter = useCallback(() => {
    if (isFullscreen) {
      setShowControls(true)
    }
  }, [isFullscreen])

  // Handle click to toggle controls when clicking outside magazine
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (magazineRef.current && !magazineRef.current.contains(e.target as Node)) {
      setShowControls((prev) => !prev)

      // Auto-hide after 3 seconds
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current)
      }
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }, [])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current)
      }
    }
  }, [])

  // Reset controls visibility when entering/exiting fullscreen
  useEffect(() => {
    if (isFullscreen) {
      // Show controls initially when entering fullscreen
      setShowControls(true)
      // Hide controls after a delay when entering fullscreen
      const timeout = setTimeout(() => {
        setShowControls(false)
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [isFullscreen])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onClick={handleContainerClick}
    >
      {/* Header - Top Bar */}
      <div className={`absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm px-4 md:px-4 py-2 border-b border-gray-100 transition-transform duration-300 ${
        isFullscreen && !showControls ? '-translate-y-full' : 'translate-y-0'
      }`}>
        <div className="mx-auto flex items-center justify-between gap-4">
          {/* Mobile Layout: Fullscreen - Title - Share */}
          {isMobile ? (
            <>
              {/* Fullscreen Button - Left */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-9 w-9"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </Button>

              {/* Title - Center */}
              <h1 className="text-gray-800 text-base font-bold flex-1 text-center">{title}</h1>

              {/* Share Button - Right */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-9 w-9"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              {/* Desktop/Tablet Layout */}
              {showTitle ? (
                <>
                  {/* Title - Left */}
                  <h1 className="text-gray-800 text-base md:text-m font-bold">{title}</h1>

                  {/* Page Counter - Center */}
                  <button
                    onClick={() => setShowTitle(false)}
                    className="absolute left-1/2 -translate-x-1/2 hover:opacity-70 transition-opacity cursor-pointer"
                  >
                    <span className="text-gray-700 text-sm md:text-sm font-medium">
                      {currentPage === 0
                        ? `Page 1 of ${totalPages}`
                        : currentPage >= totalPages - 1
                          ? `Page ${totalPages} of ${totalPages}`
                          : `Pages ${currentPage + 1} - ${Math.min(currentPage + 2, totalPages)} of ${totalPages}`
                      }
                    </span>
                  </button>
                </>
              ) : (
                <>
                  {/* Page Counter - Left */}
                  <span className="text-gray-700 text-sm md:text-sm font-medium">
                    {currentPage === 0
                      ? `Page 1 of ${totalPages}`
                      : currentPage >= totalPages - 1
                        ? `Page ${totalPages} of ${totalPages}`
                        : `Pages ${currentPage + 1} - ${Math.min(currentPage + 2, totalPages)} of ${totalPages}`
                    }
                  </span>

                  {/* Title - Center */}
                  <button
                    onClick={() => setShowTitle(true)}
                    className="absolute left-1/2 -translate-x-1/2 hover:opacity-70 transition-opacity cursor-pointer"
                  >
                    <h1 className="text-gray-800 text-base md:text-m font-bold">{title}</h1>
                  </button>
                </>
              )}

              {/* Share Button - Right */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-9 w-9"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Magazine Book */}
      <div
        ref={magazineRef}
        className={`relative z-10 magazine-container ${
          isMobile || isTablet ? 'w-full' : 'transition-all duration-300'
        }`}
        style={{
          transform: currentPage === 0 && !isMobile && !isTablet
            ? `translateX(-250px)`
            : 'translateX(0)',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <HTMLFlipBook
          key={`flipbook-${zoom}-${windowSize.width}`}
          ref={bookRef}
          width={dimensions.width}
          height={dimensions.height}
          size="stretch"
          minWidth={dimensions.minWidth}
          maxWidth={dimensions.maxWidth}
          minHeight={dimensions.minHeight}
          maxHeight={dimensions.maxHeight}
          showCover={true}
          flippingTime={isMobile ? 600 : 800}
          usePortrait={isMobile || isTablet}
          startPage={0}
          drawShadow={!isMobile && !isTablet}
          maxShadowOpacity={0.5}
          showPageCorners={false}
          disableFlipByClick={false}
          style={isMobile || isTablet ? { width: '100%' } : {}}
          startZIndex={0}
          autoSize={true}
          mobileScrollSupport={true}
          useMouseEvents={!isMobile && !isTablet}
          swipeDistance={isMobile || isTablet ? 50 : 30}
          clickEventForward={true}
          renderOnlyPageLengthChange={false}
          onFlip={onFlip}
          className="magazine-book"
        >
          {pages.map((page, index) => (
            <div
              key={page.id}
              className="page bg-white"
              style={{ boxShadow: '0 0 2px 1px rgba(140, 140, 140, 0.25)' }}
              data-density={index === 0 ? "hard" : "soft"}
            >
              <div className="page-content relative w-full h-full">
                <Image
                  src={page.imagePath}
                  alt={`Page ${page.pageNumber}`}
                  fill
                  className="object-contain"
                  priority={page.pageNumber <= 2}
                />
                {/* Left side shadow for realistic magazine effect - Mobile & Tablet */}
                {(isMobile || isTablet) && (
                  <div
                    className="absolute top-0 left-0 bottom-0 pointer-events-none"
                    style={{
                      width: '40px',
                      background: 'linear-gradient(to right, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.08) 30%, rgba(0, 0, 0, 0.03) 60%, transparent)',
                      zIndex: 10
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </HTMLFlipBook>

        {/* Navigation Controls - Left & Right Buttons */}
        {/* Previous Page Button - Left Side */}
        {currentPage > 0 && (
          <button
            onClick={(e) => goToPrevPage(e)}
            className={`absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-300 rounded-full p-2 ${
              isMobile || isTablet
                ? 'left-2 text-white bg-black/20 hover:bg-black/30'
                : 'left-0 -translate-x-full mr-4 text-gray-600 hover:text-gray-800 bg-white/10 hover:bg-white/20'
            }`}
            style={isMobile || isTablet ? { filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' } : {}}
          >
            <ChevronLeft className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.5} />
          </button>
        )}

        {/* Next Page Button - Right Side */}
        {currentPage + 2 < totalPages && (
          <button
            onClick={(e) => goToNextPage(e)}
            className={`absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-300 rounded-full p-2 ${
              isMobile || isTablet
                ? 'right-2 text-white bg-black/20 hover:bg-black/30'
                : 'right-0 translate-x-full ml-4 text-gray-600 hover:text-gray-800 bg-white/10 hover:bg-white/20'
            }`}
            style={isMobile || isTablet ? { filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' } : {}}
          >
            <ChevronRight className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.5} />
          </button>
        )}

        {/* Center Spine Shadow Effect (Desktop only) - Realistic binding shadow */}
        {!isMobile && !isTablet && (
          <div
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-30 w-20 transition-opacity duration-1000"
            style={{ opacity: currentPage === 0 ? 0 : 1 }}
          >
            <svg
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Center spine shadow gradient */}
                <linearGradient id="spineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#000000', stopOpacity: 0 }} />
                  <stop offset="30%" style={{ stopColor: '#000000', stopOpacity: 0.08 }} />
                  <stop offset="50%" style={{ stopColor: '#000000', stopOpacity: 0.12 }} />
                  <stop offset="70%" style={{ stopColor: '#000000', stopOpacity: 0.08 }} />
                  <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="100" height="100" fill="url(#spineGradient)" />
            </svg>
          </div>
        )}

        {/* Decorative Edge Stripes (Desktop only) - Book-like visual edges with dynamic width */}
        {!isMobile && !isTablet && (
          <>
            {/* Left Decorative Stripe - width based on pages remaining */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none transition-all duration-1000"
              style={{
                left: '100%',
                width: `${Math.max(2, ((totalPages - currentPage - 1) / totalPages) * 12)}px`,
                opacity: currentPage === 0 ? 0 : 1
              }}
            >
              {/* Wavy page edge effect using SVG */}
              <svg
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 10 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="leftEdgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#f8f9fa', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: '#e9ecef', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                {/* Wavy edge path */}
                <path
                  d="M 0,0 Q 2,5 0,10 T 0,20 T 0,30 T 0,40 T 0,50 T 0,60 T 0,70 T 0,80 T 0,90 T 0,100 L 10,100 L 10,0 Z"
                  fill="url(#leftEdgeGradient)"
                />
                {/* Shadow overlay */}
                <rect x="0" y="0" width="10" height="100" fill="url(#leftEdgeGradient)" opacity="0.3" />
              </svg>
            </div>

            {/* Right Decorative Stripe - width based on pages read */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none transition-all duration-1000"
              style={{
                right: '100%',
                width: `${Math.max(2, (currentPage / totalPages) * 12)}px`,
                opacity: currentPage === 0 ? 0 : 1
              }}
            >
              {/* Wavy page edge effect using SVG */}
              <svg
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 10 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="rightEdgeGradient" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#f8f9fa', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: '#e9ecef', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                {/* Wavy edge path - mirrored for right side */}
                <path
                  d="M 10,0 Q 8,5 10,10 T 10,20 T 10,30 T 10,40 T 10,50 T 10,60 T 10,70 T 10,80 T 10,90 T 10,100 L 0,100 L 0,0 Z"
                  fill="url(#rightEdgeGradient)"
                />
                {/* Shadow overlay */}
                <rect x="0" y="0" width="10" height="100" fill="url(#rightEdgeGradient)" opacity="0.3" />
              </svg>
            </div>
          </>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm px-4 md:px-8 py-2 border-t border-gray-100 transition-transform duration-300 ${
        isFullscreen && !showControls ? 'translate-y-full' : 'translate-y-0'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          {isMobile ? (
            /* Mobile: Page Counter */
            <span className="text-gray-700 text-sm font-medium">
              {currentPage === 0
                ? `Page 1 of ${totalPages}`
                : currentPage >= totalPages - 1
                  ? `Page ${totalPages} of ${totalPages}`
                  : `Pages ${currentPage + 1} - ${Math.min(currentPage + 2, totalPages)} of ${totalPages}`
              }
            </span>
          ) : (
            /* Desktop/Tablet: Zoom and Fullscreen Controls */
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={zoomOut}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-9 w-9"
                disabled={zoom <= 0.6}
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <span className="text-gray-700 text-sm min-w-[50px] text-center font-medium">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={zoomIn}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-9 w-9"
                disabled={zoom >= 2}
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-9 w-9 ml-1"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

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
