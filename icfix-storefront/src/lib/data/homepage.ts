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
  const headers = {
    ...(await getAuthHeaders()),
  }

  const dynamicCacheOptions = await getCacheOptions("homepage")
  const dynamicTags = "tags" in dynamicCacheOptions ? dynamicCacheOptions.tags : []
  const cacheTags = [...dynamicTags, "homepage", "promotional-content"]

  const next = {
    tags: cacheTags,
  }

  try {
    const response = await sdk.client.fetch<HomepageContent>(
      "/store/homepage-content",
      {
        headers,
        next,
      }
    )

    return response || {
      hero_banners: [],
      homepage_sections: [],
      service_features: [],
      testimonials: [],
    }
  } catch (error) {
    console.warn("Could not fetch homepage content, returning empty:", error)
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
  const headers = {
    ...(await getAuthHeaders()),
  }

  const dynamicCacheOptions = await getCacheOptions("banners")
  const dynamicTags = "tags" in dynamicCacheOptions ? dynamicCacheOptions.tags : []
  const cacheTags = [...dynamicTags, "banners", `banners:${position}`]

  const next = {
    tags: cacheTags,
  }

  try {
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

    return response?.banners || []
  } catch (error) {
    console.warn(`Could not fetch banners for position ${position}, returning empty:`, error)
    return []
  }
}

/**
 * Fetch service features
 */
export const getServiceFeatures = async (): Promise<ServiceFeature[]> => {
  const headers = {
    ...(await getAuthHeaders()),
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

