"use client"

import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import Image from "next/image"
import { useCallback, useMemo, useState } from "react"

type ImageGalleryProps = {
  product: HttpTypes.StoreProduct
}

const ImageGallery = ({ product }: ImageGalleryProps) => {
  const thumbnail = product?.thumbnail
  const images = useMemo(() => product?.images || [], [product])

  const [selectedImage, setSelectedImage] = useState(
    images[0] || {
      url: thumbnail,
      id: "thumbnail",
    }
  )
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const handleImageClick = useCallback(
    (image: HttpTypes.StoreProductImage, index: number) => {
      setSelectedImage(image)
      setSelectedImageIndex(index)
    },
    []
  )

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Image */}
      <div className="relative w-full aspect-square bg-neutral-50 rounded-lg overflow-hidden group">
        {!!selectedImage.url && (
          <>
            <Image
              src={selectedImage.url}
              priority
              alt={(selectedImage.metadata?.alt as string) || product.title || "Product image"}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Fullscreen icon (top right) */}
            <button
              className="absolute top-4 right-4 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="View fullscreen"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 justify-start">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => handleImageClick(image, index)}
              className={clx(
                "relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                index === selectedImageIndex
                  ? "border-blue-600 ring-2 ring-blue-200"
                  : "border-transparent hover:border-gray-300"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={(image.metadata?.alt as string) || `Product thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
