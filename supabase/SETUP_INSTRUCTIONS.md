# Complete Supabase Setup Instructions - Pakistan Timezone

This guide will help you set up your subscription tracking app with Supabase, configured for Pakistan (Islamabad) timezone.

---

## 📋 Prerequisites

- Supabase account (https://supabase.com)
- Node.js installed (for Supabase CLI)
- Your WhatsApp Business API credentials from Meta

---

## 🚀 Step-by-Step Setup

### **Step 1: Create New Supabase Project**

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Organization**: Select your organization
   - **Project Name**: `subscription-reminder` (or your choice)
   - **Database Password**: Create a strong password (**SAVE THIS!**)
   - **Region**: Choose **Mumbai, India** (closest to Pakistan)
   - **Pricing Plan**: Free or Pro
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

---

### **Step 2: Get API Keys**

1. In your project, click the **⚙️ Settings** icon (left sidebar)
2. Click **"API"** in the settings menu
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`
   - **service_role key**: Another long string (**keep this SECRET!**)

4. Update your `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
META_WHATSAPP_ACCESS_TOKEN=your_meta_token
META_PHONE_NUMBER_ID=your_phone_number_id
```

---

### **Step 3: Create Database Schema**

1. In Supabase Dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Open the file: `supabase/COMPLETE_SETUP_PAKISTAN.sql`
4. Copy the **ENTIRE** contents and paste into SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. Wait for completion (should show success messages)

**What this creates:**
- ✅ `subscriptions` table with all fields
- ✅ `banks` table for payment methods
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for auto-updates
- ✅ Pakistan timezone helper functions
- ✅ Extensions (pg_cron, pg_net)

---

### **Step 4: Verify Database Setup**

Run this query in SQL Editor to verify:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscriptions', 'banks');

-- Check Pakistan time
SELECT 
  NOW() as utc_time,
  NOW() AT TIME ZONE 'Asia/Karachi' as pakistan_time;
```

You should see:
- ✅ `subscriptions` table
- ✅ `banks` table
- ✅ Current Pakistan time displayed correctly

---

### **Step 5: Install Supabase CLI**

Open PowerShell and run:

```powershell
npm install -g supabase
```

Verify installation:
```powershell
supabase --version
```

---

### **Step 6: Login to Supabase CLI**

```powershell
supabase login
```

- Browser will open
- Click **"Authorize"**
- Return to PowerShell

---

### **Step 7: Link Your Project**

1. Get your **Project Reference ID**:
   - Go to: Dashboard → Project Settings → General
   - Copy the **Reference ID** (e.g., `ujivqubkjqkqmgdbtgzr`)

2. Link the project:
```powershell
cd "c:\Users\HAFIZ TECH\Desktop\Updating Subscription\subscription-tracking-main"
supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your actual reference ID.

---

### **Step 8: Set Environment Variables for Edge Function**

```powershell
supabase secrets set META_WHATSAPP_ACCESS_TOKEN=your_meta_token_here
supabase secrets set META_PHONE_NUMBER_ID=your_phone_number_id_here
```

Replace with your actual Meta WhatsApp credentials.

Verify:
```powershell
supabase secrets list
```

Should show:
- ✅ META_WHATSAPP_ACCESS_TOKEN
- ✅ META_PHONE_NUMBER_ID

---

### **Step 9: Deploy Edge Function**

```powershell
supabase functions deploy send-reminders
```

You should see:
```
Deploying send-reminders (project ref: YOUR_PROJECT_REF)
✓ Deployed Function send-reminders
```

---

### **Step 10: Set Up Cron Job**

1. Open `supabase/CRON_JOB_SETUP.sql`
2. Find this section:
```sql
SELECT cron.schedule(
  'send-subscription-reminders',
  '* * * * *',
  $$
  SELECT
    net.http_post(
      url := 'YOUR_PROJECT_URL/functions/v1/send-reminders',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

3. Replace:
   - `YOUR_PROJECT_URL` → Your Supabase URL (e.g., `https://ujivqubkjqkqmgdbtgzr.supabase.co`)
   - `YOUR_SERVICE_ROLE_KEY` → Your service role key from Step 2

4. Copy the modified query
5. Go to Supabase Dashboard → SQL Editor
6. Paste and run the query

---

### **Step 11: Verify Cron Job**

Run this in SQL Editor:

```sql
-- Check if cron job exists
SELECT jobid, jobname, schedule, active 
FROM cron.job 
WHERE jobname = 'send-subscription-reminders';

-- Check recent executions
SELECT 
  jobname,
  runid,
  status,
  start_time AT TIME ZONE 'Asia/Karachi' as start_time_pakistan
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-subscription-reminders')
ORDER BY start_time DESC 
LIMIT 5;
```

You should see:
- ✅ Cron job exists and is active
- ✅ Executions running every minute

---

### **Step 12: Test the Setup**

#### **Option A: Create Test Subscription via SQL**

Open `supabase/TEST_QUERIES_PAKISTAN.sql` and run:

```sql
-- Delete old tests
DELETE FROM subscriptions WHERE service_name LIKE 'Test%';

-- Create test for 2 minutes from now
WITH time_calc AS (
  SELECT 
    (NOW() AT TIME ZONE 'Asia/Karachi')::DATE as today,
    (NOW() AT TIME ZONE 'Asia/Karachi' + INTERVAL '2 minutes')::TIME as reminder_time
)
INSERT INTO subscriptions (
  user_id,
  service_name,
  cost,
  currency,
  billing_cycle,
  start_date,
  next_payment_date,
  reminder_days_before,
  reminder_time,
  whatsapp_number,
  last_reminder_sent
)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  'Test Subscription ' || TO_CHAR(NOW() AT TIME ZONE 'Asia/Karachi', 'HH24:MI'),
  99.99,
  'PKR',
  'monthly',
  today,
  today,
  0,
  reminder_time,
  '+923447470874',  -- REPLACE WITH YOUR WHATSAPP NUMBER
  NULL
FROM time_calc
RETURNING 
  id,
  service_name,
  reminder_time,
  next_payment_date;
```

**Important**: Replace `+923447470874` with your actual WhatsApp number!

#### **Option B: Create Test via Frontend**

1. Start your Next.js app:
```powershell
npm run dev
```

2. Open http://localhost:3001
3. Sign up / Log in
4. Create a new subscription:
   - Service Name: `Test Netflix`
   - Cost: `99.99`
   - Currency: `PKR`
   - Billing Cycle: `Monthly`
   - Next Payment Date: **Today**
   - Reminder Days Before: `0`
   - Reminder Time: **Current time + 2 minutes**
   - WhatsApp Number: Your number (e.g., `+923447470874`)

5. Wait 2 minutes and check your WhatsApp!

---

### **Step 13: Monitor Logs**

#### **Check Edge Function Logs:**
1. Go to: Supabase Dashboard → Edge Functions → send-reminders
2. Click **"Logs"** tab
3. You should see logs every minute showing:
   - ⏰ Current Pakistan time
   - 📋 Subscriptions being processed
   - 📤 Messages being sent

#### **Check Cron Job Executions:**
```sql
SELECT 
  jobname,
  runid,
  status,
  return_message,
  start_time AT TIME ZONE 'Asia/Karachi' as start_time_pakistan,
  CASE 
    WHEN status = 'succeeded' THEN '✅'
    WHEN status = 'failed' THEN '❌'
    ELSE '⏳'
  END as status_icon
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-subscription-reminders')
ORDER BY start_time DESC 
LIMIT 10;
```

---

## 🎯 Quick Reference

### **Important Files:**
- `supabase/COMPLETE_SETUP_PAKISTAN.sql` - Database schema setup
- `supabase/functions/send-reminders/index.ts` - Edge Function code
- `supabase/CRON_JOB_SETUP.sql` - Cron job configuration
- `supabase/TEST_QUERIES_PAKISTAN.sql` - Testing queries

### **Key Commands:**
```powershell
# Deploy Edge Function
supabase functions deploy send-reminders

# Set secrets
supabase secrets set KEY=value

# List secrets
supabase secrets list

# View function logs
supabase functions logs send-reminders

# Start dev server
npm run dev
```

### **Important SQL Queries:**

**Check Pakistan Time:**
```sql
SELECT NOW() AT TIME ZONE 'Asia/Karachi' as pakistan_time;
```

**Check Ready Subscriptions:**
```sql
-- See TEST_QUERIES_PAKISTAN.sql, Query #6
```

**Reset Test Subscription:**
```sql
UPDATE subscriptions 
SET last_reminder_sent = NULL 
WHERE service_name LIKE 'Test%';
```

---

## 🔧 Troubleshooting

### **Issue: Cron job not running**
1. Check if extensions are enabled:
```sql
SELECT extname FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');
```
2. If missing, enable them:
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### **Issue: Edge Function not receiving requests**
1. Check cron job URL and authorization:
```sql
SELECT command FROM cron.job WHERE jobname = 'send-subscription-reminders';
```
2. Verify URL matches your project URL
3. Verify service role key is correct

### **Issue: WhatsApp messages not sending**
1. Check Edge Function logs for errors
2. Verify Meta credentials:
```powershell
supabase secrets list
```
3. Test WhatsApp number format: `+923XXXXXXXXX`

### **Issue: Time mismatch**
1. Verify Pakistan time:
```sql
SELECT NOW() AT TIME ZONE 'Asia/Karachi';
```
2. Check Edge Function logs for timezone conversion
3. Ensure reminder_time is in 24-hour format (HH:MM:SS)

### **Issue: Duplicate reminders**
1. Check `last_reminder_sent` field:
```sql
SELECT service_name, last_reminder_sent AT TIME ZONE 'Asia/Karachi' 
FROM subscriptions;
```
2. Reset if needed:
```sql
UPDATE subscriptions SET last_reminder_sent = NULL WHERE id = 'YOUR_ID';
```

---

## ✅ Setup Complete Checklist

- [ ] Supabase project created
- [ ] API keys copied to `.env.local`
- [ ] Database schema created (COMPLETE_SETUP_PAKISTAN.sql)
- [ ] Tables verified (subscriptions, banks)
- [ ] Supabase CLI installed and logged in
- [ ] Project linked via CLI
- [ ] Edge Function secrets set (META credentials)
- [ ] Edge Function deployed
- [ ] Cron job created and active
- [ ] Test subscription created
- [ ] WhatsApp reminder received
- [ ] Edge Function logs checked
- [ ] Cron job executions verified

---

## 📞 Support

If you encounter issues:
1. Check Edge Function logs in Supabase Dashboard
2. Run verification queries from TEST_QUERIES_PAKISTAN.sql
3. Check cron job execution history
4. Verify all environment variables are set correctly

---

## 🎉 Success!

Your subscription tracking app is now fully set up with:
- ✅ Pakistan timezone support
- ✅ Automatic WhatsApp reminders
- ✅ Cron job running every minute
- ✅ Complete database with RLS
- ✅ Edge Function deployed

**Next Steps:**
1. Create your real subscriptions via the frontend
2. Monitor the system for a few days
3. Adjust cron schedule if needed (see CRON_JOB_SETUP.sql)
4. Customize reminder messages in Edge Function if desired
