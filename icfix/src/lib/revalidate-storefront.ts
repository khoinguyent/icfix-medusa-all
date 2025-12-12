/**
 * Helper utility to trigger storefront revalidation when promotional content is updated
 */

const REVALIDATE_ENDPOINT = process.env.REVALIDATE_ENDPOINT
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET

export interface RevalidateOptions {
  event: string
  position?: string
  id?: string
}

/**
 * Trigger storefront cache revalidation
 * This should be called after creating, updating, or deleting promotional content
 */
export async function triggerStorefrontRevalidation(options: RevalidateOptions): Promise<void> {
  if (!REVALIDATE_ENDPOINT || !REVALIDATE_SECRET) {
    console.warn(
      "[revalidate] Skipping storefront revalidation - REVALIDATE_ENDPOINT or REVALIDATE_SECRET not set"
    )
    return
  }

  try {
    const url = new URL(REVALIDATE_ENDPOINT)
    url.searchParams.set("secret", REVALIDATE_SECRET)
    url.searchParams.set("event", options.event)

    const body = JSON.stringify({
      event: options.event,
      id: options.id,
      position: options.position,
    })

    console.log(`[revalidate] Triggering storefront revalidation for event: ${options.event}`, {
      endpoint: REVALIDATE_ENDPOINT,
      event: options.event,
      id: options.id,
      position: options.position,
    })

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      console.error(
        `[revalidate] Failed to revalidate storefront for event "${options.event}": ${response.status} ${response.statusText}`,
        errorText
      )
    } else {
      const result = await response.json().catch(() => ({}))
      console.log(`[revalidate] Successfully revalidated storefront for event "${options.event}":`, result)
    }
  } catch (error) {
    console.error(`[revalidate] Error triggering storefront revalidation for event "${options.event}":`, error)
    // Don't throw - revalidation failure shouldn't break the API response
  }
}
