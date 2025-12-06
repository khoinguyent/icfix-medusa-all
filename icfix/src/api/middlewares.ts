import { defineMiddlewares } from "@medusajs/framework/http"
import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http"

/**
 * CORS middleware to handle preflight OPTIONS requests for admin routes
 * This ensures Access-Control-Allow-Origin header is present in OPTIONS responses
 */
async function corsMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const origin = req.headers.origin
  const adminCors = process.env.ADMIN_CORS || ""
  const allowedOrigins = adminCors.split(",").map((o) => o.trim())

  // Handle OPTIONS preflight requests
  if (req.method === "OPTIONS") {
    // Check if origin is allowed
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin)
      res.setHeader("Access-Control-Allow-Credentials", "true")
      
      // Add Access-Control-Allow-Methods if not already set
      if (!res.getHeader("Access-Control-Allow-Methods")) {
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        )
      }
      
      // Add Access-Control-Allow-Headers if requested
      const requestedHeaders = req.headers["access-control-request-headers"]
      if (requestedHeaders) {
        res.setHeader("Access-Control-Allow-Headers", requestedHeaders)
      } else {
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, Baggage, Sentry-Trace"
        )
      }
    }
    
    // Return 204 for OPTIONS
    return res.sendStatus(204)
  }

  // For non-OPTIONS requests, add CORS headers if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
  }

  next()
}

export default defineMiddlewares({
  routes: [
    {
      // Apply to all /admin routes (including /auth routes used by admin)
      matcher: /^\/(admin|auth).*/,
      middlewares: [corsMiddleware],
    },
  ],
})

