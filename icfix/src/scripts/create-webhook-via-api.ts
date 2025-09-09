/**
 * create-webhook-via-api.ts (Medusa v2)
 *
 * Registers Medusa webhooks that POST to your Next.js /api/revalidate route.
 * Auth: Secret API Key (Admin → Settings → Secret API Keys) via Basic <base64(sk_:)>.
 *
 * Run (inside backend container):
 *   docker exec \
 *     -e MEDUSA_BACKEND_URL="http://localhost:9000" \
 *     -e ADMIN_API_KEY="sk_xxx...xxx" \
 *     -e WEBHOOK_TARGET_BASE="https://<your-storefront-domain>/api/revalidate" \
 *     -e REVALIDATE_SECRET="<same-as-in-storefront-env>" \
 *     icfix-backend \
 *     npx medusa exec src/scripts/create-webhook-via-api.ts
 *
 * Optional env:
 *   WEBHOOK_EVENTS="product.created,product.updated,product.deleted"
 *   WEBHOOK_HTTP_METHOD="POST"
 *   WEBHOOK_NAME_PREFIX="vercel-revalidate"
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
const WEBHOOK_TARGET_BASE = process.env.WEBHOOK_TARGET_BASE?.replace(/\/+$/, "") || "https://icfix-medusa-all.vercel.app/api/revalidate"
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "ed81a378f205e1549695f6f74ebcbd0b1d0fd0ca8e66a1439c92531d27dbe615"
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
  throw new Error("Missing ADMIN_API_KEY (Secret API Key). Create one in Admin → Settings → Secret API Keys.")
}
if (!WEBHOOK_TARGET_BASE) {
  throw new Error("Missing WEBHOOK_TARGET_BASE (e.g., https://icfix-medusa-all.vercel.app/api/revalidate)")
}
if (!REVALIDATE_SECRET) {
  throw new Error("Missing REVALIDATE_SECRET (must match your storefront env REVALIDATE_SECRET).")
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
  if (res.status === 204) return {} as T
  return (await res.json()) as T
}

function buildWebhookName(event: string) {
  return `${WEBHOOK_NAME_PREFIX}-${event}`
}

function buildWebhookUrl(event: string) {
  // Your Next route checks ?secret=...; we also append &event=<event> for visibility.
  const u = new URL(WEBHOOK_TARGET_BASE)
  u.searchParams.set("secret", REVALIDATE_SECRET!)
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
  console.log(`Backend : ${MEDUSA_BACKEND_URL}`)
  console.log(`Target  : ${WEBHOOK_TARGET_BASE}?secret=***&event=<event>`)
  console.log(`Auth    : Secret API Key (Basic)`)
  console.log(`Method  : ${WEBHOOK_HTTP_METHOD}`)
  console.log(`Events  : ${WEBHOOK_EVENTS.join(", ")}`)
  console.log("==================================")

  for (const event of WEBHOOK_EVENTS) {
    try {
      await upsertWebhookForEvent(event)
    } catch (err: any) {
      console.error(`✗ Failed for "${event}": ${err?.message || err}`)
    }
  }

  console.log("Done.")
}

main().catch((e) => {
  console.error("Fatal error:", e)
  process.exit(1)
})
