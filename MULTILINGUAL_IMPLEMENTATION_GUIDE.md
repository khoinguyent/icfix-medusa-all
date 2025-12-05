# Multilingual Implementation Guide for Medusa + Next.js

## Overview
This guide provides a comprehensive approach to implementing multilingual support in your Medusa e-commerce platform, prioritizing the storefront first, then the admin panel.

## 🎯 Implementation Strategy

### Phase 1: Storefront Multilingual (PRIORITY)
### Phase 2: Admin Multilingual
### Phase 3: Backend Data Internationalization

---

## 📦 Phase 1: Storefront Multilingual Implementation

### Why next-intl?
- ✅ **Perfect for Next.js 15 App Router** (your current setup)
- ✅ **Server Component support** out of the box
- ✅ **Type-safe translations**
- ✅ **Automatic locale detection**
- ✅ **Works with your existing `[countryCode]` routing**

### Step 1: Install Dependencies

```bash
cd icfix-storefront
yarn add next-intl
```

### Step 2: Project Structure

Your new structure will look like:
```
icfix-storefront/
├── messages/              # NEW: Translation files
│   ├── en.json
│   ├── vi.json
│   ├── ja.json
│   └── zh.json
├── src/
│   ├── app/
│   │   ├── [locale]/     # RENAME from [countryCode]
│   │   │   └── (all your existing pages)
│   │   └── layout.tsx
│   ├── i18n/             # NEW: i18n configuration
│   │   ├── config.ts
│   │   ├── request.ts
│   │   └── routing.ts
│   └── middleware.ts     # UPDATE: Add locale detection
```

### Step 3: Configuration Files

#### 3.1 Create `src/i18n/config.ts`

```typescript
export type Locale = 'en' | 'vi' | 'ja' | 'zh';

export const locales: Locale[] = ['en', 'vi', 'ja', 'zh'];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
  ja: '日本語',
  zh: '中文',
};

// Map locales to country codes for Medusa regions
export const localeToCountryCode: Record<Locale, string> = {
  en: 'us',
  vi: 'vn',
  ja: 'jp',
  zh: 'cn',
};

// Map country codes to locales
export const countryCodeToLocale: Record<string, Locale> = {
  us: 'en',
  vn: 'vi',
  jp: 'ja',
  cn: 'zh',
  // Add more mappings as needed
};
```

#### 3.2 Create `src/i18n/request.ts`

```typescript
import {getRequestConfig} from 'next-intl/server';
import {locales} from './config';

export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid
  if (!locale || !locales.includes(locale as any)) {
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
```

#### 3.3 Create `src/i18n/routing.ts`

```typescript
import {defineRouting} from 'next-intl/routing';
import {locales, defaultLocale} from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always', // Always show locale in URL
  pathnames: {
    '/': '/',
    '/cart': '/cart',
    '/products': '/products',
    '/collections': '/collections',
    // Add more pathnames as needed
  }
});
```

### Step 4: Update Next.js Configuration

Update `icfix-storefront/next.config.js`:

```javascript
const checkEnvVariables = require("./check-env-variables")
const createNextIntlPlugin = require('next-intl/plugin');

checkEnvVariables()

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "icfix-medusa-all.vercel.app",
      },
    ],
  },
}

module.exports = withNextIntl(nextConfig)
```

### Step 5: Update Middleware

Update `src/middleware.ts` to handle both locales and regions:

```typescript
import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { countryCodeToLocale, localeToCountryCode } from './i18n/config';

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

export async function middleware(request: NextRequest) {
  // Handle non-GET/HEAD requests
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next()
  }

  // Check if this is a static asset
  const urlPath = request.nextUrl.pathname
  if (urlPath.includes(".")) {
    return NextResponse.next()
  }

  // Get cache ID
  let cacheIdCookie = request.cookies.get("_medusa_cache_id")
  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  // Get region map
  const regionMap = await getRegionMap(cacheId)

  // Extract locale from URL (next-intl will handle this)
  const locale = request.nextUrl.pathname.split("/")[1]
  
  // Determine country code based on locale
  const countryCode = localeToCountryCode[locale as keyof typeof localeToCountryCode] || DEFAULT_REGION

  // Set cookies for Medusa
  const response = intlMiddleware(request)
  
  if (response && !cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })
  }

  if (response && countryCode) {
    response.cookies.set("_medusa_country_code", countryCode, {
      maxAge: 60 * 60 * 24,
    })
  }

  return response || NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
```

### Step 6: Update Root Layout

Update `src/app/layout.tsx`:

