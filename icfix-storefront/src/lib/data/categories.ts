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

    return product_categories
  } catch (error) {
    console.warn("Could not fetch categories, returning empty list:", error)
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
