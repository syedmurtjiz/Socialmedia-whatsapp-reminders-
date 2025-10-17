# 🔧 Troubleshooting Guide

Common issues and solutions for the subscription tracking app.

---

## ❌ Error: "null value in column user_id violates not-null constraint"

### **Problem:**
When running test queries in `TEST_QUERIES_PAKISTAN.sql`, you get:
```
ERROR: null value in column "user_id" of relation "subscriptions" violates not-null constraint
```

### **Cause:**
The test query tries to create a subscription but there are no users in the `auth.users` table yet.

### **Solution:**

**Option 1: Create User via Frontend (Recommended)**
1. Start your Next.js app:
   ```powershell
   cd "c:\Users\HAFIZ TECH\Desktop\Updating Subscription\subscription-tracking-main"
   npm run dev
   ```
2. Open http://localhost:3001
3. Sign up with your email
4. Now run the test queries again

**Option 2: Check Existing Users**
Run this query in SQL Editor:
```sql
SELECT id, email FROM auth.users;
```

If you see users, copy the `id` and use the manual user_id query in section 5B of `TEST_QUERIES_PAKISTAN.sql`.

**Option 3: Use Manual User ID**
1. Get your user_id from the query above
2. Find section "5B. ALTERNATIVE: CREATE TEST WITH MANUAL USER_ID" in `TEST_QUERIES_PAKISTAN.sql`
3. Uncomment the query and replace `YOUR_USER_ID_HERE` with your actual user_id

---

## ❌ Error: "failed to read file: supabase\functions\send-reminders\index.ts"

### **Problem:**
When deploying Edge Function:
```
WARN: failed to read file: open supabase\functions\send-reminders\index.ts: The system cannot find the path specified.
```

### **Cause:**
Running the command from wrong directory.

### **Solution:**
Always run Supabase commands from the project root:
```powershell
cd "c:\Users\HAFIZ TECH\Desktop\Updating Subscription\subscription-tracking-main"
supabase functions deploy send-reminders
```

---

## ❌ Error: Cron job URL mismatch

### **Problem:**
Cron job is using wrong project URL (e.g., `ujivqubkjqkqmgdbtgzr` instead of `nlmskqvnanlsneytxnwg`).

### **Cause:**
You copied the cron job setup from old project.

### **Solution:**
1. Get your correct project URL from Supabase Dashboard → Settings → API
2. Update `CRON_JOB_SETUP.sql`:
   ```sql
   url := 'https://nlmskqvnanlsneytxnwg.supabase.co/functions/v1/send-reminders'
   ```
3. Delete old cron job:
   ```sql
   SELECT cron.unschedule('send-subscription-reminders');
   ```
4. Create new cron job with correct URL

---

## ❌ WhatsApp Messages Not Sending

### **Problem:**
Edge Function runs but no WhatsApp messages are received.

### **Possible Causes & Solutions:**

**1. Missing or Wrong Credentials**
```powershell
# Check secrets
supabase secrets list

# Should show:
# - META_WHATSAPP_ACCESS_TOKEN
# - META_PHONE_NUMBER_ID

# If missing, set them:
supabase secrets set META_WHATSAPP_ACCESS_TOKEN=your_token
supabase secrets set META_PHONE_NUMBER_ID=your_phone_id
```

**2. Wrong Phone Number Format**
- ✅ Correct: `+923447470874` (with country code)
- ❌ Wrong: `03447470874` (without +92)
- ❌ Wrong: `923447470874` (missing +)

**3. Time Mismatch**
Check if reminder time matches current Pakistan time:
```sql
-- Run this to see current time and ready subscriptions
-- See TEST_QUERIES_PAKISTAN.sql, Query #6
```

**4. Already Sent Today**
Check `last_reminder_sent`:
```sql
SELECT 
  service_name,
  last_reminder_sent AT TIME ZONE 'Asia/Karachi' as last_sent_pakistan
FROM subscriptions;

-- Reset if needed:
UPDATE subscriptions SET last_reminder_sent = NULL WHERE id = 'YOUR_ID';
```

**5. Check Edge Function Logs**
1. Go to: Supabase Dashboard → Edge Functions → send-reminders
2. Click "Logs" tab
3. Look for errors or "skipped" messages

---

## ❌ Cron Job Not Running

### **Problem:**
Cron job exists but doesn't execute.

### **Solution:**

