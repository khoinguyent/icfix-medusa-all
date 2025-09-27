import Medusa from "@medusajs/js-sdk"

const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
})

export interface SearchResult {
  id: string
  title: string
  description: string
  handle: string
  thumbnail: string
  variants: Array<{
    id: string
    sku: string
    title: string
    price: number
    inventory_quantity: number
  }>
  collection?: {
    id: string
    title: string
    handle: string
  }
  category?: {
    id: string
    title: string
    handle: string
  }
}

export interface SearchResponse {
  hits: SearchResult[]
  totalHits: number
  query: string
  limit: number
  offset: number
}

export async function searchProducts(
  query: string,
  options: {
    limit?: number
    offset?: number
    filter?: string
    sort?: string[]
  } = {}
): Promise<SearchResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    const params = new URLSearchParams({
      q: query,
      limit: String(options.limit ?? 20),
      offset: String(options.offset ?? 0),
    })
    if (options.filter) params.set("filter", options.filter)
    if (options.sort && options.sort.length) params.set("sort", options.sort.join(","))

    const response = await fetch(`${baseUrl}/store/search?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Search request failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error searching products:", error)
    return {
      hits: [],
      totalHits: 0,
      query,
      limit: options.limit || 20,
      offset: options.offset || 0,
    }
  }
}
