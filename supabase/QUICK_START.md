# 🚀 Quick Start Guide - Pakistan Timezone Setup

**Complete setup in 15 minutes!**

---

## Step 1: Create Supabase Project (3 min)

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in details and click **"Create"**
4. Wait for setup to complete

---

## Step 2: Get API Keys (1 min)

1. Go to: **Settings** ⚙️ → **API**
2. Copy:
   - Project URL
   - anon public key
   - service_role key

3. Update `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
META_WHATSAPP_ACCESS_TOKEN=your_meta_token
META_PHONE_NUMBER_ID=your_phone_number_id
```

---

## Step 3: Run Database Setup (2 min)

1. Open: **SQL Editor** in Supabase Dashboard
2. Copy entire contents of: `supabase/COMPLETE_SETUP_PAKISTAN.sql`
3. Paste and click **"Run"**
4. Wait for success ✅

---

## Step 4: Deploy Edge Function (5 min)

```powershell
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project (replace YOUR_PROJECT_REF)
cd "c:\Users\HAFIZ TECH\Desktop\Updating Subscription\subscription-tracking-main"
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets (replace with your actual values)
supabase secrets set META_WHATSAPP_ACCESS_TOKEN=your_token
supabase secrets set META_PHONE_NUMBER_ID=your_phone_id

# Deploy
supabase functions deploy send-reminders
```

---

## Step 5: Setup Cron Job (2 min)

1. Open: `supabase/CRON_JOB_SETUP.sql`
2. Find the cron schedule command
3. Replace:
   - `YOUR_PROJECT_URL` with your Supabase URL
   - `YOUR_SERVICE_ROLE_KEY` with your service role key
4. Copy and run in SQL Editor

---

## Step 6: Test It! (2 min)

**Option A - SQL Test:**
```sql
-- Run in SQL Editor
DELETE FROM subscriptions WHERE service_name LIKE 'Test%';

WITH time_calc AS (
  SELECT 
    (NOW() AT TIME ZONE 'Asia/Karachi')::DATE as today,
    (NOW() AT TIME ZONE 'Asia/Karachi' + INTERVAL '2 minutes')::TIME as reminder_time
)
INSERT INTO subscriptions (
  user_id, service_name, cost, currency, billing_cycle,
  start_date, next_payment_date, reminder_days_before,
  reminder_time, whatsapp_number, last_reminder_sent
)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  'Test ' || TO_CHAR(NOW() AT TIME ZONE 'Asia/Karachi', 'HH24:MI'),
  99.99, 'PKR', 'monthly', today, today, 0,
  reminder_time, '+923447470874', NULL  -- CHANGE NUMBER!
FROM time_calc
RETURNING service_name, reminder_time;
```

**Option B - Frontend Test:**
```powershell
npm run dev
```
- Open http://localhost:3001
- Create subscription with reminder in 2 minutes
- Check WhatsApp!

---

## ✅ Verify Setup

**Check Cron Job:**
```sql
SELECT jobname, active FROM cron.job 
WHERE jobname = 'send-subscription-reminders';
```

**Check Pakistan Time:**
```sql
SELECT NOW() AT TIME ZONE 'Asia/Karachi' as pakistan_time;
```

**Check Edge Function Logs:**
- Dashboard → Edge Functions → send-reminders → Logs

---

## 🎯 Done!

Your app is now:
- ✅ Connected to Supabase
- ✅ Using Pakistan timezone
- ✅ Sending WhatsApp reminders automatically
- ✅ Running cron job every minute

**Files Reference:**
- Full setup: `SETUP_INSTRUCTIONS.md`
- SQL commands: `COMPLETE_SETUP_PAKISTAN.sql`
- Cron setup: `CRON_JOB_SETUP.sql`
- Test queries: `TEST_QUERIES_PAKISTAN.sql`