**1. Check if cron job is active:**
```sql
SELECT jobid, jobname, active FROM cron.job 
WHERE jobname = 'send-subscription-reminders';
```

**2. Check recent executions:**
```sql
SELECT 
  status,
  return_message,
  start_time AT TIME ZONE 'Asia/Karachi' as pakistan_time
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-subscription-reminders')
ORDER BY start_time DESC 
LIMIT 5;
```

**3. If no executions, recreate cron job:**
```sql
-- Delete old
SELECT cron.unschedule('send-subscription-reminders');

-- Create new (see CRON_JOB_SETUP.sql)
```

**4. Check if extensions are enabled:**
```sql
SELECT extname FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');

-- If missing:
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

---

## ❌ Timezone Issues

### **Problem:**
Reminders sent at wrong time (e.g., 5 hours off).

### **Cause:**
Database stores UTC, but you're thinking in Pakistan time.

### **Solution:**

**Always use Pakistan timezone functions:**
```sql
-- Current Pakistan time
SELECT NOW() AT TIME ZONE 'Asia/Karachi';

-- Create subscription with Pakistan time
INSERT INTO subscriptions (reminder_time, ...)
VALUES (
  (NOW() AT TIME ZONE 'Asia/Karachi' + INTERVAL '2 minutes')::TIME,
  ...
);
```

**Check what time the system sees:**
```sql
SELECT 
  NOW() as utc_time,
  NOW() AT TIME ZONE 'Asia/Karachi' as pakistan_time,
  EXTRACT(HOUR FROM (NOW() AT TIME ZONE 'Asia/Karachi')) as pakistan_hour,
  EXTRACT(MINUTE FROM (NOW() AT TIME ZONE 'Asia/Karachi')) as pakistan_minute;
```

---

## ❌ RLS Policy Errors

### **Problem:**
```
ERROR: new row violates row-level security policy
```

### **Cause:**
Row Level Security (RLS) is blocking the operation.

### **Solution:**

**For testing via SQL Editor:**
The SQL Editor uses the `postgres` role which bypasses RLS. If you still get errors, check:

1. Are you using the correct user_id?
2. Is the user_id valid (exists in auth.users)?

**For API/Frontend:**
Make sure you're authenticated:
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  // User not logged in
}
```

---

## ❌ Docker Warning

### **Problem:**
```
WARNING: Docker is not running
```

### **Cause:**
Docker Desktop is not running (not critical for deployment).

### **Solution:**
This is just a warning. Edge Function will still deploy successfully. If you want to test locally, start Docker Desktop.

---

## 🔍 Debugging Checklist

When something doesn't work, check in this order:

1. **✅ Database Setup**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name IN ('subscriptions', 'banks');
   ```

2. **✅ Users Exist**
   ```sql
   SELECT COUNT(*) FROM auth.users;
   ```

3. **✅ Edge Function Deployed**
   - Check Dashboard → Edge Functions

4. **✅ Secrets Set**
   ```powershell
   supabase secrets list
   ```

5. **✅ Cron Job Active**
   ```sql
   SELECT active FROM cron.job WHERE jobname = 'send-subscription-reminders';
   ```

6. **✅ Cron Job URL Correct**
   ```sql
   SELECT command FROM cron.job WHERE jobname = 'send-subscription-reminders';
   ```

7. **✅ Test Subscription Created**
   ```sql
   SELECT * FROM subscriptions WHERE service_name LIKE 'Test%';
   ```

8. **✅ Check Edge Function Logs**
   - Dashboard → Edge Functions → send-reminders → Logs

---

## 📞 Still Having Issues?

1. Run all verification queries from `TEST_QUERIES_PAKISTAN.sql`
2. Check Edge Function logs in Supabase Dashboard
3. Verify all environment variables are set correctly
4. Make sure you're in the correct directory when running commands
5. Check that your WhatsApp credentials are valid

---

## 🎯 Quick Test

To verify everything is working:

1. **Create user** (if not exists):
   - Go to http://localhost:3001
   - Sign up with email

2. **Create test subscription**:
   ```sql
   -- Run section #4 from TEST_QUERIES_PAKISTAN.sql
   -- This creates a subscription with reminder in 2 minutes
   ```

3. **Wait 2 minutes** and check:
   - WhatsApp message received? ✅
   - Edge Function logs show "sent"? ✅
   - `last_reminder_sent` updated? ✅

If all three are ✅, your setup is working perfectly!
