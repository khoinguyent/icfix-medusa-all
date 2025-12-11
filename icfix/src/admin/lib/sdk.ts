import Medusa from "@medusajs/js-sdk"

// Use explicit backend URL if provided, otherwise default to localhost:9000 for development
// or use relative path if served from same origin as backend
const getBaseUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL
  }
  // In development, if admin is on different port, point to backend directly
  if (import.meta.env.DEV) {
    return "http://localhost:9000"
  }
  // In production, use relative path (assumes same origin or nginx proxy)
  return "/"
}

export const sdk = new Medusa({
  baseUrl: getBaseUrl(),
  debug: import.meta.env.DEV,
  auth: {
    type: "session",
  },
})

