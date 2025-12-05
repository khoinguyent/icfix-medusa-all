import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")
  const event = request.nextUrl.searchParams.get("event")
  const body = await request.json()

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 })
  }

  try {
    // Get cache ID from request headers or cookies
    const cacheId = request.headers.get("x-cache-id") || "default"
    
    // If event is "manual" or "force", revalidate all caches
    if (event === "manual" || event === "force") {
      revalidateTag("collections")
      revalidateTag("products") 
      revalidateTag("categories")
      revalidateTag(`collections-${cacheId}`)
      revalidateTag(`products-${cacheId}`)
      revalidateTag(`categories-${cacheId}`)
      return NextResponse.json({ revalidated: true, now: Date.now(), cacheId, event: "manual" })
    }
    
    if (event === "product.created" || event === "product.updated" || event === "product.deleted") {
      const productId = body.id
      if (productId) {
        // Revalidate specific product cache
        revalidateTag(`product-${cacheId}`)
        revalidateTag(`product:${productId}-${cacheId}`)
      }
      // Also revalidate general products cache
      revalidateTag(`products-${cacheId}`)
    }

    if (event === "product-variant.created" || event === "product-variant.updated" || event === "product-variant.deleted") {
      // Revalidate products cache when variants change
      revalidateTag(`products-${cacheId}`)
    }

    if (event === "product-collection.created" || event === "product-collection.updated" || event === "product-collection.deleted") {
      // Revalidate collections cache with dynamic tag
      revalidateTag(`collections-${cacheId}`)
      // Also try static tag as fallback
      revalidateTag("collections")
    }

    if (event === "product-category.created" || event === "product-category.updated" || event === "product-category.deleted") {
      // Revalidate categories cache
      revalidateTag(`categories-${cacheId}`)
      // Also try static tag as fallback
      revalidateTag("categories")
    }

    return NextResponse.json({ revalidated: true, now: Date.now(), cacheId })
  } catch (err) {
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 })
  }
}
