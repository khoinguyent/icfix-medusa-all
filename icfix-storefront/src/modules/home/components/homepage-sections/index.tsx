import { HomepageSection } from "@lib/data/homepage"
import { retrieveCollection } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import ProductRail from "@modules/home/components/featured-products/product-rail"
import CategoryGrid from "@modules/home/components/category-grid"
import Testimonials from "@modules/home/components/testimonials"
import { getTestimonials } from "@lib/data/homepage"
import { Suspense } from "react"
import SkeletonFeaturedProducts from "@modules/skeletons/templates/skeleton-featured-products"

type HomepageSectionsProps = {
  sections: HomepageSection[]
  countryCode: string
}

const HomepageSections = async ({ sections, countryCode }: HomepageSectionsProps) => {
  const sortedSections = [...sections]
    .filter((s) => s.is_active)
    .sort((a, b) => a.display_order - b.display_order)

  if (!sortedSections || sortedSections.length === 0) {
    return null
  }

  const region = await getRegion(countryCode)

  return (
    <>
      {sortedSections.map((section) => {
        // Featured Products, New Arrivals, and Best Sellers Sections
        if (
          (section.section_type === "featured_products" ||
            section.section_type === "new_arrivals" ||
            section.section_type === "best_sellers") &&
          section.collection_id
        ) {
          return (
            <Suspense key={section.id} fallback={<SkeletonFeaturedProducts />}>
              <FeaturedProductsSection
                section={section}
                region={region}
                countryCode={countryCode}
              />
            </Suspense>
          )
        }

        // Categories Section
        if (section.section_type === "categories") {
          return (
            <Suspense key={section.id} fallback={<CategoryGridSkeleton />}>
              <CategoriesSection section={section} />
            </Suspense>
          )
        }

        // Testimonials Section
        if (section.section_type === "testimonials") {
          return (
            <Suspense key={section.id} fallback={<div className="py-12 bg-neutral-50" />}>
              <TestimonialsSection section={section} />
            </Suspense>
          )
        }

        // Promotional Section (placeholder - can be enhanced later)
        if (section.section_type === "promotional") {
          return (
            <div key={section.id} className="content-container py-12 bg-neutral-50">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="text-neutral-600">{section.subtitle}</p>
                )}
              </div>
              {/* Promotional content can be implemented here */}
            </div>
          )
        }

        // Generic section with title
        return (
          <div key={section.id} className="content-container py-12 bg-white">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
                {section.title}
              </h2>
              {section.subtitle && (
                <p className="text-neutral-600">{section.subtitle}</p>
              )}
            </div>
          </div>
        )
      })}
    </>
  )
}

// Helper component for featured products section
async function FeaturedProductsSection({
  section,
  region,
  countryCode,
}: {
  section: HomepageSection
  region: any
  countryCode: string
}) {
  if (!section.collection_id || !region) {
    return null
  }

  // Fetch the specific collection by ID with products
  let collection
  try {
    collection = await retrieveCollection(section.collection_id, true)
  } catch (error) {
    console.error(`Failed to fetch collection ${section.collection_id}:`, error)
    return null
  }

  if (!collection) {
    return null
  }

  return (
    <div className="bg-neutral-100">
      <div className="content-container py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="text-neutral-600">{section.subtitle}</p>
          )}
        </div>
        <ProductRail collection={collection} region={region} />
      </div>
    </div>
  )
}

// Helper component for categories section
async function CategoriesSection({
  section,
}: {
  section: HomepageSection
}) {
  if (process.env.NODE_ENV === "development") {
    console.log("[CategoriesSection] Rendering categories section:", {
      id: section.id,
      title: section.title,
      section_type: section.section_type,
      show_category_images: section.show_category_images,
      product_limit: section.product_limit,
    })
  }

  return (
    <div className="bg-white">
      <div className="content-container py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="text-neutral-600">{section.subtitle}</p>
          )}
        </div>
        <CategoryGrid
          showImages={section.show_category_images || false}
          limit={section.product_limit || undefined}
        />
      </div>
    </div>
  )
}

// Helper component for testimonials section
async function TestimonialsSection({
  section,
}: {
  section: HomepageSection
}) {
  const testimonials = await getTestimonials()

  if (!testimonials || testimonials.length === 0) {
    return null
  }

  // Testimonials component already has its own title, so we just render it
  // The section title/subtitle are handled by the component itself
  return <Testimonials testimonials={testimonials} />
}

// Skeleton loader for category grid
function CategoryGridSkeleton() {
  return (
    <div className="bg-white">
      <div className="content-container py-12">
        <div className="text-center mb-8">
          <div className="h-8 w-48 bg-neutral-200 rounded mx-auto mb-2 animate-pulse" />
          <div className="h-4 w-64 bg-neutral-200 rounded mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-full aspect-square bg-neutral-200 rounded-lg animate-pulse" />
              <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomepageSections

