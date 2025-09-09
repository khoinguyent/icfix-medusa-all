// Next.js (App Router)
// File: src/app/api/revalidate/route.ts

import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

// revalidatePath requires Node.js runtime (not Edge)
export const runtime = "nodejs"
// Ensure this route is always dynamic
export const dynamic = "force-dynamic"

const STORE_BACKEND =
  (process.env.MEDUSA_STORE_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_URL ||
    process.env.MEDUSA_BACKEND_URL ||
    "").replace(/\/+$/, "")

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || ""

// ---- helpers --------------------------------------------------------------

function bad(message: string, status = 400) {
  return new NextResponse(message, { status })
}

function ok(json: any, status = 200) {
  return NextResponse.json(json, { status })
}

async function fetchJSON<T = any>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    // don't cache backend lookups during ISR webhook handling
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) {
    throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as T
}

async function getProductInfo(productId: string): Promise<{
  handle?: string
  collection_id?: string | null
  category_ids?: string[]
}> {
  // Medusa v2 Store API: /store/products/:id
  const url = `${STORE_BACKEND}/store/products/${productId}`
  const data = await fetchJSON<any>(url).catch(() => ({}))

  const p = data?.product || data
  const handle = p?.handle as string | undefined
  const collection_id = p?.collection_id ?? null

  // categories can be under p.categories or p.product_categories
  const cats = (p?.categories || p?.product_categories || []) as any[]
  const category_ids = cats.map((c) => c?.id).filter(Boolean)

  return { handle, collection_id, category_ids }
}

async function getCollectionHandle(collectionId: string): Promise<string | null> {
  // Medusa v2 Store API: /store/collections/:id
  const url = `${STORE_BACKEND}/store/collections/${collectionId}`
  const data = await fetchJSON<any>(url).catch(() => null)
  if (!data) return null
  const c = data.collection || data
  return (c?.handle as string) || null
}

async function getCategoryHandle(categoryId: string): Promise<string | null> {
  // Medusa v2 Store API: /store/product-categories/:id
  const url = `${STORE_BACKEND}/store/product-categories/${categoryId}`
  const data = await fetchJSON<any>(url).catch(() => null)
  if (!data) return null
  const cat = data.category || data.product_category || data
  // handle/slug varies by implementation — try common fields
  return (cat?.handle as string) || (cat?.slug as string) || null
}

function addPath(paths: Set<string>, p?: string | null) {
  if (!p) return
  const norm = p.startsWith("/") ? p : `/${p}`
  paths.add(norm)
}

// ---- handler --------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1) Auth
  const secret = req.nextUrl.searchParams.get("secret")
  if (!REVALIDATE_SECRET || secret !== REVALIDATE_SECRET) {
    return bad("Invalid token", 401)
  }
  if (!STORE_BACKEND) {
    return bad("MEDUSA_STORE_BACKEND_URL is not configured", 500)
  }

  // 2) Event + payload
  const event = (req.nextUrl.searchParams.get("event") || "").toLowerCase()
  let body: any = {}
  try {
    body = await req.json()
  } catch {
    // no body is fine (some events may not send anything)
    body = {}
  }

  // 3) Collect paths to revalidate
  const paths = new Set<string>()
  // Always refresh core listings
  addPath(paths, "/")
  addPath(paths, "/products")

  // Try to extract useful IDs
  const id =
    body?.id ??
    body?.data?.id ??
    body?.resource_id ??
    body?.product?.id ??
    null

  const productId =
    body?.product_id ??
    body?.variant?.product_id ??
    body?.inventory_item?.product_id ??
    id

  const collectionId =
    body?.collection_id ??
    body?.collection?.id ??
    body?.product?.collection_id ??
    null

  const categoryIds: string[] =
    body?.category_ids ??
    body?.product?.categories?.map((c: any) => c?.id).filter(Boolean) ??
    []

  try {
    if (
      event.startsWith("product.") ||
      event.startsWith("variant.") ||
      event.startsWith("inventory_item.")
    ) {
      if (productId) {
        const info = await getProductInfo(productId).catch(() => ({}))
        if (info?.handle) addPath(paths, `/products/${info.handle}`)

        const cid = collectionId || info?.collection_id
        if (cid) {
          const ch = await getCollectionHandle(cid).catch(() => null)
          if (ch) addPath(paths, `/collections/${ch}`)
        }

        const catIds =
          categoryIds?.length
            ? categoryIds
            : (info?.category_ids || [])

        for (const catId of catIds) {
          const h = await getCategoryHandle(catId).catch(() => null)
          if (h) addPath(paths, `/categories/${h}`)
        }
      }
    } else if (event.startsWith("collection.")) {
      const cid = collectionId || id
      if (cid) {
        const ch = await getCollectionHandle(cid).catch(() => null)
        if (ch) addPath(paths, `/collections/${ch}`)
      }
    } else if (event.startsWith("category.")) {
      const cid =
        (Array.isArray(categoryIds) ? categoryIds[0] : categoryIds) || id
      if (cid) {
        const h = await getCategoryHandle(cid).catch(() => null)
        if (h) addPath(paths, `/categories/${h}`)
      }
    } else if (event.startsWith("price_list.")) {
      // Pricing changes can affect many pages — keep it broad
      addPath(paths, "/")
      addPath(paths, "/products")
    }
  } catch {
    // Even if lookups fail, we still revalidate generic pages
  }

  // 4) Revalidate
  const revalidated: string[] = []
  for (const p of paths) {
    try {
      revalidatePath(p)
      revalidated.push(p)
    } catch (e) {
      // continue even if a single path fails
    }
  }

  return ok({
    ok: true,
    event,
    count: revalidated.length,
    paths: revalidated,
  })
}

// Optional: GET for manual testing in browser or curl
export async function GET(req: NextRequest): Promise<NextResponse> {
  const secret = req.nextUrl.searchParams.get("secret")
  if (!REVALIDATE_SECRET || secret !== REVALIDATE_SECRET) {
    return bad("Invalid token", 401)
  }
  const path = req.nextUrl.searchParams.get("path") || "/"
  try {
    revalidatePath(path)
    return ok({ ok: true, path })
  } catch (e: any) {
    return bad(`Error revalidating: ${e?.message || e}`, 500)
  }
}
