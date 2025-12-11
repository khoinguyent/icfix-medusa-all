# 🌍 Separating Country and Language

## Overview

This guide shows how to separate **country/region** (for pricing, shipping) from **language** (for UI display).

**Example**: User in Vietnam (VN region) viewing the site in Japanese (ja language)
- URL: `http://localhost:3000/ja` (language)
- Region: VN (stored in cookie/state)
- UI: Japanese
- Prices: Vietnamese Dong (VND)
- Shipping: Vietnam options

---

## 🏗️ Architecture

### Current Implementation
```
URL: /vi → Language: Vietnamese, Region: VN
URL: /ja → Language: Japanese, Region: JP
```

### New Implementation
```
URL: /ja → Language: Japanese, Region: Selected by user (VN, JP, etc.)
Cookie: _medusa_country_code → VN
UI Language: Japanese
Prices/Shipping: Vietnam (VN)
```

---

## 📝 Implementation Steps

### Step 1: Update i18n Configuration

Update `src/i18n/config.ts` to separate locale from country:

```typescript
export type Locale = 'en' | 'vi' | 'ja' | 'zh';
export type CountryCode = 'us' | 'vn' | 'jp' | 'cn' | 'au' | 'gb' | 'sg' | 'th';

export const locales: Locale[] = ['en', 'vi', 'ja', 'zh'];

export const defaultLocale: Locale = 'en';
export const defaultCountry: CountryCode = 'vn';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
  ja: '日本語',
  zh: '中文',
};

export const countryNames: Record<CountryCode, string> = {
  us: 'United States',
  vn: 'Vietnam',
  jp: 'Japan',
  cn: 'China',
  au: 'Australia',
  gb: 'United Kingdom',
  sg: 'Singapore',
  th: 'Thailand',
};

// Remove the strict mapping - language is now independent
// Users can select any country regardless of language
export const availableCountries: CountryCode[] = [
  'vn', 'jp', 'cn', 'us', 'au', 'gb', 'sg', 'th'
];
```

### Step 2: Update Middleware

Update `src/middleware.ts` to handle country separately:

```typescript
import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { defaultCountry, availableCountries } from './i18n/config';

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
 * Middleware to handle locale and region selection SEPARATELY
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

  // Get country code from cookie (independent of language)
  let countryCodeCookie = request.cookies.get("_medusa_country_code")
  let countryCode = countryCodeCookie?.value

  // If no country code in cookie, try to detect from IP or use default
  if (!countryCode) {
    // Try Vercel geo-location
    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }
  }

  // Validate country code
  if (countryCode && !regionMap.has(countryCode)) {
    countryCode = DEFAULT_REGION
  }

  // Run next-intl middleware for language handling
  const response = intlMiddleware(request)
  
  // Set cookies (country is now independent of language)
  if (response && !cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
      path: '/',
    })
  }

  if (response && countryCode) {
    response.cookies.set("_medusa_country_code", countryCode, {
      maxAge: 60 * 60 * 24 * 365, // 1 year (user's preference)
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
```

### Step 3: Create Country Selector Component

Create `src/modules/common/components/country-selector/index.tsx`:

```typescript
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { countryNames, type CountryCode, availableCountries } from '@/i18n/config';
import { clx } from '@medusajs/ui';
import Cookies from 'js-cookie';

export default function CountrySelector() {
  const t = useTranslations('country_select');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // Get current country from cookie
  const currentCountry = (Cookies.get('_medusa_country_code') || 'vn') as CountryCode;

  const handleCountryChange = (newCountry: CountryCode) => {
    if (newCountry === currentCountry) {
      setIsOpen(false);
      return;
    }

    // Set country cookie
    Cookies.set('_medusa_country_code', newCountry, {
      expires: 365,
      path: '/',
    });
    
    startTransition(() => {
      // Refresh the page to load new region data
      router.refresh();
      setIsOpen(false);
    });
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clx(
          "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md",
          "hover:bg-neutral-100 transition-colors",
          "border border-neutral-200",
          isPending && "opacity-50 cursor-wait"
        )}
        disabled={isPending}
      >
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <span className="hidden sm:inline">{countryNames[currentCountry]}</span>
        <span className="inline sm:hidden">{currentCountry.toUpperCase()}</span>
        <svg 
          className={clx(
            "w-4 h-4 transition-transform",
            isOpen && "rotate-180"
          )} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1" role="menu">
              <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase">
                {t('title')}
              </div>
              {availableCountries.map((country) => (
                <button
                  key={country}
                  onClick={() => handleCountryChange(country)}
                  className={clx(
                    "block w-full text-left px-4 py-2 text-sm transition-colors",
                    currentCountry === country 
                      ? "bg-neutral-100 text-neutral-900 font-medium" 
                      : "text-neutral-700 hover:bg-neutral-50"
                  )}
                  role="menuitem"
                >
                  <div className="flex items-center justify-between">
                    <span>{countryNames[country]}</span>
                    {currentCountry === country && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

### Step 4: Install js-cookie

```bash
cd icfix-storefront
yarn add js-cookie
yarn add -D @types/js-cookie
```

### Step 5: Update Navigation to Include Both Selectors

Update `src/modules/layout/templates/nav/index.tsx`:

```typescript
import LanguageSwitcher from "@modules/common/components/language-switcher"
import CountrySelector from "@modules/common/components/country-selector"

// ... in the render:

