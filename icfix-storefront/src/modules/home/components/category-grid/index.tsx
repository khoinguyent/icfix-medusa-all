import { listCategories } from "@lib/data/categories"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { Photo } from "@medusajs/icons"

type CategoryGridProps = {
  showImages?: boolean
  limit?: number
}

export default async function CategoryGrid({
  showImages = false,
  limit,
}: CategoryGridProps) {
  console.log("[CategoryGrid] Component called with:", { showImages, limit })
  
  try {
    console.log("[CategoryGrid] Fetching categories...")
    const categories = await listCategories({
      limit: limit || 100,
    })
    console.log("[CategoryGrid] Categories fetched:", categories.length)

    // Debug logging (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log("[CategoryGrid] Total categories fetched:", categories.length)
      categories.forEach(c => {
        console.log("[CategoryGrid] Category:", {
          id: c.id,
          name: c.name,
          handle: c.handle,
          parent_category_id: c.parent_category_id,
          parent_category: c.parent_category,
          hasParent: !!c.parent_category_id || !!c.parent_category
        })
      })
    }

    // Filter to only show top-level categories (no parent)
    // Check both parent_category_id and parent_category object
    const topLevelCategories = categories.filter((cat) => {
      // Check if parent_category_id exists and is not null/undefined/empty string
      const hasParentId = cat.parent_category_id !== null && 
                         cat.parent_category_id !== undefined && 
                         cat.parent_category_id !== ""
      
      // Check if parent_category object exists
      const hasParentObject = cat.parent_category !== null && 
                              cat.parent_category !== undefined
      
      return !hasParentId && !hasParentObject
    })

    if (!topLevelCategories || topLevelCategories.length === 0) {
      // Show a helpful message with debug info
      return (
        <div className="text-center py-8">
          <p className="text-neutral-500 text-sm mb-2">
            No top-level categories found.
          </p>
          {categories.length > 0 ? (
            <div className="text-left max-w-2xl mx-auto mt-4 p-4 bg-neutral-50 rounded">
              <p className="text-neutral-600 text-xs mb-2">
                Found {categories.length} total categories, but all have parent categories.
              </p>
              <p className="text-neutral-400 text-xs mt-3">
                💡 To fix: In Medusa Admin → Products → Categories, ensure categories have NO parent category selected.
              </p>
            </div>
          ) : (
            <p className="text-neutral-400 text-xs mt-2">
              No categories found. Create categories in the admin panel (Products → Categories).
            </p>
          )}
        </div>
      )
    }

    // Display categories in a grid layout
    const categoriesToShow = limit 
      ? topLevelCategories.slice(0, limit)
      : topLevelCategories

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
        {categoriesToShow.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            showImage={showImages}
          />
        ))}
      </div>
    )
  } catch (error) {
    console.error("[CategoryGrid] Error fetching categories:", error)
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-sm">
          Failed to load categories. Please try again later.
        </p>
      </div>
    )
  }
}

function CategoryCard({
  category,
  showImage,
}: {
  category: HttpTypes.StoreProductCategory
  showImage: boolean
}) {
  // Get category image from metadata if available
  // Medusa categories store images in metadata, not as a direct field
  const categoryImage =
    (category.metadata as any)?.image_url ||
    (category.metadata as any)?.thumbnail ||
    (category.metadata as any)?.image ||
    null

  const productCount = category.products?.length || 0

  // If showImage is false, don't render image container at all
  // If showImage is true but no image, show placeholder
  return (
    <LocalizedClientLink
      href={`/categories/${category.handle}`}
      className="group flex flex-col items-center text-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
    >
      {showImage ? (
        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-neutral-100 mb-2">
          {categoryImage ? (
            <Image
              src={categoryImage}
              alt={category.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              onError={(e) => {
                console.error("Failed to load category image:", categoryImage)
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100">
              <Photo className="text-neutral-400 w-8 h-8 sm:w-12 sm:h-12" />
            </div>
          )}
        </div>
      ) : (
        // If images are disabled, show a simple icon or colored circle
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-200 flex items-center justify-center mb-2">
          <span className="text-neutral-600 text-xl sm:text-2xl font-bold">
            {category.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex flex-col items-center gap-1">
        <h3 className="text-sm sm:text-base font-semibold text-neutral-900 group-hover:text-neutral-700">
          {category.name}
        </h3>
        {productCount > 0 && (
          <p className="text-xs sm:text-sm text-neutral-500">
            {productCount} {productCount === 1 ? "product" : "products"}
          </p>
        )}
      </div>
    </LocalizedClientLink>
  )
}

