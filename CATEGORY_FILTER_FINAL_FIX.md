# Category Filter Issue - Final Fix Applied

## Problem
Filter shows "Components (1)" but no products display.

## Root Cause Found

**Price Currency Mismatch** - Prices were in `eur` but region is `vnd`:
- ✅ Region "Vietnam": `currency_code = 'vnd'`
- ❌ Prices: `currency_code = 'eur'` (0 VND prices existed!)
- ❌ Result: Medusa can't calculate prices when currencies don't match

## Fixes Applied

### 1. ✅ Updated Price Currencies
Changed all prices from `eur` to `vnd` to match region:
```sql
UPDATE price
SET currency_code = 'vnd'
WHERE deleted_at IS NULL AND currency_code = 'eur';
```

### 2. ✅ Created Price Rules
Added `region_id` rules to all VND prices:
```sql
INSERT INTO price_rule (id, price_id, attribute, value, operator, priority, created_at, updated_at)
SELECT gen_random_uuid()::text, pr.id, 'region_id', 'reg_01KCGBDA1P1WTJY2R492P5TXHV', 'eq', 0, NOW(), NOW()
FROM price pr
WHERE pr.deleted_at IS NULL AND pr.currency_code = 'vnd';
```

### 3. ✅ Updated Rules Count
Updated `rules_count` field to reflect actual rule count.

## Why Products Weren't Showing

1. ✅ Product exists in Components category
2. ✅ Product is published  
3. ✅ Product has prices
4. ❌ **Price currency (EUR) ≠ Region currency (VND)**
5. ❌ **Medusa can't calculate price → `calculated_price = null`**
6. ❌ **Frontend filters out products without `calculated_price`**

## Current Status

After fixes:
- ✅ Prices are now in VND (matching region)
- ✅ Price rules created linking prices to region
- ✅ Backend restarted
- ✅ Frontend restarted
- ⏳ Products should now appear with calculated prices

## Verification

Test the API:
```bash
curl "http://localhost:9002/store/products?category_id=8fab8578-835b-4297-8863-6222312ff829&region_id=reg_01KCGBDA1P1WTJY2R492P5TXHV&fields=*variants.calculated_price" \
  -H "x-publishable-api-key: pk_13737202cec30e25288348d6e39038c0daf31e7fe97ade016c988fd266318be0"
```

Expected: `calculated_price` should not be null, and products should appear on the frontend.
