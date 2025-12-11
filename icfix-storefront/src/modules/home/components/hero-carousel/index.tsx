"use client"

import { ArrowLeftMini, ArrowRightMini } from "@medusajs/icons"
import { clx, Heading, IconButton } from "@medusajs/ui"
import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
import Button from "@modules/common/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { PromotionalBanner } from "@lib/data/homepage"

type HeroCarouselProps = {
  banners: PromotionalBanner[]
}

const HeroCarousel = ({ banners }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const sortedBanners = [...banners].sort((a, b) => a.display_order - b.display_order)

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % sortedBanners.length)
  }, [sortedBanners.length])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + sortedBanners.length) % sortedBanners.length)
  }, [sortedBanners.length])

  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || sortedBanners.length <= 1) return

    const interval = setInterval(() => {
      handleNext()
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, handleNext, sortedBanners.length])

  // Pause on hover
  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  if (!sortedBanners || sortedBanners.length === 0) {
    return null
  }

  const currentBanner = sortedBanners[currentIndex]

  const getBannerLink = (banner: PromotionalBanner): string => {
    if (!banner.link_type || !banner.link_value) return "#"

    switch (banner.link_type) {
      case "product":
        return `/products/${banner.link_value}`
      case "collection":
        return `/collections/${banner.link_value}`
      case "category":
        return `/categories/${banner.link_value}`
      case "external":
        return banner.link_value
      default:
        return "#"
    }
  }

  return (
    <div
      className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] w-full border-b border-ui-border-base overflow-hidden bg-neutral-100"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Banner Image */}
      <div className="relative w-full h-full">
        {currentBanner.image_url && (
          <Image
            src={currentBanner.mobile_image_url || currentBanner.image_url}
            alt={currentBanner.title || "Hero banner"}
            fill
            className="object-cover object-center"
            quality={100}
            priority
            sizes="100vw"
            unoptimized={currentBanner.image_url?.includes('unsplash.com') || currentBanner.mobile_image_url?.includes('unsplash.com')}
            onError={(e) => {
              console.error("Failed to load banner image:", currentBanner.image_url)
            }}
          />
        )}
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 sm:px-8 md:px-16 lg:px-32 gap-4 sm:gap-6">
        {currentBanner.subtitle && (
          <p className="text-ui-fg-on-color text-xs sm:text-sm uppercase tracking-wider">
            {currentBanner.subtitle}
          </p>
        )}

        <Heading
          level="h1"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight sm:leading-8 md:leading-9 lg:leading-10 text-ui-fg-on-color font-normal mt-4 sm:mt-6 md:mt-8 lg:mt-10 mb-3 sm:mb-4 md:mb-5"
        >
          {currentBanner.title}
        </Heading>

        {currentBanner.description && (
          <p className="text-ui-fg-on-color text-sm sm:text-base md:text-lg max-w-2xl">
            {currentBanner.description}
          </p>
        )}

        {currentBanner.button_text && (
          <LocalizedClientLink href={getBannerLink(currentBanner)}>
            <Button variant="secondary" className="rounded-2xl text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4">
              {currentBanner.button_text}
            </Button>
          </LocalizedClientLink>
        )}
      </div>

      {/* Navigation Arrows */}
      {sortedBanners.length > 1 && (
        <>
          <IconButton
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/80 hover:bg-white text-neutral-900"
            aria-label="Previous slide"
          >
            <ArrowLeftMini />
          </IconButton>
          <IconButton
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/80 hover:bg-white text-neutral-900"
            aria-label="Next slide"
          >
            <ArrowRightMini />
          </IconButton>
        </>
      )}

      {/* Dots Indicator */}
      {sortedBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {sortedBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={clx(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default HeroCarousel

