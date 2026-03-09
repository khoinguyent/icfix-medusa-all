# Price Addition Issue - Summary

## Problem
Cannot add prices in Medusa Admin UI. The admin shows:
- **Error**: "Cannot read properties of undefined (reading 'reduce')"
- **Cause**: Variants don't have price set links, so the admin UI receives `undefined` when trying to display prices

## Root Cause
Only **1 out of 4** variant-price set links exist in the database:
- ✅ iPhone 15 Pro variant: Has price set link
- ❌ Charger variant: Missing price set link
- ❌ MacBook Air M3 variant: Missing price set link (this is the one shown in the error)
- ❌ Battery variant: Missing price set link

## Current Database State
```
Variant-Price Links: 1 (should be 4)
Prices: 0 (should be 4)
Price Sets: 5 (correct)
```

## Why SQL Inserts Are Failing
Despite multiple attempts, only 1 link persists after commit. Possible causes:
1. **Post-commit trigger** - Something is deleting links after transaction commits
2. **Unique constraint on variant_id alone** - May prevent multiple price sets per variant
3. **Medusa framework constraint** - The framework may enforce one price set per variant

## Solution Options

### Option 1: Use Medusa Admin API (Recommended)
Use the Admin API to add prices properly:
```bash
POST /admin/products/*/variants/{variant_id}
Body: { "prices": [{ "currency_code": "vnd", "amount": 27900000 }] }
```

### Option 2: Use Medusa Link API
Use the Link module to create price set links:
```typescript
await link.create({
  [Modules.PRODUCT]: { variant_id: "variant_123" },
  [Modules.PRICING]: { price_set_id: "pset_123" },
})
```

### Option 3: Check Medusa Framework Constraints
Investigate if Medusa v2 enforces a "one price set per variant" rule, which would explain why only 1 link persists.

## Immediate Workaround
For the variant that's failing (`e8b58a38-765d-41de-a78c-97437262cc8e` - MacBook Air M3):
1. The variant needs a price set link
2. The price set needs a price entry
3. Both are currently missing

## Next Steps
1. ✅ Verify admin authentication works
2. ⚠️ Use Admin API to add prices (requires working authentication)
3. ⚠️ Or investigate why SQL inserts only persist 1 link
