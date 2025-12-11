import Medusa from "@medusajs/js-sdk"

// For server-side (SSR), try Docker service name first, then fallback to env var or localhost
// For client-side, use the public env var (which will be localhost for browser access)
function getBackendUrl(): string {
  // Server-side: Check if we're in Docker (try service name first)
  if (typeof window === "undefined") {
    // Server-side rendering - try Docker service name first
    if (process.env.MEDUSA_BACKEND_URL) {
      return process.env.MEDUSA_BACKEND_URL
    }
    // Fallback to public env var or default
    return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://medusa-backend:9000"
  }
  // Client-side: use public env var (browser will use localhost)
  return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
}

const MEDUSA_BACKEND_URL = getBackendUrl()

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
