import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

const ENDPOINT = process.env.REVALIDATE_ENDPOINT
const SECRET = process.env.REVALIDATE_SECRET

export default async function revalidateOnChange(
  { event }: SubscriberArgs<{ id?: string; ids?: string[] }>
) {
  if (!ENDPOINT || !SECRET) {
    console.warn(
      `[revalidate] Skipping revalidation for event "${event.name}" - REVALIDATE_ENDPOINT or REVALIDATE_SECRET not set`
    )
    return
  }
  
  try {
    const url = new URL(ENDPOINT)
    url.searchParams.set("secret", SECRET)
    url.searchParams.set("event", event.name)

    // Extract relevant data from event for revalidation
    const eventData = event.data as any
    const body = JSON.stringify({
      event: event.name,
      id: eventData?.id,
      ids: eventData?.ids,
      // Include handle for products, collections, and categories
      handle: eventData?.handle,
      // Include product_id for variant events
      product_id: eventData?.product_id,
    })

    console.log(`[revalidate] Triggering revalidation for event: ${event.name}`, {
      endpoint: ENDPOINT,
      event: event.name,
      id: (event.data as any)?.id,
    })

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      console.error(
        `[revalidate] Failed for event "${event.name}": ${response.status} ${response.statusText}`,
        errorText
      )
    } else {
      const result = await response.json().catch(() => ({}))
      console.log(`[revalidate] Success for event "${event.name}":`, result)
    }
  } catch (e) {
    console.error(`[revalidate] Error for event "${event.name}":`, e)
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


