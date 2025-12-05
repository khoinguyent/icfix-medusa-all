import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { countryCodeToLocale, localeToCountryCode, defaultLocale } from './i18n/config';

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "vn"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

function getFallbackRegionMap(): Map<string, HttpTypes.StoreRegion> {
  const map = new Map<string, HttpTypes.StoreRegion>()
  map.set(DEFAULT_REGION, {
    id: "vn-region",
    name: "Vietnam",
    countries: [
      { iso_2: DEFAULT_REGION, iso_3: "VNM", name: "Vietnam", num_code: "704" } as any,
    ],
    currency_code: "vnd",
    tax_rate: 0,
    tax_code: null,
    gift_cards_taxable: true,
    automatic_taxes: false,
    countries_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    metadata: null,
    payment_providers: [],
    fulfillment_providers: [],
  } as any)
  return map
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    if (!BACKEND_URL) {
      regionMapCache.regionMap = getFallbackRegionMap()
      regionMapCache.regionMapUpdated = Date.now()
      return regionMapCache.regionMap
    }

    try {
      const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_API_KEY!,
        },
        next: {
          revalidate: 3600,
          tags: [`regions-${cacheId}`],
        },
        cache: "force-cache",
      }).then(async (response) => {
        const json = await response.json()
        if (!response.ok) {
          throw new Error(json.message)
        }
        return json
      })

      if (!regions?.length) {
        regionMapCache.regionMap = getFallbackRegionMap()
      } else {
        const nextMap = new Map<string, HttpTypes.StoreRegion>()
        regions.forEach((region: HttpTypes.StoreRegion) => {
          region.countries?.forEach((c) => {
            nextMap.set(c.iso_2 ?? "", region)
          })
        })
        regionMapCache.regionMap = nextMap
      }
    } catch (e) {
      regionMapCache.regionMap = getFallbackRegionMap()
    }

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

/**
 * Middleware to handle locale and region selection
 */
export async function middleware(request: NextRequest) {
  // Handle non-GET/HEAD requests
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next()
  }

  // Check if this is a static asset
  const urlPath = request.nextUrl.pathname
  if (urlPath.includes(".") || urlPath.startsWith("/_next")) {
    return NextResponse.next()
  }

  // Get cache ID
  let cacheIdCookie = request.cookies.get("_medusa_cache_id")
  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  // Get region map
  const regionMap = await getRegionMap(cacheId)

  // Extract locale from URL (first segment after /)
  const segments = urlPath.split('/').filter(Boolean)
  const locale = segments[0]
  
  // Determine country code based on locale
  const countryCode = localeToCountryCode[locale as keyof typeof localeToCountryCode] || DEFAULT_REGION

  // Run next-intl middleware
  const response = intlMiddleware(request)
  
  // Set Medusa-related cookies
  if (response && !cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
      path: '/',
    })
  }

  if (response && countryCode) {
    response.cookies.set("_medusa_country_code", countryCode, {
      maxAge: 60 * 60 * 24,
      path: '/',
    })
  }

  return response || NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)",
  ],
}
