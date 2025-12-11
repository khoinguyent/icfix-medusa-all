"use client"

import { ArrowLeftMini, ArrowRightMini } from "@medusajs/icons"
import { clx, IconButton } from "@medusajs/ui"
import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
import { Testimonial } from "@lib/data/homepage"

type TestimonialsProps = {
  testimonials: Testimonial[]
}

const Testimonials = ({ testimonials }: TestimonialsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const sortedTestimonials = [...testimonials]
    .filter((t) => t.is_active)
    .sort((a, b) => a.display_order - b.display_order)

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % sortedTestimonials.length)
  }, [sortedTestimonials.length])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + sortedTestimonials.length) % sortedTestimonials.length)
  }, [sortedTestimonials.length])

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || sortedTestimonials.length <= 1) return

    const interval = setInterval(() => {
      handleNext()
    }, 6000) // Change testimonial every 6 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, handleNext, sortedTestimonials.length])

  // Pause on hover
  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  if (!sortedTestimonials || sortedTestimonials.length === 0) {
    return null
  }

  const currentTestimonial = sortedTestimonials[currentIndex]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={clx(
          "text-lg",
          i < rating ? "text-yellow-400" : "text-neutral-300"
        )}
      >
        ★
      </span>
    ))
  }

  return (
    <div
      className="content-container py-12 sm:py-16 md:py-20 bg-neutral-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base">
            Real reviews from real customers
          </p>
        </div>

        <div className="relative bg-white rounded-lg p-6 sm:p-8 md:p-12 shadow-sm">
          {/* Testimonial Content */}
          <div className="text-center">
            {/* Rating Stars */}
            <div className="flex justify-center gap-1 mb-4">
              {renderStars(currentTestimonial.rating)}
            </div>

            {/* Comment */}
            <p className="text-base sm:text-lg md:text-xl text-neutral-700 mb-6 sm:mb-8 italic">
              "{currentTestimonial.comment}"
            </p>

            {/* Customer Info */}
            <div className="flex flex-col items-center gap-3">
              {currentTestimonial.customer_avatar_url && (
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={currentTestimonial.customer_avatar_url}
                    alt={currentTestimonial.customer_name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}
              <div>
                <p className="font-semibold text-neutral-900">
                  {currentTestimonial.customer_name}
                </p>
                {currentTestimonial.customer_title && (
                  <p className="text-sm text-neutral-600">
                    {currentTestimonial.customer_title}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {sortedTestimonials.length > 1 && (
            <>
              <IconButton
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900"
                aria-label="Previous testimonial"
              >
                <ArrowLeftMini />
              </IconButton>
              <IconButton
                onClick={handleNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900"
                aria-label="Next testimonial"
              >
                <ArrowRightMini />
              </IconButton>
            </>
          )}

          {/* Dots Indicator */}
          {sortedTestimonials.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {sortedTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={clx(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentIndex
                      ? "bg-neutral-900 w-8"
                      : "bg-neutral-300 hover:bg-neutral-400"
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Testimonials

