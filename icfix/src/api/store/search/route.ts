import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { MeiliSearchService } from "../../modules/search/meilisearch"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { q, limit = 20, offset = 0, filters = "", sort = [] } = req.body
    
    if (!q || q.trim() === "") {
      return res.json({
        hits: [],
        totalHits: 0,
        message: "Search query is required"
      })
    }

    const searchService = new MeiliSearchService()
    const results = await searchService.searchProducts(q, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      filters,
      sort
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

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { q, limit = 20, offset = 0, filters = "", sort = [] } = req.query
    
    if (!q || q.trim() === "") {
      return res.json({
        hits: [],
        totalHits: 0,
        message: "Search query is required"
      })
    }

    const searchService = new MeiliSearchService()
    const results = await searchService.searchProducts(q as string, {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      filters: filters as string,
      sort: Array.isArray(sort) ? sort : [sort as string]
    })

    return res.json({
      hits: results.hits,
      totalHits: results.totalHits,
      query: q,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    })
  } catch (error) {
    console.error("Search API error:", error)
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to perform search"
    })
  }
}
