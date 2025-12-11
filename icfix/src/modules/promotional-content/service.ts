import { MedusaService } from "@medusajs/framework/utils"
import PromotionalBanner from "./models/banner"
import HomepageSection from "./models/homepage-section"
import ServiceFeature from "./models/service-feature"
import Testimonial from "./models/testimonial"

class PromotionalContentService extends MedusaService({
  PromotionalBanner,
  HomepageSection,
  ServiceFeature,
  Testimonial,
}) {
  // Banner methods
  async listBanners(filters?: { position?: string; is_active?: boolean }) {
    try {
      const query: any = {}
      
      if (filters?.position) {
        query.position = filters.position
      }
      
      // Only filter by is_active if explicitly provided
      // This allows admin to see all banners when is_active is undefined
      if (filters?.is_active !== undefined) {
        query.is_active = filters.is_active
      }
      
      const banners = await this.listPromotionalBanners(query, {
        order: { display_order: "ASC" },
      })
      
      return banners || []
    } catch (error) {
      console.error("Error listing banners:", error)
      return []
    }
  }

  async getActiveBannersByPosition(position: string) {
    try {
      const banners = await this.listPromotionalBanners(
        {
          position,
          is_active: true,
        },
        {
          order: { display_order: "ASC" },
        }
      )
      
      return banners || []
    } catch (error) {
      console.error(`Error fetching banners for position ${position}:`, error)
      return []
    }
  }

  // HomepageSection methods
  async listActiveHomepageSections() {
    try {
      const sections = await this.listHomepageSections(
        {
          is_active: true,
        },
        {
          order: { display_order: "ASC" },
        }
      )
      
      return sections || []
    } catch (error) {
      console.error("Error listing homepage sections:", error)
      return []
    }
  }

  async getHomepageSectionByType(sectionType: string) {
    try {
      const sections = await this.listHomepageSections(
        {
          section_type: sectionType,
          is_active: true,
        },
        {
          order: { display_order: "ASC" },
        }
      )
      
      return sections || []
    } catch (error) {
      console.error(`Error fetching homepage sections by type ${sectionType}:`, error)
      return []
    }
  }

  // ServiceFeature methods
  async listActiveServiceFeatures() {
    try {
      const features = await this.listServiceFeatures(
        {
          is_active: true,
        },
        {
          order: { display_order: "ASC" },
        }
      )
      
      return features || []
    } catch (error) {
      console.error("Error listing service features:", error)
      return []
    }
  }

  // Testimonial methods
  async listActiveTestimonials() {
    try {
      const testimonials = await this.listTestimonials(
        {
          is_active: true,
        },
        {
          order: { display_order: "ASC" },
        }
      )
      
      return testimonials || []
    } catch (error) {
      console.error("Error listing testimonials:", error)
      return []
    }
  }
}

export default PromotionalContentService
