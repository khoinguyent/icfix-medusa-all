"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listCategories = async (
  query?: Record<string, any>
): Promise<HttpTypes.StoreProductCategory[]> => {
  const dynamicCacheOptions = await getCacheOptions("categories")
  
  // Combine dynamic cache tags (from cookies) with static tag (for webhook revalidation)
  // Static tag allows webhooks to invalidate cache without needing cookies
  const dynamicTags = (dynamicCacheOptions && "tags" in dynamicCacheOptions) 
    ? dynamicCacheOptions.tags 
    : []
  const cacheTags = [...dynamicTags, "categories"]

  const next = {
    tags: cacheTags,
  }

  const limit = query?.limit || 100

  try {
    const { product_categories } = await sdk.client.fetch<{
      product_categories: HttpTypes.StoreProductCategory[]
    }>("/store/product-categories", {
      query: {
        fields:
          "*category_children, *products, *parent_category, *parent_category.parent_category",
        limit,
        ...query,
      },
      next,
    })

    if (process.env.NODE_ENV === "development") {
      console.log("[listCategories] Fetched categories:", product_categories?.length || 0)
      if (product_categories && product_categories.length > 0) {
        console.log("[listCategories] Sample category:", {
          id: product_categories[0].id,
          name: product_categories[0].name,
          handle: product_categories[0].handle,
          parent_category_id: product_categories[0].parent_category_id,
        })
      }
    }

    return product_categories || []
  } catch (error) {
    console.error("Could not fetch categories:", error)
    if (process.env.NODE_ENV === "development") {
      console.error("Category fetch error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
    }
    return []
  }
}

export const getCategoryByHandle = async (
  categoryHandle: string[]
): Promise<HttpTypes.StoreProductCategory | null> => {
  const handle = `${categoryHandle.join("/")}`

  const dynamicCacheOptions = await getCacheOptions("categories")
  
  // Combine dynamic cache tags (from cookies) with static tag (for webhook revalidation)
  // Static tag allows webhooks to invalidate cache without needing cookies
  const dynamicTags = (dynamicCacheOptions && "tags" in dynamicCacheOptions) 
    ? dynamicCacheOptions.tags 
    : []
  const cacheTags = [...dynamicTags, "categories", `category:${handle}`]

  const next = {
    tags: cacheTags,
  }

  try {
    const { product_categories } =
      await sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
        `/store/product-categories`,
        {
          query: {
            fields: "*category_children, *products",
            handle,
          },
          next,
        }
      )

    return product_categories?.[0] || null
  } catch (error) {
    console.warn(
      `Could not fetch category by handle (${handle}), returning null:`,
      error
    )
    return null
  }
}
