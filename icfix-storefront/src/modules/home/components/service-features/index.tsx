"use client"

import { ServiceFeature } from "@lib/data/homepage"
import Image from "next/image"
import { useState } from "react"
import { Photo } from "@medusajs/icons"

type ServiceFeaturesProps = {
  features: ServiceFeature[]
}

const ServiceFeatures = ({ features }: ServiceFeaturesProps) => {
  const sortedFeatures = [...features]
    .filter((f) => f.is_active)
    .sort((a, b) => a.display_order - b.display_order)

  if (!sortedFeatures || sortedFeatures.length === 0) {
    return null
  }

  return (
    <div className="content-container py-8 sm:py-12 md:py-16 bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {sortedFeatures.map((feature) => {
          const [imageError, setImageError] = useState(false)
          
          return (
            <div
              key={feature.id}
              className="flex flex-col items-center text-center gap-3 sm:gap-4"
            >
              {feature.icon_url && !imageError ? (
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-2">
                  <Image
                    src={feature.icon_url}
                    alt={feature.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 48px, 64px"
                    unoptimized={feature.icon_url?.includes('flaticon.com')}
                    onError={() => {
                      console.error("Failed to load service feature icon:", feature.icon_url)
                      setImageError(true)
                    }}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 mb-2 flex items-center justify-center bg-neutral-100 rounded-full">
                  <Photo className="text-neutral-400 w-6 h-6 sm:w-8 sm:h-8" />
                </div>
              )}
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900">
                {feature.title}
              </h3>
              {feature.description && (
                <p className="text-sm sm:text-base text-neutral-600 max-w-xs">
                  {feature.description}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ServiceFeatures

