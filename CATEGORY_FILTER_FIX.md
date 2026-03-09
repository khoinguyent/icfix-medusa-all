# Category Filter Shows 1 Result But No Products Display - Fix

## Problem Identified

The filter shows "Components (1)" but no products are displayed on the page.

## Root Cause

**Region Currency Mismatch** - The region currency was reverted back to `eur` instead of `vnd`:
- Region "Vietnam" has `currency_code = 'eur'` ❌
- Prices are in `currency_code = 'vnd'` ✅
- When Medusa calculates prices, it can't match prices to the region
- Result: `calculated_price = null`
- Frontend filters out products without `calculated_price`

## Fix Applied

Updated the Vietnam region currency from `eur` to `vnd`:

```sql
UPDATE region
SET currency_code = 'vnd'
WHERE name = 'Vietnam' AND currency_code = 'eur';
```

## Why Products Don't Show

1. ✅ Product exists in Components category
2. ✅ Product is published
3. ✅ Product has prices (in VND)
4. ❌ Region currency doesn't match price currency
5. ❌ Medusa can't calculate price → `calculated_price = null`
6. ❌ Frontend filters out products without `calculated_price`

## Verification

After fix, verify:
```bash
curl "http://localhost:9002/store/products?category_id=8fab8578-835b-4297-8863-6222312ff829&region_id=reg_01KCGBDA1P1WTJY2R492P5TXHV&fields=*variants.calculated_price" \
  -H "x-publishable-api-key: pk_13737202cec30e25288348d6e39038c0daf31e7fe97ade016c988fd266318be0"
```

Expected: `calculated_price` should not be null.

## Next Steps

1. Restart backend to apply region currency fix
2. Verify `calculated_price` is populated
3. Products should now appear on the frontend
