import { revalidateTag, revalidatePath } from "next/cache"
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
      // Revalidate static tags (works for webhooks without cookies)
      revalidateTag("collections")
      revalidateTag("products") 
      revalidateTag("categories")
      
      // Also revalidate dynamic tags if cacheId is available
      if (cacheId !== "default") {
      revalidateTag(`collections-${cacheId}`)
      revalidateTag(`products-${cacheId}`)
      revalidateTag(`categories-${cacheId}`)
      }
      
      // Revalidate paths to ensure pages are regenerated
      revalidatePath("/store", "page")
      revalidatePath("/", "page")
      revalidatePath("/", "layout")
      
      return NextResponse.json({ revalidated: true, now: Date.now(), cacheId, event: "manual" })
    }
    
    if (event === "product.created" || event === "product.updated" || event === "product.deleted") {
      const productId = body.id
      const productHandle = body.handle
      
      // Revalidate static tag (works for webhooks without cookies)
      revalidateTag("products")
      
      // Revalidate dynamic tags if cacheId is available
      if (cacheId !== "default") {
        revalidateTag(`products-${cacheId}`)
      if (productId) {
        revalidateTag(`product-${cacheId}`)
        revalidateTag(`product:${productId}-${cacheId}`)
      }
      }
      
      // Revalidate product handle if provided
      if (productHandle) {
        revalidateTag(`product:${productHandle}`)
      }
      
      // Revalidate paths to ensure pages are regenerated
      revalidatePath("/store", "page")
      revalidatePath("/", "page")
      
      // Revalidate specific product page if handle is available
      if (productHandle) {
        revalidatePath(`/products/${productHandle}`, "page")
      }
    }

    if (event === "product-variant.created" || event === "product-variant.updated" || event === "product-variant.deleted") {
      // Revalidate static products cache (works for webhooks without cookies)
      revalidateTag("products")
      
      // Also revalidate dynamic tags if cacheId is available
      if (cacheId !== "default") {
      revalidateTag(`products-${cacheId}`)
      }
      
      // Revalidate paths
      revalidatePath("/store", "page")
    }

    if (event === "product-collection.created" || event === "product-collection.updated" || event === "product-collection.deleted") {
      // Revalidate static collections cache (works for webhooks without cookies)
      revalidateTag("collections")
      
      // Also revalidate dynamic tags if cacheId is available
      if (cacheId !== "default") {
        revalidateTag(`collections-${cacheId}`)
      }
      
      // Revalidate collection handle or ID if provided
      if (body.handle) {
        revalidateTag(`collection:${body.handle}`)
      }
      if (body.id) {
        revalidateTag(`collection:${body.id}`)
      }
      
      // Revalidate paths
      revalidatePath("/store", "page")
      revalidatePath("/", "page")
      
      // Revalidate collection pages
      if (body.handle) {
        revalidatePath(`/collections/${body.handle}`, "page")
      }
    }

    if (event === "product-category.created" || event === "product-category.updated" || event === "product-category.deleted") {
      // Revalidate categories cache - use static tag for webhook compatibility
      // Static tag works regardless of cacheId cookies
      revalidateTag("categories")
      
      // Also revalidate dynamic tags if cacheId is available
      if (cacheId !== "default") {
        revalidateTag(`categories-${cacheId}`)
      }
      
      // Revalidate category handle if provided
      if (body.handle) {
        revalidateTag(`category:${body.handle}`)
      }
      
      // Revalidate all paths that display categories
      revalidatePath("/store", "page")
      revalidatePath("/", "page")
      
      // Revalidate category pages
      if (body.handle) {
        revalidatePath(`/categories/${body.handle}`, "page")
      }
    }

    // Promotional content events
    if (
      event === "promotional-banner.created" ||
      event === "promotional-banner.updated" ||
      event === "promotional-banner.deleted"
    ) {
      // Revalidate all promotional content cache tags
      revalidateTag("homepage")
      revalidateTag("promotional-content")
      revalidateTag("banners")
      
      // Revalidate position-specific banner tags
      if (body.position) {
        revalidateTag(`banners:${body.position}`)
      }
      revalidateTag("banners:hero")
      revalidateTag("banners:homepage")
      
      // Revalidate dynamic tags if cacheId is available
      if (cacheId !== "default") {
        revalidateTag(`homepage-${cacheId}`)
        revalidateTag(`banners-${cacheId}`)
      }
      
      // Revalidate homepage path
      revalidatePath("/", "page")
    }

    if (
      event === "service-feature.created" ||
      event === "service-feature.updated" ||
      event === "service-feature.deleted"
    ) {
      // Revalidate service features cache
      revalidateTag("homepage")
      revalidateTag("promotional-content")
      revalidateTag("service-features")
      
      // Revalidate dynamic tags if cacheId is available
      if (cacheId !== "default") {
        revalidateTag(`homepage-${cacheId}`)
        revalidateTag(`service-features-${cacheId}`)
      }
      
      // Revalidate homepage path
      revalidatePath("/", "page")
    }

    if (
      event === "testimonial.created" ||
      event === "testimonial.updated" ||
      event === "testimonial.deleted"
    ) {
      // Revalidate testimonials cache
      revalidateTag("homepage")
      revalidateTag("promotional-content")
      revalidateTag("testimonials")
      
      // Revalidate dynamic tags if cacheId is available
      if (cacheId !== "default") {
        revalidateTag(`homepage-${cacheId}`)
        revalidateTag(`testimonials-${cacheId}`)
      }
      
      // Revalidate homepage path
      revalidatePath("/", "page")
    }

    if (
      event === "homepage-section.created" ||
      event === "homepage-section.updated" ||
      event === "homepage-section.deleted"
    ) {
      // Revalidate homepage sections cache
      revalidateTag("homepage")
      revalidateTag("promotional-content")
      revalidateTag("homepage-sections")
      
      // Revalidate dynamic tags if cacheId is available
      if (cacheId !== "default") {
        revalidateTag(`homepage-${cacheId}`)
        revalidateTag(`homepage-sections-${cacheId}`)
      }
      
      // Revalidate homepage path
      revalidatePath("/", "page")
    }

    // Generic promotional content update event (for manual triggers)
    if (event === "promotional-content.updated" || event === "promotional-content.revalidate") {
      // Revalidate all promotional content
      revalidateTag("homepage")
      revalidateTag("promotional-content")
      revalidateTag("banners")
      revalidateTag("banners:hero")
      revalidateTag("banners:homepage")
      revalidateTag("service-features")
      revalidateTag("testimonials")
      revalidateTag("homepage-sections")
      
      // Revalidate dynamic tags if cacheId is available
      if (cacheId !== "default") {
        revalidateTag(`homepage-${cacheId}`)
        revalidateTag(`banners-${cacheId}`)
        revalidateTag(`service-features-${cacheId}`)
        revalidateTag(`testimonials-${cacheId}`)
        revalidateTag(`homepage-sections-${cacheId}`)
      }
      
      // Revalidate homepage path
      revalidatePath("/", "page")
    }

    return NextResponse.json({ revalidated: true, now: Date.now(), cacheId })
  } catch (err) {
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 })
  }
}
