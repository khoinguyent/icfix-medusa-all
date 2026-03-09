# Category Filter Fix - Complete Solution

## Problem Summary
Filter shows "Components (1)" but no products display on the page.

## Root Causes Identified & Fixed

### 1. ✅ Region Currency Mismatch - FIXED
- **Issue**: Region "Vietnam" had `currency_code = 'eur'` but prices are in `vnd`
- **Fix**: Updated region currency to `vnd`

### 2. ✅ Missing Price Rules - FIXED
- **Issue**: Prices didn't have `region_id` rules in `price_rule` table
- **Impact**: Medusa couldn't calculate prices when `region_id` is provided in query
- **Fix**: Created `price_rule` entries linking prices to region `reg_01KCGBDA1P1WTJY2R492P5TXHV`

## Solution Applied

### Step 1: Fix Region Currency
```sql
UPDATE region
SET currency_code = 'vnd'
WHERE name = 'Vietnam' AND currency_code = 'eur';
```

### Step 2: Create Price Rules
```sql
INSERT INTO price_rule (id, price_id, attribute, value, created_at, updated_at)
SELECT 
  gen_random_uuid()::text,
  pr.id,
  'region_id',
  'reg_01KCGBDA1P1WTJY2R492P5TXHV',
  NOW(),
  NOW()
FROM price pr
WHERE pr.deleted_at IS NULL
  AND pr.currency_code = 'vnd'
  AND NOT EXISTS (
    SELECT 1 FROM price_rule prr 
    WHERE prr.price_id = pr.id 
      AND prr.attribute = 'region_id'
      AND prr.deleted_at IS NULL
  );
```

### Step 3: Update Rules Count
```sql
UPDATE price pr
SET rules_count = (
  SELECT COUNT(*) 
  FROM price_rule prr 
  WHERE prr.price_id = pr.id AND prr.deleted_at IS NULL
)
WHERE pr.deleted_at IS NULL
  AND pr.currency_code = 'vnd';
```

## Why Products Weren't Showing

1. ✅ Product exists in Components category
2. ✅ Product is published
3. ✅ Product has prices
4. ✅ Region currency matches (after fix)
5. ❌ **Prices didn't have region_id rules** → Medusa couldn't calculate price
6. ❌ **calculated_price = null** → Frontend filters out products without price

## Frontend Filtering

The frontend code filters out variants without `calculated_price`:
```typescript
.filter((v: any) => !!v.calculated_price)
```

## Verification

After fixes, verify:
```bash
curl "http://localhost:9002/store/products?category_id=8fab8578-835b-4297-8863-6222312ff829&region_id=reg_01KCGBDA1P1WTJY2R492P5TXHV&fields=*variants.calculated_price" \
  -H "x-publishable-api-key: pk_13737202cec30e25288348d6e39038c0daf31e7fe97ade016c988fd266318be0"
```

Expected: `calculated_price` should not be null, and products should appear on the frontend.

## Next Steps

1. ✅ Backend restarted
2. ✅ Frontend restarted
3. ⏳ Verify products appear on storefront
4. ⏳ Test category filtering works correctly
