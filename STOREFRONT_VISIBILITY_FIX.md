# Storefront Visibility Fix - Summary

## Problem Identified

Products were not showing on the storefront despite:
- ✅ Products assigned to sales channel
- ✅ Store location added
- ✅ Products have variants

## Root Causes Found

### 1. Publishable API Key Not Linked to Sales Channel ❌
**Error**: "Publishable key needs to have a sales channel configured"

**Fix Applied**: Linked the publishable API key to the sales channel via `publishable_api_key_sales_channel` table.

### 2. Products Not Published ❌
**Issue**: Products may not have `status = 'published'` or `published_at` set.

**Fix Applied**: Updated all products to `status = 'published'` and set `published_at`.

### 3. Missing Prices ❌
**Issue**: Variants have price set links but no actual prices (still broken from previous issue).

**Status**: Still needs to be fixed - prices are not persisting via SQL inserts.

## Requirements for Storefront Visibility

For products to appear on the storefront, ALL of these must be true:

1. ✅ **Product Status**: `status = 'published'` AND `published_at IS NOT NULL`
2. ✅ **Sales Channel Link**: Product must be linked to a sales channel via `product_sales_channel`
3. ✅ **Publishable API Key**: The API key used in requests must be linked to the sales channel via `publishable_api_key_sales_channel`
4. ✅ **Variants**: Product must have at least one variant
5. ✅ **Price Set Links**: Variants must be linked to price sets via `product_variant_price_set`
6. ❌ **Prices**: Price sets must have prices (currently broken - 0 prices exist)

## Database Tables Involved

- `api_key` - Contains publishable API keys (type = 'publishable')
- `publishable_api_key_sales_channel` - Links API keys to sales channels
- `product` - Products table (needs `status = 'published'` and `published_at`)
- `product_sales_channel` - Links products to sales channels
- `product_variant` - Product variants
- `product_variant_price_set` - Links variants to price sets
- `price_set` - Price sets
- `price` - Actual prices (currently empty)

## Fixes Applied

1. ✅ Linked publishable API key to sales channel
2. ✅ Published all products
3. ✅ Verified products are linked to sales channel
4. ✅ Verified variants have price set links

## Remaining Issue

**Prices**: Despite multiple attempts, prices are not persisting in the database. This will prevent products from showing prices on the storefront, but products should now appear (without prices).

## Next Steps

1. Fix price insertion issue (use Admin API instead of direct SQL)
2. Verify products appear on storefront (they should now, but without prices)
3. Add prices via Admin API or investigate why SQL inserts fail

## Verification

After fixes, verify with:
```bash
curl "http://localhost:9002/store/products?limit=10" \
  -H "x-publishable-api-key: pk_13737202cec30e25288348d6e39038c0daf31e7fe97ade016c988fd266318be0"
```

Expected: Products should appear (but may not have prices).
