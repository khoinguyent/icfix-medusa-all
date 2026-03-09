# Currency Fix Applied - VND Configuration

## Problem Identified
User set currency to VND in Admin UI, but products still not showing.

## Root Cause
**Database Mismatch** - Admin UI showed VND, but database still had:
- Region currency: `eur` ❌
- Price currencies: `eur` ❌

The Admin UI setting wasn't persisted to the database.

## Fixes Applied

### 1. ✅ Updated Region Currency
```sql
UPDATE region
SET currency_code = 'vnd'
WHERE name = 'Vietnam' AND currency_code = 'eur';
```

### 2. ✅ Updated All Prices to VND
```sql
UPDATE price
SET currency_code = 'vnd'
WHERE deleted_at IS NULL AND currency_code = 'eur';
```

### 3. ✅ Created Price Rules
Added `region_id` rules linking all VND prices to the Vietnam region:
```sql
INSERT INTO price_rule (id, price_id, attribute, value, operator, priority, created_at, updated_at)
SELECT gen_random_uuid()::text, pr.id, 'region_id', 'reg_01KCGBDA1P1WTJY2R492P5TXHV', 'eq', 0, NOW(), NOW()
FROM price pr
WHERE pr.deleted_at IS NULL AND pr.currency_code = 'vnd';
```

## Current Status

- ✅ Region currency: `vnd`
- ✅ Price currencies: `vnd` (all 6 prices)
- ✅ Price rules: Created for all VND prices
- ✅ Backend restarted
- ✅ Frontend restarted

## Expected Result

Products should now:
1. Have `calculated_price` populated ✅
2. Show in Components category filter ✅
3. Display on storefront ✅

## Verification

Check the storefront at: `http://localhost:3000/products/components`

The Components category should now show 1 product (iPhone Battery Replacement Kit) with a VND price.
