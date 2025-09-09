/**
 * create-webhook-via-api.ts
 *
 * Usage (inside your backend container):
 *   docker exec \
 *     -e MEDUSA_BACKEND_URL="http://localhost:9000" \
 *     -e ADMIN_API_KEY="sk_xxx...xxx" \
 *     -e WEBHOOK_TARGET_BASE="https://icfix-medusa-all.vercel.app/api/revalidate" \
 *     icfix-backend \
 *     npx medusa exec src/scripts/create-webhook-via-api.ts
 *
 * Notes:
 * - MEDUSA_BACKEND_URL defaults to http://localhost:9000
 * - ADMIN_API_KEY must be a Medusa v2 **Secret** API Key (from Admin UI → Settings → Secret API Keys)
 * - WEBHOOK_TARGET_BASE is your receiver (e.g., Vercel revalidate route)
 * - WEBHOOK_EVENTS (optional) comma-separated list; defaults below
 * - WEBHOOK_HTTP_METHOD (optional) defaults to POST
 * - WEBHOOK_NAME_PREFIX (optional) defaults to "vercel-revalidate"
 */

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

type Webhook = {
  id: string
  name: string
  url: string
  http_method: HttpMethod
  events: string[]
  enabled?: boolean
  created_at?: string
  updated_at?: string
}

type ListWebhooksRes = {
  webhooks: Webhook[]
  count?: number
  limit?: number
  offset?: number
}

const MEDUSA_BACKEND_URL = (process.env.MEDUSA_BACKEND_URL || "http://localhost:9000").replace(/\/+$/, "")
const ADMIN_API_KEY = process.env.ADMIN_API_KEY
const WEBHOOK_TARGET_BASE = process.env.WEBHOOK_TARGET_BASE?.replace(/\/+$/, "")
const WEBHOOK_HTTP_METHOD = (process.env.WEBHOOK_HTTP_METHOD || "POST").toUpperCase() as HttpMethod
const WEBHOOK_NAME_PREFIX = process.env.WEBHOOK_NAME_PREFIX || "vercel-revalidate"

const DEFAULT_EVENTS = [
  "product.created",
  "product.updated",
  "product.deleted",
  "collection.created",
  "collection.updated",
  "collection.deleted",
  "category.created",
  "category.updated",
  "category.deleted",
  "variant.created",
  "variant.updated",
  "variant.deleted",
  "price_list.updated",
  "inventory_item.updated",
]

const WEBHOOK_EVENTS = (process.env.WEBHOOK_EVENTS
  ? process.env.WEBHOOK_EVENTS.split(",").map((s) => s.trim()).filter(Boolean)
  : DEFAULT_EVENTS
)

if (!ADMIN_API_KEY) {
  throw new Error("Missing ADMIN_API_KEY (Secret API Key). Generate one in Admin UI → Settings → Secret API Keys.")
}

if (!WEBHOOK_TARGET_BASE) {
  throw new Error("Missing WEBHOOK_TARGET_BASE (e.g., https://<your-vercel-app>/api/revalidate)")
}

const BASIC = "Basic " + Buffer.from(`${ADMIN_API_KEY}:`).toString("base64")

async function req<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${MEDUSA_BACKEND_URL}${path}`
  const headers: Record<string, string> = {
    "Authorization": BASIC,
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> || {}),
  }

  const res = await fetch(url, { ...init, headers })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`${init.method || "GET"} ${path} -> ${res.status} ${res.statusText} ${text}`)
  }
  // Some endpoints return 204
  if (res.status === 204) return {} as T
  return (await res.json()) as T
}

function buildWebhookName(event: string) {
  return `${WEBHOOK_NAME_PREFIX}-${event}`
}

function buildWebhookUrl(event: string) {
  // Pass `event` as a query param so your revalidate handler can branch.
  const u = new URL(WEBHOOK_TARGET_BASE)
  u.searchParams.set("event", event)
  return u.toString()
}

function eventsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  const s1 = new Set(a)
  for (const e of b) if (!s1.has(e)) return false
  return true
}

async function listWebhooks(): Promise<Webhook[]> {
  const data = await req<ListWebhooksRes>("/admin/webhooks", { method: "GET" })
  return data.webhooks || []
}

async function createWebhook(name: string, url: string, events: string[]) {
  const body = {
    name,
    url,
    http_method: WEBHOOK_HTTP_METHOD,
    events,
    // enabled: true, // default is enabled; include if your backend needs explicit flag
  }
  const data = await req<{ webhook: Webhook }>("/admin/webhooks", {
    method: "POST",
    body: JSON.stringify(body),
  })
  return data.webhook
}

async function deleteWebhook(id: string) {
  await req(`/admin/webhooks/${id}`, { method: "DELETE" })
}

async function upsertWebhookForEvent(event: string) {
  const name = buildWebhookName(event)
  const url = buildWebhookUrl(event)

  const existing = await listWebhooks()
  // Try exact match (same name, same url, same events, same method)
  const exact = existing.find(
    (w) =>
      w.name === name &&
      w.url === url &&
      w.http_method === WEBHOOK_HTTP_METHOD &&
      eventsEqual(w.events, [event])
  )

  if (exact) {
    console.log(`✔ Webhook already exists for "${event}" (id=${exact.id}) — skipping`)
    return exact
  }

  // If something with same name exists but differs, replace it to keep things tidy
  const sameName = existing.find((w) => w.name === name)
  if (sameName) {
    console.log(`↻ Replacing outdated webhook "${name}" (id=${sameName.id})`)
    await deleteWebhook(sameName.id)
  }

  const created = await createWebhook(name, url, [event])
  console.log(`✔ Created webhook for "${event}" (id=${created.id}) -> ${created.url}`)
  return created
}

async function main() {
  console.log("=== Medusa Admin Webhook Setup ===")
  console.log(`Backend: ${MEDUSA_BACKEND_URL}`)
  console.log(`Target : ${WEBHOOK_TARGET_BASE}`)
  console.log(`Auth   : Secret API Key (Basic)`)
  console.log(`Method : ${WEBHOOK_HTTP_METHOD}`)
  console.log(`Events : ${WEBHOOK_EVENTS.join(", ")}`)
  console.log("==================================")

  for (const event of WEBHOOK_EVENTS) {
    try {
      await upsertWebhookForEvent(event)
    } catch (err: any) {
      console.error(`✗ Failed for "${event}": ${err?.message || err}`)
      // continue to next event instead of aborting all
    }
  }

  console.log("Done.")
}

main().catch((e) => {
  console.error("Fatal error:", e)
  process.exit(1)
})
