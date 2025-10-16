# 🚀 Migration Instructions - Run This First!

## Step-by-Step Migration Process

### ✅ Step 1: Run Pre-Migration Check (Optional)

This checks your current data and fixes any 'daily' billing cycles.

**In Supabase SQL Editor:**
```sql
-- Copy and paste content from pre-migration-fix.sql
-- Then click Run
```

**What it does:**
- Shows your current table structure
- Converts 'daily' to 'weekly' (if any exist)
- Confirms data is ready

---

### ✅ Step 2: Run Main Migration Script

**In Supabase SQL Editor:**
```sql
-- Copy and paste content from migration-update-schema.sql
-- Then click Run
```

**What it does:**
1. Creates `banks` table
2. Adds new columns (`cost`, `currency`, `website_url`, etc.)
3. Renames columns (`name` → `service_name`, etc.)
4. Updates existing data with default values
5. Adds constraints
6. Updates functions and triggers

---

### ✅ Step 3: Verify Migration

Run this query to check everything worked:

```sql
-- Check new columns exist
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'subscriptions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check your data
SELECT 
    service_name,
    cost,
    currency,
    billing_cycle,
    start_date,
    next_payment_date,
    whatsapp_number,
    reminder_days_before,
    reminder_time
FROM public.subscriptions
LIMIT 5;
```

---

## What Changed

### Column Renames:
- `name` → `service_name`
- `subscription_type` → `billing_cycle`
- `custom_interval_days` → `custom_cycle_days`

### New Columns Added:
- `cost` (DECIMAL) - Default: 0.01
- `currency` (TEXT) - Default: 'USD'
- `website_url` (TEXT)
- `description` (TEXT)
- `logo_url` (TEXT)
- `bank_id` (UUID)
- `issue_date` (DATE)
- `end_date` (DATE)

### Constraints Updated:
- `billing_cycle`: weekly/monthly/yearly/custom (no more 'daily')
- `cost`: Must be >= 0.01
- `currency`: Must be USD/EUR/GBP/CAD/AUD
- `start_date`: Now optional
- `whatsapp_number`: Now optional
- `reminder_days_before`: Now optional (default: 3)
- `reminder_time`: Now optional (default: 09:00)

---

## If You Get Errors

### Error: "column does not exist"
**Solution:** The pre-migration script is fine - it's just checking. Skip to Step 2.

### Error: "constraint violation"
**Solution:** Run this first:
```sql
UPDATE public.subscriptions 
SET subscription_type = 'weekly' 
WHERE subscription_type = 'daily';
```

### Error: "trigger function"
**Solution:** The migration script now handles this automatically.

---

## After Migration

### Test Your App:
1. Start dev server: `npm run dev`
2. Create a new subscription
3. Verify all fields save correctly
4. Check existing subscriptions still display

### Update Environment Variables:
Make sure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
META_PHONE_NUMBER_ID=your-phone-id
META_WHATSAPP_ACCESS_TOKEN=your-token
```

---

## Rollback (If Needed)

If something goes wrong, you can rollback:

```sql
-- Restore from backup (if you created one)
DROP TABLE public.subscriptions CASCADE;
CREATE TABLE public.subscriptions AS 
SELECT * FROM subscriptions_backup;
```

---

## Success Checklist

- [ ] Pre-migration check completed
- [ ] Main migration ran without errors
- [ ] Verification queries show correct data
- [ ] App starts without errors
- [ ] Can create new subscriptions
- [ ] Existing subscriptions display correctly
- [ ] WhatsApp fields appear in form

---

**Ready to migrate? Start with Step 1!** 🚀
