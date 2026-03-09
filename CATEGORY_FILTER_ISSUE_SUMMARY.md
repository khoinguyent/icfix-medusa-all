# Category Filter Shows 1 Result But No Products Display - Complete Analysis

## Problem
The filter shows "Components (1)" indicating 1 product exists, but no products are displayed on the page.

## Root Cause Analysis

### Issue 1: ✅ FIXED - Region Currency Mismatch
- Region "Vietnam" had `currency_code = 'eur'` but prices are in `vnd`
- **Fix Applied**: Updated region currency to `vnd`

### Issue 2: ❌ STILL BROKEN - Missing Calculated Prices
- Only 1 out of 4 products has `calculated_price` (MacBook Air M3)
- Other 3 products (including Components category product) have `calculated_price = null`
- **Impact**: Frontend filters out products without `calculated_price`

## Why Products Don't Show

1. ✅ Product exists in Components category
2. ✅ Product is published
3. ✅ Product has prices (in VND)
4. ✅ Region currency matches price currency (after fix)
5. ❌ **Medusa can't calculate price → `calculated_price = null`**
6. ❌ **Frontend filters out products without `calculated_price`**

## Frontend Filtering Logic

The frontend code (`get-product-price.ts`) filters out variants without `calculated_price`:

```typescript
.filter((v: any) => !!v.calculated_price)
```

This means products without `calculated_price` are excluded from display.

## Current Status

- ✅ Backend API returns 1 product for Components category
- ❌ Product variant has `calculated_price = null`
- ❌ Frontend filters out products without calculated_price
- ❌ Result: Filter shows count but no products display

## Attempted Fixes

1. ✅ Fixed region currency (eur → vnd)
2. ✅ Added region_id rules to prices (in raw_amount JSON)
3. ❌ Still `calculated_price = null`

## Next Steps

1. Investigate why MacBook Air M3 has calculated_price but others don't
2. Check if prices need to be created via Admin API instead of direct SQL
3. Verify price calculation requirements in Medusa v2
4. Consider using Admin API to recreate prices properly

## Workaround

Products will show once `calculated_price` is populated. This requires fixing the price calculation issue.
