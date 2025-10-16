# Migration Guide: Update Existing Schema

## Overview
This guide helps you update your existing Supabase schema (from Working-Whatsapp-Reminders) to match the new subscription form **without losing any data**.

## ⚠️ Important: Backup First!

Before running the migration, **backup your data**:

```sql
-- Create a backup of your subscriptions table
CREATE TABLE subscriptions_backup AS 
SELECT * FROM public.subscriptions;
```

## Migration Steps

### Step 1: Review Current Schema

Check your current table structure:

```sql
-- See all columns in your subscriptions table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns
WHERE table_name = 'subscriptions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### Step 2: Run the Migration Script

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy the entire content of `migration-update-schema.sql`
4. Paste it into the SQL Editor
5. Click **Run**

### Step 3: Verify the Migration

After running the migration, verify everything worked:

```sql
-- Check all columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check your data is still there
SELECT COUNT(*) FROM public.subscriptions;

-- View sample data with new columns
SELECT 
    service_name,
    cost,
    currency,
    billing_cycle,
    start_date,
    next_payment_date,
    whatsapp_number,
    reminder_days_before,
    reminder_time,
    website_url,
    description,
    bank_id
FROM public.subscriptions
LIMIT 5;
```

### Step 4: Update Existing Records (Optional)

If you want to add cost/currency to existing subscriptions:

```sql
-- Update existing subscriptions with default values
UPDATE public.subscriptions
SET 
    cost = 9.99,  -- Set appropriate default cost
    currency = 'USD'
WHERE cost = 0.01;  -- Only update records with default cost
```

## What the Migration Does

### 1. **Renames Columns**
- `name` → `service_name`
- `subscription_type` → `billing_cycle`
- `custom_interval_days` → `custom_cycle_days`

### 2. **Adds New Columns**
- `cost` (DECIMAL) - Subscription cost
- `currency` (TEXT) - Currency code
- `issue_date` (DATE) - Issue date
- `end_date` (DATE) - End date
- `website_url` (TEXT) - Service website
- `description` (TEXT) - Notes
- `logo_url` (TEXT) - Service logo
- `bank_id` (UUID) - Bank reference

### 3. **Updates Constraints**
- Changes billing_cycle values from `daily/weekly/monthly/custom` to `weekly/monthly/yearly/custom`
- Adds currency validation (USD/EUR/GBP/CAD/AUD)
- Adds cost validation (>= 0.01)
- Makes `start_date` optional
- Makes `whatsapp_number` optional
- Makes `reminder_days_before` optional (default: 3)
- Makes `reminder_time` optional (default: 09:00)

### 4. **Creates Banks Table**
- New table for payment method tracking
- Linked to subscriptions via `bank_id`

### 5. **Updates Functions**
- Updates `calculate_next_payment_date()` to use `billing_cycle`
- Updates trigger to work with new column names

## Column Mapping

| Old Column (Working-Whatsapp) | New Column (Subscription-Tracking) | Type | Required |
|-------------------------------|-----------------------------------|------|----------|
| `name` | `service_name` | TEXT | Yes |
| `subscription_type` | `billing_cycle` | TEXT | Yes |
| `custom_interval_days` | `custom_cycle_days` | INTEGER | Conditional |
| `start_date` | `start_date` | DATE | No (changed) |
| `next_payment_date` | `next_payment_date` | DATE | Yes |
| `whatsapp_number` | `whatsapp_number` | TEXT | No (changed) |
| `reminder_days_before` | `reminder_days_before` | INTEGER | No (changed) |
| `reminder_time` | `reminder_time` | TIME | No (changed) |
| - | `cost` | DECIMAL | Yes (new) |
| - | `currency` | TEXT | Yes (new) |
| - | `issue_date` | DATE | No (new) |
| - | `end_date` | DATE | No (new) |
| - | `website_url` | TEXT | No (new) |
| - | `description` | TEXT | No (new) |
| - | `logo_url` | TEXT | No (new) |
| - | `bank_id` | UUID | No (new) |

## Data Conversion

### Billing Cycle Conversion
The migration automatically converts:
- `daily` → `weekly` (since daily is not in new schema)
- `weekly` → `weekly` (no change)
- `monthly` → `monthly` (no change)
- `custom` → `custom` (no change)

### Default Values for New Columns
- `cost`: 0.01 (minimum valid cost)
- `currency`: 'USD'
- All other new columns: NULL (optional)

## Rollback Plan

If something goes wrong, you can restore from backup:

```sql
-- Drop the modified table
DROP TABLE public.subscriptions CASCADE;

-- Restore from backup
CREATE TABLE public.subscriptions AS 
SELECT * FROM subscriptions_backup;

-- Re-enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Recreate policies (run your original schema script)
```

## Testing After Migration

### 1. Test the Form
1. Start your app: `npm run dev`
2. Navigate to the subscription form
3. Try creating a new subscription with all fields
4. Verify it saves correctly

### 2. Test WhatsApp Reminders
```bash
# Test reminder endpoint
curl -X POST http://localhost:3000/api/test-reminder
```

### 3. Test Existing Data
```sql
-- Check all existing subscriptions still work
SELECT 
    service_name,
    billing_cycle,
    next_payment_date,
    whatsapp_number
FROM public.subscriptions
WHERE user_id = 'YOUR_USER_ID';
```

## Common Issues & Solutions

### Issue 1: "Column already exists"
**Solution:** The migration script uses `IF NOT EXISTS` and `IF EXISTS` checks, so it's safe to run multiple times.

### Issue 2: "Constraint violation"
**Solution:** Some existing data might violate new constraints. Check:
```sql
-- Find records with invalid billing_cycle
SELECT * FROM public.subscriptions
WHERE billing_cycle NOT IN ('weekly', 'monthly', 'yearly', 'custom');

-- Find records with invalid cost
SELECT * FROM public.subscriptions
WHERE cost < 0.01;
```

### Issue 3: "Function does not exist"
**Solution:** Make sure the `update_updated_at_column()` function exists:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Post-Migration Checklist

- [ ] Backup created successfully
- [ ] Migration script executed without errors
- [ ] All columns verified in database
- [ ] Sample data checked and looks correct
- [ ] Form tested with new subscription
- [ ] Existing subscriptions still display correctly
- [ ] WhatsApp reminders still work
- [ ] No console errors in application

## Support

If you encounter issues:

1. Check the verification queries output
2. Review the error messages in Supabase logs
3. Ensure all environment variables are set correctly
4. Test with a fresh subscription creation

## Next Steps

After successful migration:

1. Update any API calls that reference old column names
2. Test the complete flow: create → view → edit → delete
3. Set up the cron job for automated reminders
4. Monitor the application for any issues

---

**Migration Status:** Ready to run
**Estimated Time:** 2-5 minutes
**Risk Level:** Low (non-destructive, preserves data)
