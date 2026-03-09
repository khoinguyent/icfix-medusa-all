#!/usr/bin/env ts-node
/**
 * Add prices to product variants using Medusa Admin API
 * This script uses the Admin API to properly create prices for variants
 */

import axios from 'axios'

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9002'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@icfix.vn'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

interface VariantPrice {
  variant_id: string
  sku: string
  amount: number
  currency_code: string
}

const VARIANT_PRICES: VariantPrice[] = [
  {
    variant_id: 'dfd33cb6-83e5-49ec-a82a-fc59d71ce90a',
    sku: 'IPHONE15PRO-128-NAT',
    amount: 28900000,
    currency_code: 'vnd',
  },
  {
    variant_id: '84df59d3-ad1e-4bd8-a2d8-bab9a3613522',
    sku: 'CHARGER67W-ONLY',
    amount: 890000,
    currency_code: 'vnd',
  },
  {
    variant_id: 'e8b58a38-765d-41de-a78c-97437262cc8e',
    sku: 'MBA-M3-8-256-MID',
    amount: 27900000,
    currency_code: 'vnd',
  },
  {
    variant_id: '2ee552b3-f1d9-474d-9186-3dd50b73d2ee',
    sku: 'BATTERY-IP13',
    amount: 890000,
    currency_code: 'vnd',
  },
]

async function login() {
  try {
    const response = await axios.post(`${BACKEND_URL}/auth/user/emailpass`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    })
    return response.headers['set-cookie']?.[0] || null
  } catch (error: any) {
    console.error('Login failed:', error.response?.data || error.message)
    throw error
  }
}

async function updateVariantPrice(
  variantId: string,
  prices: Array<{ currency_code: string; amount: number }>,
  cookie: string
) {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/admin/products/*/variants/${variantId}`,
      { prices },
      {
        headers: {
          Cookie: cookie,
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  } catch (error: any) {
    console.error(
      `Failed to update variant ${variantId}:`,
      error.response?.data || error.message
    )
    throw error
  }
}

async function main() {
  console.log('🔐 Logging in...')
  const cookie = await login()
  if (!cookie) {
    console.error('❌ Failed to get authentication cookie')
    process.exit(1)
  }
  console.log('✅ Logged in successfully')

  console.log('\n💰 Adding prices to variants...')
  for (const variantPrice of VARIANT_PRICES) {
    try {
      console.log(
        `  Adding price to ${variantPrice.sku} (${variantPrice.amount} ${variantPrice.currency_code})...`
      )
      await updateVariantPrice(
        variantPrice.variant_id,
        [
          {
            currency_code: variantPrice.currency_code,
            amount: variantPrice.amount,
          },
        ],
        cookie
      )
      console.log(`  ✅ ${variantPrice.sku} - Price added`)
    } catch (error: any) {
      console.error(`  ❌ ${variantPrice.sku} - Failed:`, error.message)
    }
  }

  console.log('\n✅ Done!')
}

main().catch(console.error)