<div className="flex justify-end items-center gap-2">
  <SearchInput />

  <div className="h-4 w-px bg-neutral-300" />

  {/* Country Selector */}
  <CountrySelector />

  <div className="h-4 w-px bg-neutral-300" />

  {/* Language Switcher */}
  <LanguageSwitcher />

  <div className="h-4 w-px bg-neutral-300" />

  <Suspense fallback={<SkeletonAccountButton />}>
    <AccountButton customer={customer} />
  </Suspense>

  <Suspense fallback={<SkeletonCartButton />}>
    <CartButton />
  </Suspense>
</div>
```

### Step 6: Update Translation Files

Add country selector translations to `messages/en.json`:

```json
{
  "country_select": {
    "title": "Select Your Country",
    "shipping_to": "Shipping to",
    "change_country": "Change country"
  }
}
```

---

## 🎯 Usage Examples

### Example 1: Japanese UI in Vietnam Store
```
URL: http://localhost:3000/ja
Cookie: _medusa_country_code=vn
Result: 
  - UI language: Japanese (日本語)
  - Prices: Vietnamese Dong (₫)
  - Shipping: Vietnam options
  - Region: Vietnam
```

### Example 2: English UI in Japan Store
```
URL: http://localhost:3000/en
Cookie: _medusa_country_code=jp
Result:
  - UI language: English
  - Prices: Japanese Yen (¥)
  - Shipping: Japan options
  - Region: Japan
```

### Example 3: Vietnamese UI in Singapore Store
```
URL: http://localhost:3000/vi
Cookie: _medusa_country_code=sg
Result:
  - UI language: Vietnamese (Tiếng Việt)
  - Prices: Singapore Dollar (S$)
  - Shipping: Singapore options
  - Region: Singapore
```

---

## 🔄 User Flow

1. **User visits site**: `http://localhost:3000/en`
2. **Auto-detect country**: From IP (Vercel geo) or use default
3. **User can change language**: Click language switcher → URL changes to `/ja`
4. **User can change country**: Click country selector → Cookie updates, page refreshes
5. **Preferences saved**: 
   - Language in URL (can share link)
   - Country in cookie (persists for 1 year)

---

## 🎨 UI Layout

```
Navigation Bar:
┌─────────────────────────────────────────────────────────┐
│ Logo  Products  Collections                              │
│                    [🌍 Vietnam ▼] [🌐 日本語 ▼] 👤 🛒 │
└─────────────────────────────────────────────────────────┘

When clicked:
┌──────────────────┐
│ SELECT COUNTRY   │
├──────────────────┤
│ ✓ Vietnam        │
│   Japan          │
│   China          │
│   United States  │
│   Australia      │
└──────────────────┘

┌──────────────────┐
│ English          │
│ Tiếng Việt       │
│ ✓ 日本語         │
│ 中文             │
└──────────────────┘
```

---

## 📊 Data Flow

### Current: Coupled
```
URL: /vi → Locale: vi → Country: vn → Region: VN
```

### New: Decoupled
```
URL: /ja → Locale: ja (UI language)
Cookie: vn → Country: vn (pricing/shipping)
Region API Call → Region: VN (Medusa region)
```

---

## ✅ Benefits

1. **Flexibility**: Users choose language and country independently
2. **Better UX**: Expats can shop in their home country using their preferred language
3. **SEO**: Language in URL for better indexing
4. **Persistence**: Country preference saved in cookie
5. **Shareable**: URLs contain language, recipients auto-detect country

---

## 🔍 Testing

### Test Scenario 1: Japanese UI, Vietnam Store
```bash
# 1. Open browser
# 2. Go to: http://localhost:3000/ja
# 3. UI should be in Japanese
# 4. Open country selector, select Vietnam
# 5. Prices should be in VND
# 6. Language stays Japanese
```

### Test Scenario 2: Switch Country Without Changing Language
```bash
# 1. Start at: http://localhost:3000/en (Vietnam)
# 2. Change country to Japan
# 3. Page refreshes
# 4. URL stays: /en
# 5. Prices change to JPY
```

### Test Scenario 3: Share URL
```bash
# 1. User A at: http://localhost:3000/ja (country: VN)
# 2. User A shares URL with User B
# 3. User B opens: http://localhost:3000/ja
# 4. User B sees Japanese UI
# 5. User B's country auto-detected (or uses default)
```

---

## 🚀 Implementation Checklist

- [ ] Update `src/i18n/config.ts` - Add country types and lists
- [ ] Update `src/middleware.ts` - Separate country from locale
- [ ] Install `js-cookie` package
- [ ] Create `CountrySelector` component
- [ ] Update navigation to include both selectors
- [ ] Add country selector translations
- [ ] Test all combinations
- [ ] Update documentation

---

## 🎯 Advanced: URL-Based Country (Optional)

If you want country in URL instead of cookie:

### URL Structure: `/{country}/{locale}`
```
/vn/ja → Country: Vietnam, Language: Japanese
/jp/en → Country: Japan, Language: English
/us/vi → Country: USA, Language: Vietnamese
```

This requires restructuring routes:
```
src/app/[country]/[locale]/...
```

**Pros**: Both preferences in URL (shareable)
**Cons**: More complex routing, longer URLs

---

## 📝 Summary

With this implementation:
- ✅ **Language**: In URL (`/en`, `/vi`, `/ja`, `/zh`)
- ✅ **Country**: In cookie (`_medusa_country_code`)
- ✅ **Independent**: Change one without affecting the other
- ✅ **Persistent**: Country preference saved for 1 year
- ✅ **User-friendly**: Two separate selectors in navigation

Users can now shop in any country using any language! 🌍🗣️

