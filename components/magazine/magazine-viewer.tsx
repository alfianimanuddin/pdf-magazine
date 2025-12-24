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
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 })
  const previousZoomRef = useRef(1)

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
    console.log('goToNextPage called, currentPage:', currentPage)
    e?.stopPropagation()
    if (bookRef.current) {
      // In portrait mode (mobile/tablet), advance by 1 page. In landscape (desktop), advance by 2 pages
      const increment = (isMobile || isTablet) ? 1 : 2
      console.log('bookRef.current exists, flipping to page:', currentPage + increment)
      try {
        const pageFlip = bookRef.current.pageFlip()
        // Try using flip() with specific page number instead of flipNext()
        pageFlip.flip(currentPage + increment)
        console.log('flip() completed')
      } catch (error) {
        console.error('Error calling flip():', error)
      }
    } else {
      console.error('bookRef.current is null')
    }
  }, [currentPage, isMobile, isTablet])

  const goToPrevPage = useCallback((e?: React.MouseEvent) => {
    console.log('goToPrevPage called, currentPage:', currentPage)
    e?.stopPropagation()
    if (bookRef.current) {
      // In portrait mode (mobile/tablet), go back by 1 page. In landscape (desktop), go back by 2 pages
      const decrement = (isMobile || isTablet) ? 1 : 2
      const targetPage = Math.max(0, currentPage - decrement)
      console.log('bookRef.current exists, flipping to page:', targetPage)
      try {
        const pageFlip = bookRef.current.pageFlip()
        // Try using flip() with specific page number instead of flipPrev()
        pageFlip.flip(targetPage)
        console.log('flip() completed to page:', targetPage)
      } catch (error) {
        console.error('Error calling flip():', error)
      }
    } else {
      console.error('bookRef.current is null')
    }
  }, [currentPage, isMobile, isTablet])

  const toggleFullscreen = useCallback(() => {
    const elem = containerRef.current
    if (!elem) return

    // Check if currently in fullscreen (handle both standard and webkit)
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement
    )

    if (!isCurrentlyFullscreen) {
      // Enter fullscreen - try standard first, then webkit for Safari
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen()
      }
    } else {
      // Exit fullscreen - try standard first, then webkit for Safari
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen()
      }
    }
  }, [])

  const zoomIn = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    setZoom((prev) => {
      // On mobile and desktop, first zoom goes to 160% directly
      if (prev === 1) {
        return 1.6
      }
      return Math.min(prev + 0.2, 5)
    })
  }, [])

  const zoomOut = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    setZoom((prev) => {
      // If zoomed in beyond 100%, go directly back to 100%
      if (prev > 1) {
        return 1
      }
      // Minimum zoom is 100%
      return Math.max(prev - 0.2, 1)
    })
  }, [])

  const handleZoomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    setZoom(Number(e.target.value))
  }, [])

  const onFlip = useCallback((e: any) => {
    setCurrentPage(e.data)
  }, [])

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Yuk baca ${title}. Selengkapnya di Majalah Digital Tadatodays.`,
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

  // Handle mouse movement for both drag-to-scroll and fullscreen controls
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Handle drag-to-scroll when zoomed
    if (isDragging && zoom > 1) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y

      if (containerRef.current) {
        containerRef.current.scrollLeft = scrollStart.x - dx
        containerRef.current.scrollTop = scrollStart.y - dy
      }
    }

    // Handle fullscreen controls visibility
    if (isFullscreen) {
      setShowControls(true)

      // Clear existing timeout
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current)
      }

      // Set new timeout to hide controls after 3 seconds of inactivity
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }, [isFullscreen, isDragging, zoom, dragStart, scrollStart])

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

  // Listen for fullscreen changes (handles both standard and Safari webkit events)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
    }

    // Add listeners for both standard and webkit events
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
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

  // Prefetch adjacent pages for instant flipping
  useEffect(() => {
    // Prefetch 3 pages ahead for smooth forward navigation
    const pagesToPrefetch = [
      currentPage + 1,
      currentPage + 2,
      currentPage + 3,
    ].filter(idx => idx >= 0 && idx < pages.length)

    pagesToPrefetch.forEach(pageIdx => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.as = 'image'
      link.href = pages[pageIdx].imagePath
      document.head.appendChild(link)
    })

    // Cleanup: remove prefetch links when currentPage changes
    return () => {
      const links = document.querySelectorAll('link[rel="prefetch"]')
      links.forEach(link => link.remove())
    }
  }, [currentPage, pages])

  // Maintain scroll position relative to zoom center when zooming
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const previousZoom = previousZoomRef.current

    if (zoom === 1) {
      // Reset scroll to center when returning to 100%
      container.scrollLeft = 0
      container.scrollTop = 0
      previousZoomRef.current = zoom
    } else if (previousZoom !== zoom && previousZoom !== 1) {
      // Calculate viewport center before zoom (in content coordinates)
      const centerX = (container.scrollLeft + container.clientWidth / 2) / previousZoom
      const centerY = (container.scrollTop + container.clientHeight / 2) / previousZoom

      // Wait for layout to settle after dimension changes
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.scrollLeft = centerX * zoom - containerRef.current.clientWidth / 2
            containerRef.current.scrollTop = centerY * zoom - containerRef.current.clientHeight / 2
          }
        })
      })

      previousZoomRef.current = zoom
    } else if (previousZoom === 1 && zoom > 1) {
      // When zooming in from 100%, center on the magazine
      // Wait for layout to settle after dimension changes
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            const container = containerRef.current

            // Center the magazine in the viewport
            const scrollableWidth = container.scrollWidth - container.clientWidth
            const scrollableHeight = container.scrollHeight - container.clientHeight

            container.scrollLeft = scrollableWidth / 2
            container.scrollTop = scrollableHeight / 2
          }
        })
      })

      previousZoomRef.current = zoom
    }
  }, [zoom])

  // Prevent right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    return false
  }, [])

  // Drag to scroll functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return

    // Don't initiate drag if clicking a button or interactive element
    const target = e.target as HTMLElement
    const tagName = target.tagName?.toUpperCase()
    if (target.closest('button') || target.closest('input') || target.closest('a') ||
        tagName === 'BUTTON' || tagName === 'SVG' || tagName === 'PATH') {
      return
    }

    e.preventDefault() // Prevent default drag behavior
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setScrollStart({
      x: containerRef.current?.scrollLeft || 0,
      y: containerRef.current?.scrollTop || 0
    })
  }, [zoom])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch event handlers for mobile drag-to-scroll
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (zoom <= 1) return

    // Don't initiate drag if touching a button or interactive element
    const target = e.target as HTMLElement
    const tagName = target.tagName?.toUpperCase()
    console.log('handleTouchStart - target:', target, 'tagName:', tagName, 'closest button:', target.closest('button'))

    if (target.closest('button') || target.closest('input') || target.closest('a') ||
        tagName === 'BUTTON' || tagName === 'SVG' || tagName === 'PATH') {
      console.log('handleTouchStart - skipping drag (button detected)')
      return
    }

    console.log('handleTouchStart - initiating drag')
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX, y: touch.clientY })
    setScrollStart({
      x: containerRef.current?.scrollLeft || 0,
      y: containerRef.current?.scrollTop || 0
    })
  }, [zoom])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && zoom > 1) {
      const touch = e.touches[0]
      const dx = touch.clientX - dragStart.x
      const dy = touch.clientY - dragStart.y

      if (containerRef.current) {
        containerRef.current.scrollLeft = scrollStart.x - dx
        containerRef.current.scrollTop = scrollStart.y - dy
      }
    }
  }, [isDragging, zoom, dragStart, scrollStart])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 select-none ${
        zoom > 1 ? 'overflow-auto' : 'overflow-hidden flex flex-col items-center justify-center'
      }`}
      style={{
        height: '100vh',
        cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleContainerClick}
      onContextMenu={handleContextMenu}
    >
      {/* Header - Top Bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm px-4 md:px-4 py-2 border-b border-gray-100 transition-transform duration-300 ${
          isFullscreen && !showControls ? '-translate-y-full' : 'translate-y-0'
        }`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
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
                          : isTablet
                            ? `Page ${currentPage + 1} of ${totalPages}`
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
                        : isTablet
                          ? `Page ${currentPage + 1} of ${totalPages}`
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
        className={`z-10 magazine-container ${
          zoom > 1
            ? 'inline-block'
            : isMobile || isTablet
              ? 'relative w-full'
              : 'relative transition-all duration-300'
        }`}
        style={{
          transform: currentPage === 0 && !isMobile && !isTablet && zoom <= 1
            ? `translateX(-250px)`
            : 'translateX(0)',
          ...(zoom <= 1 && {
            display: 'flex',
            justifyContent: 'center',
          })
        }}
      >
        <HTMLFlipBook
          key={`flipbook-${windowSize.width}-${zoom}`}
          ref={bookRef}
          width={dimensions.width}
          height={dimensions.height}
          size="stretch"
          minWidth={dimensions.minWidth}
          maxWidth={dimensions.maxWidth}
          minHeight={dimensions.minHeight}
          maxHeight={dimensions.maxHeight}
          showCover={true}
          flippingTime={isMobile ? 500 : 800}
          usePortrait={isMobile || isTablet}
          startPage={currentPage}
          drawShadow={!isMobile && !isTablet}
          maxShadowOpacity={0.5}
          showPageCorners={false}
          disableFlipByClick={false}
          style={zoom <= 1 && (isMobile || isTablet) ? { width: '100%' } : {}}
          startZIndex={0}
          autoSize={true}
          mobileScrollSupport={false}
          useMouseEvents={!isMobile && !isTablet && zoom <= 1}
          swipeDistance={zoom > 1 ? 1000 : (isMobile || isTablet ? 30 : 30)}
          clickEventForward={true}
          renderOnlyPageLengthChange={false}
          onFlip={onFlip}
          className="magazine-book"
        >
          {pages.map((page, index) => {
            // Preload current page and adjacent pages (2 before, 4 ahead for smooth flipping)
            const shouldPreload = index <= 2 || // Always preload first 2 pages
              (index >= currentPage - 2 && index <= currentPage + 4)

            return (
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
                    priority={shouldPreload}
                    loading={shouldPreload ? 'eager' : 'lazy'}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  {/* Left side shadow for realistic magazine effect - Mobile & Tablet */}
                  {(isMobile || isTablet) && zoom <= 1 && (
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
            )
          })}
        </HTMLFlipBook>

        {/* Center Spine Shadow Effect (Desktop only) - Realistic binding shadow */}
        {!isMobile && !isTablet && zoom <= 1 && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-30 w-20 transition-opacity duration-1000"
            style={{
              opacity: currentPage === 0 ? 0 : 1,
              height: '100%'
            }}
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
        {!isMobile && !isTablet && zoom <= 1 && (
          <>
            {/* Left Decorative Stripe - width based on pages remaining */}
            <div
              className="absolute top-0 pointer-events-none transition-all duration-1000"
              style={{
                left: '100%',
                width: `${Math.max(2, ((totalPages - currentPage - 1) / totalPages) * 12)}px`,
                height: '100%',
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
              className="absolute top-0 pointer-events-none transition-all duration-1000"
              style={{
                right: '100%',
                width: `${Math.max(2, (currentPage / totalPages) * 12)}px`,
                height: '100%',
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

      {/* Navigation Controls - Left & Right Buttons - Outside magazine container */}
      {/* Previous Page Button - Left Side */}
      {currentPage > 0 && (
        <button
          onClick={(e) => {
            console.log('Previous button onClick triggered')
            e.stopPropagation()
            goToPrevPage(e)
          }}
          className={`fixed top-1/2 -translate-y-1/2 z-30 transition-all duration-300 rounded-full p-2 ${
            isMobile || isTablet
              ? 'text-white bg-black/20 hover:bg-black/30 active:bg-black/40'
              : 'text-gray-600 hover:text-gray-800 bg-white/10 hover:bg-white/20'
          }`}
          style={isMobile || isTablet ? { filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))', left: '1rem', touchAction: 'manipulation', pointerEvents: 'auto' } : { left: '2rem', pointerEvents: 'auto' }}
        >
          <ChevronLeft className="h-8 w-8 md:h-12 md:w-12" strokeWidth={1.5} style={{ pointerEvents: 'none' }} />
        </button>
      )}

      {/* Next Page Button - Right Side */}
      {((isMobile || isTablet) ? currentPage + 1 < totalPages : currentPage + 2 < totalPages) && (
        <button
          onClick={(e) => {
            console.log('Next button onClick triggered')
            e.stopPropagation()
            goToNextPage(e)
          }}
          className={`fixed top-1/2 -translate-y-1/2 z-30 transition-all duration-300 rounded-full p-2 ${
            isMobile || isTablet
              ? 'text-white bg-black/20 hover:bg-black/30 active:bg-black/40'
              : 'text-gray-600 hover:text-gray-800 bg-white/10 hover:bg-white/20'
          }`}
          style={isMobile || isTablet ? { filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))', right: '1rem', touchAction: 'manipulation', pointerEvents: 'auto' } : { right: '2rem', pointerEvents: 'auto' }}
        >
          <ChevronRight className="h-8 w-8 md:h-12 md:w-12" strokeWidth={1.5} style={{ pointerEvents: 'none' }} />
        </button>
      )}

      {/* Bottom Control Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm px-4 md:px-8 py-2 border-t border-gray-100 transition-transform duration-300 ${
          isFullscreen && !showControls ? 'translate-y-full' : 'translate-y-0'
        }`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          {isMobile ? (
            /* Mobile: Zoom Controls and Page Counter */
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={zoomOut}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-9 w-9"
                  disabled={zoom <= 1}
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={zoom}
                  onChange={handleZoomChange}
                  className="w-20 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-700"
                />
                <span className="text-gray-700 text-sm min-w-[45px] text-center font-medium">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={zoomIn}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-9 w-9"
                  disabled={zoom >= 5}
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
              </div>
              <span className="text-gray-700 text-sm font-medium">
                {`Page ${currentPage + 1} of ${totalPages}`}
              </span>
            </div>
          ) : (
            /* Desktop/Tablet: Zoom and Fullscreen Controls */
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={zoomOut}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-9 w-9"
                  disabled={zoom <= 1}
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={zoom}
                  onChange={handleZoomChange}
                  className="w-32 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-700"
                />
                <span className="text-gray-700 text-sm min-w-[50px] text-center font-medium">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={zoomIn}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-9 w-9"
                  disabled={zoom >= 5}
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
              </div>
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
