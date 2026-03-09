# Storefront Visibility Issue - Complete Analysis

## Problem
Products are not showing on the storefront despite:
- ✅ Products assigned to sales channel
- ✅ Store location added
- ✅ Products have variants

## Root Causes Identified

### 1. ✅ FIXED: Publishable API Key Not Linked to Sales Channel
**Error**: "Publishable key needs to have a sales channel configured"

**Fix Applied**: 
- Found API key table: `api_key` (not `publishable_api_key`)
- API Key ID: `e10dd6a1-4542-42c3-8bd8-5d0b882542f6`
- Sales Channel ID: `sc_01KCAYC288Q68JN9HB03YHTZ3P`
- Created link in `publishable_api_key_sales_channel` table

### 2. ✅ FIXED: Products Not Published
**Fix Applied**: Updated all products to `status = 'published'` and set `published_at`.

### 3. ❌ STILL BROKEN: Missing Prices
**Critical Issue**: Variants have price set links but **0 prices exist**.

**Impact**: Medusa may filter out products without prices from storefront responses.

## Current Database State

```
✅ Products Published: 4
✅ Products in Sales Channel: 4
✅ API Key Linked to Sales Channel: 1 (FIXED!)
✅ Variants with Price Sets: 4
❌ Prices: 0 (CRITICAL - This is likely why products don't show)
```

## Why Products Still Don't Show

The most likely reason products aren't appearing is **missing prices**. Medusa's storefront API likely filters out products that don't have prices, even if all other requirements are met.

## Requirements Checklist

For products to appear on storefront:

1. ✅ Product `status = 'published'` AND `published_at IS NOT NULL`
2. ✅ Product linked to sales channel via `product_sales_channel`
3. ✅ Publishable API key linked to sales channel via `publishable_api_key_sales_channel`
4. ✅ Product has at least one variant
5. ✅ Variants linked to price sets via `product_variant_price_set`
6. ❌ **Price sets have prices** (CRITICAL - Currently 0 prices exist)

## Next Steps

1. **Fix prices** - This is the blocking issue. Use Admin API to add prices since SQL inserts aren't working.
2. Verify products appear after prices are added
3. Test storefront to confirm products are visible

## Files Created

- `STOREFRONT_VISIBILITY_FIX.md` - Initial analysis
- `STOREFRONT_ISSUE_SUMMARY.md` - This comprehensive summary
