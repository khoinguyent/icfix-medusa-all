"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"

export interface PromotionalBanner {
  id: string
  title: string
  subtitle?: string | null
  description?: string | null
  image_url: string
  mobile_image_url?: string | null
  link_type?: "product" | "collection" | "category" | "external" | null
  link_value?: string | null
  button_text?: string | null
  display_order: number
  is_active: boolean
  position: string
}

export interface HomepageSection {
  id: string
  section_type: string
  title: string
  subtitle?: string | null
  display_order: number
  is_active: boolean
  collection_id?: string | null
  category_id?: string | null
  product_limit?: number | null
  promotional_banner_id?: string | null
  show_category_images?: boolean | null
}

export interface ServiceFeature {
  id: string
  title: string
  description?: string | null
  icon_url?: string | null
  display_order: number
  is_active: boolean
}

export interface Testimonial {
  id: string
  customer_name: string
  customer_title?: string | null
  customer_avatar_url?: string | null
  rating: number
  comment: string
  display_order: number
  is_active: boolean
}

export interface HomepageContent {
  hero_banners: PromotionalBanner[]
  homepage_sections: HomepageSection[]
  service_features: ServiceFeature[]
  testimonials: Testimonial[]
}

/**
 * Fetch all homepage content in one request
 */
export const getHomepageContent = async (): Promise<HomepageContent> => {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    } as Record<string, string>

    // Add publishable API key header (required for store endpoints)
    if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers["x-publishable-api-key"] =
        process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }

    const dynamicCacheOptions = await getCacheOptions("homepage")
    const dynamicTags = "tags" in dynamicCacheOptions ? dynamicCacheOptions.tags : []
    const cacheTags = [...dynamicTags, "homepage", "promotional-content"]

    const next = {
      tags: cacheTags,
    }

    try {
      // Log for debugging (only in development or if explicitly enabled)
      if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEBUG_HOMEPAGE === "true") {
        console.log("[Homepage] Fetching homepage content from:", sdk.baseUrl)
        console.log("[Homepage] Publishable key present:", !!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY)
      }

      const response = await sdk.client.fetch<HomepageContent>(
        "/store/homepage-content",
        {
          headers,
          next,
        }
      )

      if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEBUG_HOMEPAGE === "true") {
        console.log("[Homepage] Response received:", {
          hero_banners: response?.hero_banners?.length || 0,
          service_features: response?.service_features?.length || 0,
          testimonials: response?.testimonials?.length || 0,
          homepage_sections: response?.homepage_sections?.length || 0,
        })
      }

      return response || {
        hero_banners: [],
        homepage_sections: [],
        service_features: [],
        testimonials: [],
      }
    } catch (error) {
      console.error("Could not fetch homepage content:", error)
      if (error instanceof Error) {
        console.error("Error message:", error.message)
        console.error("Error stack:", error.stack)
      }
      return {
        hero_banners: [],
        homepage_sections: [],
        service_features: [],
        testimonials: [],
      }
    }
  } catch (error) {
    // Handle errors in getAuthHeaders or getCacheOptions
    console.error("Error in getHomepageContent setup:", error)
    return {
      hero_banners: [],
      homepage_sections: [],
      service_features: [],
      testimonials: [],
    }
  }
}

/**
 * Fetch hero banners by position
 */
export const getHeroBanners = async (
  position: string = "hero"
): Promise<PromotionalBanner[]> => {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    } as Record<string, string>

    // Add publishable API key header (required for store endpoints)
    if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers["x-publishable-api-key"] =
        process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }

    const dynamicCacheOptions = await getCacheOptions("banners")
    const dynamicTags = "tags" in dynamicCacheOptions ? dynamicCacheOptions.tags : []
    const cacheTags = [...dynamicTags, "banners", `banners:${position}`]

    const next = {
      tags: cacheTags,
    }

    try {
      if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEBUG_HOMEPAGE === "true") {
        console.log(`[Banners] Fetching banners for position: ${position}`)
      }

      const response = await sdk.client.fetch<{ banners: PromotionalBanner[] }>(
        "/store/banners",
        {
          query: {
            position,
            is_active: "true",
          },
          headers,
          next,
        }
      )

      if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEBUG_HOMEPAGE === "true") {
        console.log(`[Banners] Received ${response?.banners?.length || 0} banners for position ${position}`)
      }

      return response?.banners || []
    } catch (error) {
      console.error(`Could not fetch banners for position ${position}:`, error)
      if (error instanceof Error) {
        console.error("Error details:", error.message)
      }
      return []
    }
  } catch (error) {
    // Handle errors in getAuthHeaders or getCacheOptions
    console.error(`Error in getHeroBanners setup for position ${position}:`, error)
    return []
  }
}

/**
 * Fetch service features
 */
export const getServiceFeatures = async (): Promise<ServiceFeature[]> => {
  const headers = {
    ...(await getAuthHeaders()),
  } as Record<string, string>

  // Add publishable API key header (required for store endpoints)
  if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
    headers["x-publishable-api-key"] =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  }

  const dynamicCacheOptions = await getCacheOptions("service-features")
  const dynamicTags = "tags" in dynamicCacheOptions ? dynamicCacheOptions.tags : []
  const cacheTags = [...dynamicTags, "service-features"]

  const next = {
    tags: cacheTags,
  }

  try {
    const response = await sdk.client.fetch<{ features: ServiceFeature[] }>(
      "/store/service-features",
      {
        headers,
        next,
      }
    )

    return response?.features || []
  } catch (error) {
    console.warn("Could not fetch service features, returning empty:", error)
    return []
  }
}

/**
 * Fetch testimonials
 */
export const getTestimonials = async (): Promise<Testimonial[]> => {
  const headers = {
    ...(await getAuthHeaders()),
  } as Record<string, string>

  // Add publishable API key header (required for store endpoints)
  if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
    headers["x-publishable-api-key"] =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  }

  const dynamicCacheOptions = await getCacheOptions("testimonials")
  const dynamicTags = "tags" in dynamicCacheOptions ? dynamicCacheOptions.tags : []
  const cacheTags = [...dynamicTags, "testimonials"]

  const next = {
    tags: cacheTags,
  }

  try {
    const response = await sdk.client.fetch<{ testimonials: Testimonial[] }>(
      "/store/testimonials",
      {
        headers,
        next,
      }
    )

    return response?.testimonials || []
  } catch (error) {
    console.warn("Could not fetch testimonials, returning empty:", error)
    return []
  }
}

/**
 * Fetch homepage sections
 */
export const getHomepageSections = async (): Promise<HomepageSection[]> => {
  const headers = {
    ...(await getAuthHeaders()),
  } as Record<string, string>

  // Add publishable API key header (required for store endpoints)
  if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
    headers["x-publishable-api-key"] =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  }

  const dynamicCacheOptions = await getCacheOptions("homepage-sections")
  const dynamicTags = "tags" in dynamicCacheOptions ? dynamicCacheOptions.tags : []
  const cacheTags = [...dynamicTags, "homepage-sections"]

  const next = {
    tags: cacheTags,
  }

  try {
    const response = await sdk.client.fetch<{ sections: HomepageSection[] }>(
      "/store/homepage-sections",
      {
        headers,
        next,
      }
    )

    return response?.sections || []
  } catch (error) {
    console.warn("Could not fetch homepage sections, returning empty:", error)
    return []
  }
}

