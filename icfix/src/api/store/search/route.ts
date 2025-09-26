import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { MeiliSearchService } from "../../modules/search/meilisearch"

interface SearchRequestBody {
  q: string
  limit?: number
  offset?: number
  filters?: string
  sort?: string[]
}

interface SearchQueryParams {
  q?: string
  limit?: string
  offset?: string
  filters?: string
  sort?: string | string[]
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as SearchRequestBody
    const { q, limit = 20, offset = 0, filters = "", sort = [] } = body
    
    if (!q || q.trim() === "") {
      return res.json({
        hits: [],
        totalHits: 0,
        message: "Search query is required"
      })
    }

    const searchService = new MeiliSearchService()
    const results = await searchService.searchProducts(q, {
      limit: parseInt(limit.toString()),
      offset: parseInt(offset.toString()),
      filters,
      sort
    })

    return res.json({
      hits: results.hits,
      totalHits: results.totalHits,
      query: q,
      limit: parseInt(limit.toString()),
      offset: parseInt(offset.toString())
    })
  } catch (error) {
    console.error("Search API error:", error)
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to perform search"
    })
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.query as SearchQueryParams
    const { q, limit = "20", offset = "0", filters = "", sort = [] } = query
    
    if (!q || (typeof q === 'string' && q.trim() === "")) {
      return res.json({
        hits: [],
        totalHits: 0,
        message: "Search query is required"
      })
    }

    const searchService = new MeiliSearchService()
    const results = await searchService.searchProducts(q as string, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      filters: filters as string,
      sort: Array.isArray(sort) ? sort : [sort as string]
    })

    return res.json({
      hits: results.hits,
      totalHits: results.totalHits,
      query: q,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error("Search API error:", error)
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to perform search"
    })
  }
}