```typescript
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';

export default async function RootLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Step 7: Create Translation Files

Create `messages/en.json`:

```json
{
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "add_to_cart": "Add to Cart",
    "remove": "Remove",
    "checkout": "Checkout",
    "continue_shopping": "Continue Shopping",
    "subtotal": "Subtotal",
    "total": "Total",
    "shipping": "Shipping",
    "tax": "Tax"
  },
  "navigation": {
    "home": "Home",
    "products": "Products",
    "collections": "Collections",
    "cart": "Cart",
    "account": "Account",
    "sign_in": "Sign In",
    "sign_out": "Sign Out"
  },
  "product": {
    "details": "Product Details",
    "price": "Price",
    "in_stock": "In Stock",
    "out_of_stock": "Out of Stock",
    "select_variant": "Select Variant",
    "quantity": "Quantity"
  },
  "cart": {
    "title": "Shopping Cart",
    "empty": "Your cart is empty",
    "item_count": "{count, plural, =0 {No items} =1 {1 item} other {# items}}",
    "remove_item": "Remove item"
  },
  "checkout": {
    "title": "Checkout",
    "shipping_address": "Shipping Address",
    "billing_address": "Billing Address",
    "payment_method": "Payment Method",
    "place_order": "Place Order",
    "order_summary": "Order Summary"
  },
  "account": {
    "title": "My Account",
    "orders": "Orders",
    "addresses": "Addresses",
    "profile": "Profile",
    "order_history": "Order History",
    "order_details": "Order Details",
    "order_number": "Order #",
    "order_date": "Order Date",
    "order_status": "Status"
  },
  "footer": {
    "about": "About Us",
    "contact": "Contact",
    "terms": "Terms of Sale",
    "privacy": "Privacy Policy"
  }
}
```

Create `messages/vi.json`:

```json
{
  "common": {
    "loading": "Đang tải...",
    "error": "Đã xảy ra lỗi",
    "add_to_cart": "Thêm vào giỏ",
    "remove": "Xóa",
    "checkout": "Thanh toán",
    "continue_shopping": "Tiếp tục mua sắm",
    "subtotal": "Tạm tính",
    "total": "Tổng cộng",
    "shipping": "Phí vận chuyển",
    "tax": "Thuế"
  },
  "navigation": {
    "home": "Trang chủ",
    "products": "Sản phẩm",
    "collections": "Bộ sưu tập",
    "cart": "Giỏ hàng",
    "account": "Tài khoản",
    "sign_in": "Đăng nhập",
    "sign_out": "Đăng xuất"
  },
  "product": {
    "details": "Chi tiết sản phẩm",
    "price": "Giá",
    "in_stock": "Còn hàng",
    "out_of_stock": "Hết hàng",
    "select_variant": "Chọn phiên bản",
    "quantity": "Số lượng"
  },
  "cart": {
    "title": "Giỏ hàng",
    "empty": "Giỏ hàng của bạn đang trống",
    "item_count": "{count, plural, =0 {Không có sản phẩm} =1 {1 sản phẩm} other {# sản phẩm}}",
    "remove_item": "Xóa sản phẩm"
  },
  "checkout": {
    "title": "Thanh toán",
    "shipping_address": "Địa chỉ giao hàng",
    "billing_address": "Địa chỉ thanh toán",
    "payment_method": "Phương thức thanh toán",
    "place_order": "Đặt hàng",
    "order_summary": "Tóm tắt đơn hàng"
  },
  "account": {
    "title": "Tài khoản của tôi",
    "orders": "Đơn hàng",
    "addresses": "Địa chỉ",
    "profile": "Hồ sơ",
    "order_history": "Lịch sử đơn hàng",
    "order_details": "Chi tiết đơn hàng",
    "order_number": "Đơn hàng #",
    "order_date": "Ngày đặt",
    "order_status": "Trạng thái"
  },
  "footer": {
    "about": "Về chúng tôi",
    "contact": "Liên hệ",
    "terms": "Điều khoản bán hàng",
    "privacy": "Chính sách bảo mật"
  }
}
```

### Step 8: Create Language Switcher Component

Create `src/modules/common/components/language-switcher/index.tsx`:

```typescript
'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useRouter, usePathname} from 'next/navigation';
import {locales, localeNames, type Locale} from '@/i18n/config';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');

  const handleLocaleChange = (newLocale: Locale) => {
    // Replace the current locale in the pathname with the new one
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPathname = segments.join('/');
    
    router.push(newPathname);
  };

  return (
    <div className="relative inline-block">
      <select
        value={locale}
        onChange={(e) => handleLocaleChange(e.target.value as Locale)}
        className="appearance-none bg-transparent border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc]}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}
```

### Step 9: Usage in Components

#### Server Component Example:

```typescript
import {useTranslations} from 'next-intl';

export default function ProductPage() {
  const t = useTranslations('product');
  
  return (
    <div>
      <h1>{t('details')}</h1>
      <button>{t('add_to_cart')}</button>
    </div>
  );
}
```

#### Client Component Example:

```typescript
'use client';

import {useTranslations} from 'next-intl';

export default function AddToCartButton() {
  const t = useTranslations('common');
  
  return (
    <button onClick={() => console.log('Add to cart')}>
      {t('add_to_cart')}
    </button>
  );
}
```

### Step 10: Refactoring Checklist

To complete the storefront multilingual implementation, you need to:

1. **Rename folder**: `[countryCode]` → `[locale]`
2. **Update all imports**: Replace references to `countryCode` with `locale` where appropriate
3. **Add translations**: Wrap all hardcoded strings with `t()` function
4. **Add language switcher**: Add `<LanguageSwitcher />` to your header/navigation
5. **Handle Medusa product data**: Create translation logic for product names, descriptions (see below)

### Step 11: Handling Medusa Product Translations

Since Medusa products come from the backend, you have two approaches:

#### Approach A: Use Medusa's metadata field

Store translations in product metadata:

```typescript
// In your product data fetching
const product = {
  ...productData,
  title: productData.metadata?.translations?.[locale]?.title || productData.title,
  description: productData.metadata?.translations?.[locale]?.description || productData.description,
};
```

#### Approach B: Create a translation helper

Create `src/lib/utils/translate-product.ts`:

```typescript
import { Locale } from '@/i18n/config';

// Translation mapping for product data
const productTranslations: Record<string, Record<Locale, any>> = {
  // Add your product translations here
  // Example:
  // 'product-id-123': {
  //   en: { title: 'iPhone 17 Pro', description: '...' },
  //   vi: { title: 'iPhone 17 Pro', description: '...' }
  // }
};

export function translateProduct(product: any, locale: Locale) {
  const translation = productTranslations[product.id]?.[locale];
  
  if (translation) {
    return {
      ...product,
      title: translation.title || product.title,
      description: translation.description || product.description,
    };
  }
  
  return product;
}
```

---

## 🛠️ Phase 2: Admin Multilingual Implementation

### Overview

The Medusa Admin dashboard can be customized to support multiple languages through custom UI components and widgets.

### Step 1: Install Dependencies (Backend)

```bash
cd icfix
yarn add i18next react-i18next
```

### Step 2: Create Admin Translation Files

Create `icfix/src/admin/i18n/`:

```
icfix/src/admin/i18n/
├── en.json
├── vi.json
└── config.ts
```

**File: `icfix/src/admin/i18n/en.json`**

```json
{
  "admin": {
    "products": {
      "title": "Products",
      "add_product": "Add Product",
      "edit_product": "Edit Product",
      "delete_product": "Delete Product"
    },
    "orders": {
      "title": "Orders",
      "order_details": "Order Details",
      "pending": "Pending",
      "completed": "Completed"
    }
  }
}
```

**File: `icfix/src/admin/i18n/vi.json`**

```json
{
  "admin": {
    "products": {
      "title": "Sản phẩm",
      "add_product": "Thêm sản phẩm",
      "edit_product": "Chỉnh sửa sản phẩm",
      "delete_product": "Xóa sản phẩm"
    },
    "orders": {
      "title": "Đơn hàng",
      "order_details": "Chi tiết đơn hàng",
      "pending": "Đang chờ",
      "completed": "Hoàn thành"
    }
  }
}
```

### Step 3: Configure i18n for Admin

**File: `icfix/src/admin/i18n/config.ts`**

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import vi from './vi.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### Step 4: Create Admin Language Switcher Widget

**File: `icfix/src/admin/widgets/language-switcher.tsx`**

```typescript
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useTranslation } from 'react-i18next'
import '../i18n/config'

