import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

const ENDPOINT = process.env.REVALIDATE_ENDPOINT
const SECRET = process.env.REVALIDATE_SECRET

export default async function revalidateOnChange(
  { event }: SubscriberArgs<{ id?: string; ids?: string[] }>
) {
  if (!ENDPOINT || !SECRET) return
  try {
    const url = new URL(ENDPOINT)
    url.searchParams.set("secret", SECRET)
    url.searchParams.set("event", event.name)

    const body = JSON.stringify({
      event: event.name,
      id: (event.data as any)?.id,
      ids: (event.data as any)?.ids,
    })

    await fetch(url.toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[revalidate] failed:", e)
  }
}

export const config: SubscriberConfig = {
  event: [
    "product.created","product.updated","product.deleted",
    "product-variant.created","product-variant.updated","product-variant.deleted",
    "product-collection.created","product-collection.updated","product-collection.deleted",
    "product-category.created","product-category.updated","product-category.deleted",
  ],
  context: { subscriberId: "vercel-revalidate" },
}


