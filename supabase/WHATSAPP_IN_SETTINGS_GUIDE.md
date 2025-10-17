# 📱 WhatsApp Number Moved to User Settings

## 🎯 **What Changed:**

WhatsApp number is now stored in **user settings** instead of per subscription. This means:
- ✅ One WhatsApp number for all subscriptions
- ✅ Easier to manage (update once, applies to all)
- ✅ Cleaner subscription form
- ✅ Better user experience

---

## 📊 **Architecture:**

### **Before:**
```
subscriptions table:
- id
- service_name
- cost
- whatsapp_number  ← Per subscription
- reminder_time    ← Per subscription
```

### **After:**
```
user_profiles table:
- id (user_id)
- whatsapp_number  ← One per user
- reminder_time    ← Default for all subscriptions
- timezone

subscriptions table:
- id
- service_name
- cost
- (whatsapp_number removed)
- (reminder_time can be removed)
```

---

## 🚀 **Implementation Steps:**

### **Step 1: Run Migration Script**

Go to Supabase Dashboard → SQL Editor and run:
```sql
-- File: MOVE_WHATSAPP_TO_SETTINGS.sql
```

This will:
1. ✅ Create `user_profiles` table
2. ✅ Migrate existing WhatsApp numbers from subscriptions
3. ✅ Create profiles for all users
4. ✅ Set up RLS policies
5. ✅ Add indexes

### **Step 2: Redeploy Edge Function**

```powershell
cd "c:\Users\HAFIZ TECH\Desktop\Updating Subscription\subscription-tracking-main"
supabase functions deploy send-reminders
```

The Edge Function now:
- ✅ Joins with `user_profiles` table
- ✅ Gets WhatsApp number from user settings
- ✅ Sends reminders using the user's WhatsApp number

### **Step 3: Update Frontend (Settings Page)**

Create or update the settings page to allow users to manage their WhatsApp number:

```typescript
// Example: Settings form
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [reminderTime, setReminderTime] = useState('09:00')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setWhatsappNumber(data.whatsapp_number || '')
      setReminderTime(data.reminder_time || '09:00')
    }
  }

  async function saveProfile() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        whatsapp_number: whatsappNumber,
        reminder_time: reminderTime
      })

    if (error) {
      alert('Error saving settings')
    } else {
      alert('Settings saved successfully!')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            WhatsApp Number
          </label>
          <input
            type="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="+923001234567"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-sm text-gray-500 mt-1">
            Format: +92 followed by 10 digits (e.g., +923001234567)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Default Reminder Time
          </label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-sm text-gray-500 mt-1">
            Pakistan time (UTC+5)
          </p>
        </div>

        <button
          onClick={saveProfile}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
```

### **Step 4: Remove WhatsApp Fields from Subscription Form**

Update your subscription form to remove WhatsApp number and reminder time fields:

```typescript
// Before: Subscription form had these fields
<input name="whatsapp_number" ... />
<input name="reminder_time" ... />

// After: Remove these fields
// Users set WhatsApp number once in Settings
```

---

## 🔍 **How It Works:**

### **Edge Function Flow:**

1. **Query subscriptions** with user_profiles join:
```typescript
const { data: subscriptions } = await supabase
  .from('subscriptions')
  .select(`
    *,
    user_profiles!inner (
      whatsapp_number,
      reminder_time
    )
  `)
  .eq('status', 'active')
```

2. **Extract WhatsApp number** from user profile:
```typescript
const userProfile = subscription.user_profiles
const whatsappNumber = userProfile?.whatsapp_number
```

3. **Send reminder** to user's WhatsApp:
```typescript
await sendWhatsAppMessage(
  whatsappNumber,  // From user settings
  message,
  accessToken,
  phoneNumberId
)
```

---

## 📝 **Database Schema:**

### **user_profiles Table:**
```sql
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    whatsapp_number TEXT,
    reminder_time TIME DEFAULT '09:00:00',
    timezone TEXT DEFAULT 'Asia/Karachi',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **RLS Policies:**
- Users can view/update their own profile
- Service role can access all profiles (for Edge Function)

---

## ✅ **Benefits:**

### **For Users:**
1. **Easier Management** - Update WhatsApp number once
2. **Cleaner Forms** - Subscription form is simpler
3. **Consistent** - All reminders go to same number
4. **Flexible** - Can change number anytime in settings

### **For Developers:**
1. **Better Architecture** - User settings separate from subscriptions
2. **Easier Maintenance** - One source of truth for WhatsApp number
3. **Scalable** - Can add more user preferences easily
4. **Clean Code** - Logical separation of concerns

---

## 🧪 **Testing:**

### **Test 1: Create User Profile**
```sql
-- Check if profile was created
SELECT * FROM user_profiles WHERE id = 'your-user-id';
```

### **Test 2: Update WhatsApp Number**
```sql
-- Update via SQL
UPDATE user_profiles 
SET whatsapp_number = '+923001234567'
WHERE id = 'your-user-id';
```

### **Test 3: Create Test Subscription**
```sql
-- Create subscription (no whatsapp_number field needed)
INSERT INTO subscriptions (
  user_id, service_name, cost, currency, 
  billing_cycle, next_payment_date, status
) VALUES (
  'your-user-id', 'Netflix', 1500, 'PKR',
  'monthly', CURRENT_DATE, 'active'
);
```

### **Test 4: Check Edge Function**
- Wait for reminder time
- Check logs in Supabase Dashboard
- Verify WhatsApp message received

---

## 🔧 **Troubleshooting:**

### **Issue: No WhatsApp number found**
**Solution:** Make sure user has a profile with WhatsApp number:
```sql
SELECT * FROM user_profiles WHERE id = auth.uid();
```

### **Issue: Reminders not sending**
**Solution:** Check Edge Function logs:
1. Go to Supabase Dashboard → Edge Functions
2. Click on `send-reminders`
3. Check Logs tab
4. Look for "no WhatsApp number in user settings"

### **Issue: Migration didn't copy WhatsApp numbers**
**Solution:** Manually migrate:
```sql
INSERT INTO user_profiles (id, whatsapp_number)
SELECT DISTINCT user_id, whatsapp_number
FROM subscriptions
WHERE whatsapp_number IS NOT NULL
ON CONFLICT (id) DO UPDATE
SET whatsapp_number = EXCLUDED.whatsapp_number;
```

---

## 📋 **Checklist:**

- [ ] Run `MOVE_WHATSAPP_TO_SETTINGS.sql` in SQL Editor
- [ ] Verify `user_profiles` table created
- [ ] Check existing WhatsApp numbers migrated
- [ ] Redeploy Edge Function
- [ ] Create/update Settings page in frontend
- [ ] Remove WhatsApp fields from Subscription form
- [ ] Test creating new subscription
- [ ] Test receiving WhatsApp reminder
- [ ] Update documentation

---

## 🎉 **Summary:**

WhatsApp number is now in **user settings** (`user_profiles` table) instead of per subscription. This provides:
- ✅ Better user experience
- ✅ Cleaner architecture
- ✅ Easier management
- ✅ One number for all subscriptions

**Run the migration script and redeploy the Edge Function to apply changes!**