const LanguageSwitcherWidget = () => {
  const { i18n } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('admin-language', lng)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded ${i18n.language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('vi')}
        className={`px-3 py-1 rounded ${i18n.language === 'vi' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        VI
      </button>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "header.right",
})

export default LanguageSwitcherWidget
```

---

## 📊 Phase 3: Backend Data Internationalization

### Using Medusa's Metadata for Translations

For product names, descriptions, and other content that needs translation:

### Step 1: Add Translation Fields via API

```typescript
// Example: Updating a product with translations
await medusa.admin.products.update(productId, {
  metadata: {
    translations: {
      en: {
        title: "iPhone 17 Pro",
        description: "The latest iPhone with amazing features",
      },
      vi: {
        title: "iPhone 17 Pro",
        description: "iPhone mới nhất với nhiều tính năng tuyệt vời",
      },
      ja: {
        title: "iPhone 17 Pro",
        description: "素晴らしい機能を備えた最新のiPhone",
      },
      zh: {
        title: "iPhone 17 Pro",
        description: "具有惊人功能的最新iPhone",
      }
    }
  }
});
```

### Step 2: Create Helper Functions

**File: `icfix-storefront/src/lib/util/i18n-data.ts`**

```typescript
import { Locale } from '@/i18n/config';

export function getTranslatedField(
  data: any,
  field: string,
  locale: Locale,
  fallback: string = ''
): string {
  // Check if translations exist in metadata
  if (data?.metadata?.translations?.[locale]?.[field]) {
    return data.metadata.translations[locale][field];
  }

  // Fallback to original field
  return data?.[field] || fallback;
}

export function translateProductData(product: any, locale: Locale) {
  return {
    ...product,
    title: getTranslatedField(product, 'title', locale, product.title),
    description: getTranslatedField(product, 'description', locale, product.description),
    // Add more fields as needed
  };
}
```

### Step 3: Use in Your Storefront

```typescript
import { translateProductData } from '@/lib/util/i18n-data';
import { useLocale } from 'next-intl';

export default function ProductCard({ product }) {
  const locale = useLocale();
  const translatedProduct = translateProductData(product, locale);

  return (
    <div>
      <h2>{translatedProduct.title}</h2>
      <p>{translatedProduct.description}</p>
    </div>
  );
}
```

---

## 🎨 Best Practices

### 1. **Organize Translation Keys**
- Use nested structure for better organization
- Keep keys consistent across languages
- Use descriptive key names

### 2. **Handle Missing Translations**
- Always provide fallback values
- Log missing translation keys in development
- Use English as the default fallback

### 3. **SEO Considerations**
- Use `<html lang={locale}>` in root layout
- Add `hreflang` tags for different language versions
- Create locale-specific sitemaps

### 4. **Performance**
- Lazy load translations when possible
- Cache translations
- Use server components for better performance

### 5. **Testing**
- Test all languages regularly
- Check for text overflow in different languages
- Verify number, date, and currency formatting

---

## 🚀 Migration Steps from [countryCode] to [locale]

### Step-by-Step Migration:

1. **Backup your code** (git commit)

2. **Install next-intl**:
   ```bash
   cd icfix-storefront
   yarn add next-intl
   ```

3. **Create configuration files**:
   - `src/i18n/config.ts`
   - `src/i18n/request.ts`
   - `src/i18n/routing.ts`

4. **Create translation files**:
   - `messages/en.json`
   - `messages/vi.json`
   - Add more languages as needed

5. **Update Next.js config**:
   - Add next-intl plugin to `next.config.js`

6. **Update middleware**:
   - Integrate next-intl middleware with your existing region logic

7. **Rename folder**:
   ```bash
   cd src/app
   mv [countryCode] [locale]
   ```

8. **Update all components**:
   - Replace hardcoded strings with `t()` calls
   - Import and use `useTranslations` hook

9. **Add language switcher**:
   - Create `<LanguageSwitcher />` component
   - Add to navigation/header

10. **Test thoroughly**:
    - Test all routes in all languages
    - Verify Medusa integration still works
    - Check cart, checkout, and order flows

---

## 📝 Quick Implementation Checklist

### Storefront (Priority)
- [ ] Install next-intl
- [ ] Create i18n configuration
- [ ] Create translation files (en.json, vi.json)
- [ ] Update middleware
- [ ] Rename [countryCode] to [locale]
- [ ] Update root layout
- [ ] Create language switcher component
- [ ] Translate all UI strings
- [ ] Handle Medusa product translations
- [ ] Test all pages and flows

### Admin
- [ ] Install i18next and react-i18next
- [ ] Create admin translation files
- [ ] Configure i18n
- [ ] Create language switcher widget
- [ ] Translate admin UI strings
- [ ] Test admin functionality

### Backend Data
- [ ] Design translation structure
- [ ] Add translation fields to products
- [ ] Create helper functions
- [ ] Update API responses
- [ ] Test data retrieval

---

## 🔗 Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Medusa Documentation](https://docs.medusajs.com/)
- [i18next Documentation](https://www.i18next.com/)
- [React i18next Documentation](https://react.i18next.com/)

---

## 💡 Tips

1. **Start Small**: Begin with high-traffic pages (home, products, cart)
2. **Incremental Approach**: Don't try to translate everything at once
3. **User Feedback**: Get native speakers to review translations
4. **Content Strategy**: Decide which content needs translation (UI vs. product data)
5. **Automated Translation**: Consider tools like DeepL API for initial translations
6. **Version Control**: Keep translation files in git for tracking changes

---

## 🚨 Common Issues and Solutions

### Issue: Locale not detected correctly
**Solution**: Check middleware order and locale extraction logic

### Issue: Translations not loading
**Solution**: Verify JSON syntax and file paths

### Issue: Build errors with next-intl
**Solution**: Ensure TypeScript types are correctly configured

### Issue: Mixed country codes and locales
**Solution**: Use mapping functions to convert between the two

---

This guide provides a comprehensive approach to implementing multilingual support. Start with Phase 1 (Storefront), then move to Phase 2 (Admin) when ready. Each phase can be implemented independently.

