// Type definitions for promotional content admin API requests

export interface CreateBannerRequest {
  id?: string
  title: string
  subtitle?: string | null
  description?: string | null
  image_url: string
  mobile_image_url?: string | null
  link_type?: "product" | "collection" | "category" | "external" | null
  link_value?: string | null
  button_text?: string | null
  display_order?: number
  is_active?: boolean
  position?: "hero" | "homepage" | "category" | "product" | "sidebar"
  start_date?: string | null
  end_date?: string | null
  metadata?: Record<string, unknown> | null
}

export interface UpdateBannerRequest extends Partial<CreateBannerRequest> {
  id?: string
}

export interface CreateServiceFeatureRequest {
  id?: string
  title: string
  description?: string | null
  icon_url?: string | null
  display_order?: number
  is_active?: boolean
  metadata?: Record<string, unknown> | null
}

export interface UpdateServiceFeatureRequest extends Partial<CreateServiceFeatureRequest> {
  id?: string
}

export interface CreateTestimonialRequest {
  id?: string
  customer_name: string
  customer_title?: string | null
  customer_avatar_url?: string | null
  rating: number
  comment: string
  display_order?: number
  is_active?: boolean
  metadata?: Record<string, unknown> | null
}

export interface UpdateTestimonialRequest extends Partial<CreateTestimonialRequest> {
  id?: string
}

export interface CreateHomepageSectionRequest {
  id?: string
  section_type: "featured_products" | "new_arrivals" | "best_sellers" | "categories" | "testimonials" | "promotional"
  title: string
  subtitle?: string | null
  display_order?: number
  is_active?: boolean
  collection_id?: string | null
  category_id?: string | null
  product_limit?: number | null
  promotional_banner_id?: string | null
  show_category_images?: boolean
  metadata?: Record<string, unknown> | null
}

export interface UpdateHomepageSectionRequest extends Partial<CreateHomepageSectionRequest> {
  id?: string
}

