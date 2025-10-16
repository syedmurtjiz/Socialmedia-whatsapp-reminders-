# Quick Fix for Migration Error

## The Problem
You're getting this error:
```
ERROR: 23514: check constraint "subscriptions_cost_check" of relation "subscriptions" is violated by some row
```

This happens because your existing data has `cost = 0` or `cost = NULL`, but the new constraint requires `cost >= 0.01`.

## Solution: 3 Easy Steps

### Step 1: Run Pre-Migration Fix (FIRST)

1. Open Supabase SQL Editor
2. Copy and paste the content of `pre-migration-fix.sql`
3. Click **Run**
4. Check the output - it will show and fix all data issues

### Step 2: Run the Updated Migration Script

1. In Supabase SQL Editor
2. Copy and paste the content of `migration-update-schema.sql` (the updated version)
3. Click **Run**
4. This should now work without errors!

### Step 3: Verify

Run this query to check everything worked:

```sql
-- Check your updated subscriptions
SELECT 
    service_name,
    cost,
    currency,
    billing_cycle,
    whatsapp_number
FROM public.subscriptions
LIMIT 5;
```

## What Was Fixed

The updated migration script now:

1. ✅ **Updates data FIRST** (before adding constraints)
2. ✅ **Drops old constraints** before adding new ones
3. ✅ **Sets default cost** (0.01) for all existing records
4. ✅ **Sets default currency** (USD) for all existing records
5. ✅ **Converts 'daily' to 'weekly'** billing cycle

## If You Still Get Errors

### Check for problematic data:

```sql
-- Find rows with invalid cost
SELECT id, name, cost 
FROM public.subscriptions 
WHERE cost IS NULL OR cost < 0.01;

-- Find rows with invalid currency
SELECT id, name, currency 
FROM public.subscriptions 
WHERE currency IS NULL OR currency NOT IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD');
```

### Manual fix:

```sql
-- Fix all costs
UPDATE public.subscriptions 
SET cost = 0.01 
WHERE cost IS NULL OR cost < 0.01;

-- Fix all currencies
UPDATE public.subscriptions 
SET currency = 'USD' 
WHERE currency IS NULL OR currency = '';
```

## Alternative: Run Commands One by One

If the full script still fails, run these commands in order:

### 1. Add columns first:
```sql
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
```

### 2. Update data:
```sql
UPDATE public.subscriptions SET cost = 0.01 WHERE cost IS NULL OR cost < 0.01;
UPDATE public.subscriptions SET currency = 'USD' WHERE currency IS NULL;
```

### 3. Add constraints:
```sql
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_cost_check CHECK (cost >= 0.01);
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_currency_check CHECK (currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD'));
```

## Summary

**Order matters!** The migration now:
1. Adds columns
2. Updates data
3. Adds constraints

This prevents the constraint violation error.
