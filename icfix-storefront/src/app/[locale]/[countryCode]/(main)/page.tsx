import { listRegions } from "@lib/data/regions"
import { getHomepageContent, getHeroBanners } from "@lib/data/homepage"
import FeaturedProducts from "@modules/home/components/featured-products"
import HeroCarousel from "@modules/home/components/hero-carousel"
import ServiceFeatures from "@modules/home/components/service-features"
import Testimonials from "@modules/home/components/testimonials"
import HomepageSections from "@modules/home/components/homepage-sections"
import SkeletonFeaturedProducts from "@modules/skeletons/templates/skeleton-featured-products"
import { Metadata } from "next"
import { Suspense } from "react"

// dynamicParams defaults to true in Docker mode (runtime SSR)
// Set to false only for static export builds

export const metadata: Metadata = {
  title: "Medusa Next.js Starter Template",
  description:
    "A performant frontend ecommerce starter template with Next.js 14 and Medusa.",
}

export async function generateStaticParams() {
  try {
    const { locales } = await import("@/i18n/config");
  const countryCodes = await listRegions().then(
    (regions) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )
    // Return combinations of locale and countryCode
    return locales.flatMap((locale) =>
      countryCodes.map((countryCode) => ({ locale, countryCode }))
    )
  } catch (error) {
    console.warn("generateStaticParams for home page failed, returning default:", error)
    // Return default combinations if regions fetch fails
    return [
      { locale: "en", countryCode: "vn" },
      { locale: "vi", countryCode: "vn" },
    ]
  }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  // Fetch all homepage content from database
  const homepageContent = await getHomepageContent()
  const heroBanners = await getHeroBanners("hero")

  // Extract data
  const { service_features, testimonials, homepage_sections } = homepageContent

  // Debug logging (only in development or if explicitly enabled)
  if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEBUG_HOMEPAGE === "true") {
    console.log("[Homepage] Data summary:", {
      heroBanners: heroBanners.length,
      service_features: service_features.length,
      testimonials: testimonials.length,
      homepage_sections: homepage_sections.length,
    })
  }

  return (
    <div className="flex flex-col gap-y-0">
      {/* Hero Carousel - Dynamic banners from database */}
      {heroBanners.length > 0 ? (
        <HeroCarousel banners={heroBanners} />
      ) : null}

      {/* Service Features - Free Shipping, Returns, etc. */}
      {service_features.length > 0 && (
        <ServiceFeatures features={service_features} />
      )}

      {/* Homepage Sections - Dynamic sections from database */}
      {homepage_sections.length > 0 && (
        <Suspense fallback={<SkeletonFeaturedProducts />}>
          <HomepageSections sections={homepage_sections} countryCode={countryCode} />
        </Suspense>
      )}

      {/* Featured Products - Fallback to collections if no sections */}
      {homepage_sections.length === 0 && (
        <Suspense fallback={<SkeletonFeaturedProducts />}>
          <FeaturedProducts countryCode={countryCode} />
        </Suspense>
      )}

      {/* Testimonials - Only render if NOT already included in homepage sections */}
      {testimonials.length > 0 && 
       !homepage_sections.some(s => s.section_type === "testimonials" && s.is_active) && 
       <Testimonials testimonials={testimonials} />}
    </div>
  )
}
