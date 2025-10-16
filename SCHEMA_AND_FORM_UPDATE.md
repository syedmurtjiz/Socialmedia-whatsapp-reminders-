# Schema and Form Update Summary

## Overview
Updated the database schema and subscription form to align with the Working-Whatsapp-Reminders project structure while maintaining all necessary fields for the subscription tracking application.

## Database Schema Changes

### New Schema File: `supabase-schema.sql`

**Tables Created:**

1. **`banks` table**
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key to auth.users)
   - `name` (TEXT)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

2. **`subscriptions` table**
   - **Identity:**
     - `id` (UUID, Primary Key)
     - `user_id` (UUID, Foreign Key to auth.users)
   
   - **Subscription Details:**
     - `service_name` (TEXT, NOT NULL)
     - `cost` (DECIMAL(10,2), NOT NULL, >= 0.01)
     - `currency` (TEXT, DEFAULT 'USD', CHECK: USD/EUR/GBP/CAD/AUD)
   
   - **Billing Information:**
     - `billing_cycle` (TEXT, CHECK: weekly/monthly/yearly/custom)
     - `custom_cycle_days` (INTEGER, 1-365)
   
   - **Dates:**
     - `start_date` (DATE, optional)
     - `next_payment_date` (DATE, NOT NULL)
     - `issue_date` (DATE, optional)
     - `end_date` (DATE, optional)
   
   - **Additional Information:**
     - `website_url` (TEXT)
     - `description` (TEXT)
     - `logo_url` (TEXT)
   
   - **Bank Reference:**
     - `bank_id` (UUID, Foreign Key to banks, ON DELETE SET NULL)
   
   - **WhatsApp Reminder Settings:**
     - `reminder_days_before` (INTEGER, DEFAULT 3, 0-30)
     - `reminder_time` (TIME, DEFAULT '09:00:00')
     - `whatsapp_number` (TEXT)
   
   - **Tracking:**
     - `last_reminder_sent` (TIMESTAMPTZ)
     - `created_at` (TIMESTAMPTZ, DEFAULT NOW())
     - `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

### Key Features:

1. **Row Level Security (RLS)**
   - Users can only view/modify their own data
   - Service role has full access for cron jobs

2. **Indexes for Performance**
   - `idx_subscriptions_user_id` - Fast user queries
   - `idx_subscriptions_next_payment_date` - Cron job queries
   - `idx_subscriptions_reminder_lookup` - Composite index for reminders
   - `idx_subscriptions_created_at` - Sorting
   - `idx_subscriptions_bank_id` - Bank filtering

3. **Automatic Functions**
   - `update_updated_at_column()` - Auto-updates `updated_at` timestamp
   - `calculate_next_payment_date()` - Calculates next payment based on billing cycle
   - `set_next_payment_date()` - Trigger to auto-calculate on insert

4. **Constraints**
   - Custom cycle validation (required when billing_cycle = 'custom')
   - Currency validation (only allowed currencies)
   - Billing cycle validation
   - Reminder days range (0-30)

## Subscription Form Updates

### New Fields Added:

**WhatsApp Reminders Section:**
1. **WhatsApp Number**
   - Type: `tel`
   - Validation: Regex for international phone format `^\+?[1-9]\d{1,14}$`
   - Placeholder: `+1234567890`
   - Help text: "Include country code (e.g., +1 for US)"

2. **Days Before Payment**
   - Type: `number`
   - Range: 0-30
   - Default: 3
   - Help text: "Remind me X days before payment"

3. **Reminder Time**
   - Type: `time`
   - Default: `09:00`
   - Help text: "What time to send the reminder"

### Form Structure:

1. **Service Details** - Service name
2. **Pricing & Billing** - Cost, currency
3. **Billing Cycle** - Frequency, custom days
4. **Schedule & Organization** - Start date, next payment date (2 columns)
5. **Bank Information** - Bank selection (optional)
6. **WhatsApp Reminders** - Number, days before, time (3 columns, optional)
7. **Additional Information** - Website URL, description (optional)

### Validation Schema Updates:

```typescript
- reminder_days_before: z.number()
    .int('Must be a whole number')
    .min(0, 'Cannot be negative')
    .max(30, 'Cannot exceed 30 days')
    .optional()

- reminder_time: z.string().optional()

- whatsapp_number: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Valid phone with country code')
    .optional()
```

### Default Values:

- `reminder_days_before`: 3
- `reminder_time`: '09:00'
- `whatsapp_number`: '' (empty)

## Key Differences from Working-Whatsapp-Reminders

### Schema Differences:

| Working-Whatsapp-Reminders | Subscription-Tracking-Main |
|---------------------------|---------------------------|
| `name` | `service_name` |
| `subscription_type` (daily/weekly/monthly/custom) | `billing_cycle` (weekly/monthly/yearly/custom) |
| No cost/currency fields | `cost`, `currency` fields |
| No bank reference | `bank_id` reference |
| No website/description | `website_url`, `description`, `logo_url` |
| No issue/end dates | `issue_date`, `end_date` |

### Form Differences:

1. **More comprehensive** - Includes cost, currency, bank selection
2. **Better organized** - Sections with icons and clear labels
3. **Enhanced validation** - More detailed error messages
4. **Auto-calculation** - Next payment date calculated from start date
5. **Dark mode support** - Full dark theme implementation

## Migration Steps

### 1. Run the Schema

```bash
# In Supabase SQL Editor, run:
supabase-schema.sql
```

### 2. Verify Tables

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscriptions', 'banks');
```

### 3. Check RLS Policies

```sql
-- Verify RLS is enabled
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('subscriptions', 'banks');
```

### 4. Test the Form

1. Start the development server: `npm run dev`
2. Navigate to the subscription form
3. Fill in all fields including WhatsApp reminders
4. Submit and verify data is saved correctly

### 5. Test WhatsApp Integration

```bash
# Test the reminder endpoint
curl -X POST http://localhost:3000/api/test-reminder
```

## Environment Variables Required

Ensure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
META_PHONE_NUMBER_ID=your-phone-number-id
META_WHATSAPP_ACCESS_TOKEN=your-access-token
```

## API Endpoints Available

1. **`POST /api/whatsapp/send-test`** - Test WhatsApp message
2. **`POST /api/test-reminder`** - Test reminders for recent subscriptions
3. **`GET /api/cron/send-reminders`** - Automated reminder cron job

## Next Steps

1. ✅ Schema created and documented
2. ✅ Form updated with WhatsApp fields
3. ✅ Validation added
4. ⏳ Run the schema in Supabase
5. ⏳ Test the form with real data
6. ⏳ Set up cron job for automated reminders
7. ⏳ Test WhatsApp message sending

## Notes

- All WhatsApp reminder fields are **optional** - users can add subscriptions without WhatsApp reminders
- The form maintains backward compatibility - existing subscriptions without WhatsApp fields will work fine
- The schema includes automatic timestamp updates and next payment date calculation
- RLS policies ensure data security and isolation between users
