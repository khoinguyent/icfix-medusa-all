# Category Filter Issue - Final Summary

## Problem
Filter shows "Components (1)" but no products display.

## Root Causes

### 1. ✅ FIXED - Region Currency
- Region was `eur`, prices are `vnd`
- Fixed: Updated region to `vnd`

### 2. ✅ FIXED - Missing Price Rules  
- Prices didn't have `region_id` rules
- Fixed: Created `price_rule` entries

### 3. ❌ ONGOING - Price Calculation Still Failing
- Only MacBook Air M3 has `calculated_price`
- Other 3 products still have `calculated_price = null`
- MacBook Air shows `currency_code: "eur"` in calculated_price (mismatch!)

## Current Status

- ✅ Backend API returns products correctly
- ✅ Price rules created for VND prices
- ❌ Price calculation still failing for 3 out of 4 products
- ❌ Frontend filters out products without `calculated_price`

## Investigation Needed

MacBook Air M3 works but shows EUR currency in calculated_price, suggesting:
1. MacBook Air might have EUR prices (not VND)
2. Or there's a currency mismatch that's being handled differently
3. Need to verify actual price currencies vs region currency

## Next Steps

1. Verify MacBook Air price currency
2. Ensure all products have prices matching region currency (VND)
3. Or create prices in both currencies
4. Verify price calculation works after currency alignment

## Workaround

Products will show once `calculated_price` is populated. This requires:
- Prices in correct currency (VND for Vietnam region)
- Price rules linking prices to region
- Proper price calculation by Medusa
