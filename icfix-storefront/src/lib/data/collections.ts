"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const retrieveCollection = async (id: string) => {
  const dynamicCacheOptions = await getCacheOptions("collections")
  
  // Combine dynamic cache tags (from cookies) with static tag (for webhook revalidation)
  const dynamicTags = (dynamicCacheOptions && "tags" in dynamicCacheOptions) 
    ? dynamicCacheOptions.tags 
    : []
  const cacheTags = [...dynamicTags, "collections", `collection:${id}`]

  const next = {
    tags: cacheTags,
  }

  return sdk.client
    .fetch<{ collection: HttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        next,
      }
    )
    .then(({ collection }) => collection)
}

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  const dynamicCacheOptions = await getCacheOptions("collections")
  
  // Combine dynamic cache tags (from cookies) with static tag (for webhook revalidation)
  const dynamicTags = (dynamicCacheOptions && "tags" in dynamicCacheOptions) 
    ? dynamicCacheOptions.tags 
    : []
  const cacheTags = [...dynamicTags, "collections"]

  const next = {
    tags: cacheTags,
  }

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  return sdk.client
    .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
      "/store/collections",
      {
        query: queryParams,
        next,
      }
    )
    .then(({ collections }) => ({ collections, count: collections.length }))
}

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection> => {
  const dynamicCacheOptions = await getCacheOptions("collections")
  
  // Combine dynamic cache tags (from cookies) with static tag (for webhook revalidation)
  const dynamicTags = (dynamicCacheOptions && "tags" in dynamicCacheOptions) 
    ? dynamicCacheOptions.tags 
    : []
  const cacheTags = [...dynamicTags, "collections", `collection:${handle}`]

  const next = {
    tags: cacheTags,
  }

  return sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
      query: { handle },
      next,
    })
    .then(({ collections }) => collections[0])
}
