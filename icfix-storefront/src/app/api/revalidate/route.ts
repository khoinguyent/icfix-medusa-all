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
    if (event === "product.created" || event === "product.updated" || event === "product.deleted") {
      const productId = body.id
      if (productId) {
        // Revalidate specific product cache
        revalidateTag(`product:${productId}`)
      }
      // Also revalidate general products cache
      revalidateTag("products")
    }

    if (event === "product-variant.created" || event === "product-variant.updated" || event === "product-variant.deleted") {
      // Revalidate products cache when variants change
      revalidateTag("products")
    }

    if (event === "product-collection.created" || event === "product-collection.updated" || event === "product-collection.deleted") {
      // Revalidate collections cache
      revalidateTag("collections")
    }

    if (event === "product-category.created" || event === "product-category.updated" || event === "product-category.deleted") {
      // Revalidate categories cache
      revalidateTag("categories")
    }

    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (err) {
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 })
  }
}
