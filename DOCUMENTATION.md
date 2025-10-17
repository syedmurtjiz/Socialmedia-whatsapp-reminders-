# 📚 Subscription Tracker - Complete Documentation

A comprehensive subscription management application with WhatsApp reminders, web notifications, and detailed cost analysis for Pakistan.

---

## 📋 Table of Contents

1. [Features](#features)
2. [Quick Start](#quick-start)
3. [Database Setup](#database-setup)
4. [WhatsApp Reminders](#whatsapp-reminders)
5. [Web Notifications](#web-notifications)
6. [Project Structure](#project-structure)
7. [Environment Variables](#environment-variables)
8. [SQL Scripts](#sql-scripts)
9. [Troubleshooting](#troubleshooting)
10. [API Reference](#api-reference)

---

## 🌟 Features

### Core Functionality
- ✅ **Subscription Management** - Add, edit, delete subscriptions
- ✅ **Smart Dashboard** - Overview with charts and analytics
- ✅ **Category Organization** - Organize by categories
- ✅ **Cost Analysis** - Track spending patterns
- ✅ **Payment Reminders** - WhatsApp + Web notifications
- ✅ **Bank Integration** - Pakistani banks support
- ✅ **Multi-Currency** - PKR, USD, EUR, GBP support

### Authentication & Security
- ✅ **Supabase Auth** - Email/password authentication
- ✅ **Row Level Security** - Data privacy with RLS policies
- ✅ **Secure API** - Protected Edge Functions

### Notification System
- ✅ **WhatsApp Reminders** - Via Meta WhatsApp Business API
- ✅ **Web Notifications** - Real-time in-app notifications
- ✅ **Dual Notification** - Same message on both platforms
- ✅ **Customizable** - Set reminder days and time per subscription

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Meta WhatsApp Business API credentials

### 1. Clone Repository
```bash
git clone <repository-url>
cd subscription-tracking-main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
Run these SQL scripts in Supabase SQL Editor (in order):

```sql
1. supabase/sql-scripts/COMPLETE_SETUP_PAKISTAN.sql
2. supabase/sql-scripts/CREATE_USER_PROFILES.sql
3. supabase/sql-scripts/CREATE_NOTIFICATIONS_TABLE.sql
4. supabase/sql-scripts/INSERT_PAKISTANI_BANKS.sql
5. supabase/sql-scripts/CRON_JOB_SETUP.sql
```

### 5. Configure Edge Function
Set secrets in Supabase:
```bash
supabase secrets set META_ACCESS_TOKEN=your_token
supabase secrets set META_PHONE_NUMBER_ID=your_phone_id
```

### 6. Deploy Edge Function
```bash
supabase functions deploy send-reminders
```

### 7. Run Development Server
```bash
npm run dev
```

Visit: `http://localhost:3001`

---

## 🗄️ Database Setup

### Tables Created

#### 1. **subscriptions**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → auth.users)
- service_name (TEXT)
- cost (NUMERIC)
- currency (TEXT)
- billing_cycle (TEXT)
- next_payment_date (DATE)
- reminder_days_before (INTEGER)
- reminder_time (TIME)
- bank_id (UUID, Foreign Key → banks)
- website_url (TEXT)
- status (TEXT)
- last_reminder_sent (TIMESTAMPTZ)
```

#### 2. **user_profiles**
```sql
- id (UUID, Primary Key → auth.users)
- whatsapp_number (TEXT)
- timezone (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### 3. **notifications**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → auth.users)
- subscription_id (UUID, Foreign Key → subscriptions)
- type (TEXT)
- title (TEXT)
- message (TEXT)
- status (TEXT)
- read_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
```

#### 4. **banks**
```sql
- id (UUID, Primary Key)
- name (TEXT)
- logo_url (TEXT)
- created_at (TIMESTAMPTZ)
```

#### 5. **categories**
```sql
- id (UUID, Primary Key)
- name (TEXT)
- icon (TEXT)
- color (TEXT)
- created_at (TIMESTAMPTZ)
```

### RLS Policies
All tables have Row Level Security enabled:
- Users can only access their own data
- Service role has full access
- Authenticated users have appropriate permissions

---

## 📱 WhatsApp Reminders

### Setup

#### 1. **Meta WhatsApp Business API**
- Create Meta Developer account
- Set up WhatsApp Business API
- Get Access Token and Phone Number ID

#### 2. **Configure Edge Function**
```bash
supabase secrets set META_ACCESS_TOKEN=your_token
supabase secrets set META_PHONE_NUMBER_ID=your_phone_id
```

#### 3. **Set WhatsApp Number**
Go to `/dashboard/settings` → Notifications tab:
- Enter WhatsApp number (format: +923001234567)
- Save

### How It Works

1. **Edge Function runs every minute** (via cron job)
2. **Checks subscriptions** needing reminders
3. **Calculates reminder date** (next_payment_date - reminder_days_before)
4. **Checks reminder time** matches current Pakistan time
5. **Sends WhatsApp message** with subscription details
6. **Creates web notification** with same message
7. **Updates last_reminder_sent** timestamp

### Message Format

```
🔔 Payment Reminder

Your Netflix subscription payment of Rs 1,500 is due in 3 days (20 October 2025).

💳 Payment Method: HBL - Habib Bank Limited
🌐 Website: https://netflix.com

✅ Please ensure sufficient funds are available.
```

### Features
- ✅ Bank name included (if set)
- ✅ Website link included (if set)
- ✅ Duplicate prevention (one per day)
- ✅ Pakistan timezone (UTC+5)
- ✅ Exact time matching

---

## 📬 Web Notifications

### Features
- ✅ Real-time notifications
- ✅ Notification bell with unread count
- ✅ Same message as WhatsApp
- ✅ Mark as read/unread
- ✅ Notification history
- ✅ Audit trail

### Notification Types
- `whatsapp_reminder` - WhatsApp reminder sent
- `system` - System notifications
- `payment_due` - Payment due alerts

### How to View
1. Click notification bell icon (top right)
2. See list of notifications
3. Click to mark as read
4. View full message

### Real-Time Updates
Uses Supabase Realtime:
- Instant notification badge update
- No page refresh needed
- Automatic list updates

---

## 📁 Project Structure

```
subscription-tracking-main/
├── src/
│   ├── app/
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Main app
│   │   │   ├── settings/      # Settings page
│   │   │   └── subscriptions/ # Subscriptions
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── subscriptions/     # Subscription components
│   │   ├── ui/                # UI components
│   │   └── NotificationBell.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── NotificationContext.tsx
│   ├── hooks/
│   │   └── useNotifications.ts
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── index.ts
│   ├── types/
│   │   ├── database.ts
│   │   └── index.ts
│   └── utils/
│       └── index.ts
├── supabase/
│   ├── functions/
│   │   └── send-reminders/
│   │       └── index.ts       # Edge Function
│   └── sql-scripts/           # All SQL files
│       ├── README.md
│       ├── COMPLETE_SETUP_PAKISTAN.sql
│       ├── CREATE_USER_PROFILES.sql
│       ├── CREATE_NOTIFICATIONS_TABLE.sql
│       ├── INSERT_PAKISTANI_BANKS.sql
│       ├── CRON_JOB_SETUP.sql
│       └── ... (test scripts)
├── .env.local.example
├── package.json
├── tailwind.config.ts
└── DOCUMENTATION.md          # This file
```

---

## 🔐 Environment Variables

### Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Meta WhatsApp API (Edge Function Secrets)
META_ACCESS_TOKEN=your-meta-access-token
META_PHONE_NUMBER_ID=your-phone-number-id
```

### Setting Edge Function Secrets
```bash
supabase secrets set META_ACCESS_TOKEN=your_token
supabase secrets set META_PHONE_NUMBER_ID=your_phone_id
```

---

## 📜 SQL Scripts

All scripts located in: `supabase/sql-scripts/`

### Setup Scripts (Run in Order)

1. **COMPLETE_SETUP_PAKISTAN.sql**
   - Creates all tables, indexes, RLS policies
   - Sets up triggers and functions
   - Pakistan timezone configuration

2. **CREATE_USER_PROFILES.sql**
   - User settings table
   - WhatsApp number storage
   - Timezone settings

3. **CREATE_NOTIFICATIONS_TABLE.sql**
   - Web notifications table
   - RLS policies
   - Indexes

4. **INSERT_PAKISTANI_BANKS.sql**
   - Pakistani banks data
   - HBL, UBL, MCB, Allied, Meezan, etc.

5. **CRON_JOB_SETUP.sql**
   - Supabase cron job
   - Runs every minute
   - Calls send-reminders Edge Function

### Testing Scripts

- **TEST_CREATE_NOTIFICATION.sql** - Create test notification
- **CHECK_NOTIFICATIONS.sql** - View notifications
- **TEST_QUERIES_PAKISTAN.sql** - Comprehensive tests

### Migration Scripts

- **MOVE_WHATSAPP_TO_SETTINGS.sql** - Migrate WhatsApp to user_profiles
- **ADD_WHATSAPP_NUMBER.sql** - Quick WhatsApp setup

---

## 🔧 Troubleshooting

### Notifications Not Showing

**Problem:** Web notifications not appearing

**Solution:**
```sql
-- Run in Supabase SQL Editor
-- 1. Check if table exists
SELECT * FROM notifications LIMIT 5;

-- 2. If error, create table
-- Run: CREATE_NOTIFICATIONS_TABLE.sql

-- 3. Check RLS policies
-- Run: CHECK_NOTIFICATION_RLS.sql

-- 4. Create test notification
-- Run: TEST_CREATE_NOTIFICATION.sql
```

### WhatsApp Reminders Not Sending

**Problem:** No WhatsApp messages received

**Checklist:**
1. ✅ WhatsApp number set in Settings
2. ✅ Edge Function deployed
3. ✅ Secrets configured (META_ACCESS_TOKEN, META_PHONE_NUMBER_ID)
4. ✅ Cron job running
5. ✅ Subscription has reminder_time set
6. ✅ Current time matches reminder_time

**Check Logs:**
```
Supabase Dashboard → Edge Functions → send-reminders → Logs
```

**Test Query:**
```sql
-- Run: TEST_QUERIES_PAKISTAN.sql
```

### Database Connection Issues

**Problem:** Cannot connect to database

**Solution:**
1. Check `.env.local` file exists
2. Verify SUPABASE_URL and ANON_KEY
3. Check Supabase project is active
4. Restart development server

### Edge Function Errors

**Problem:** Edge Function failing

**Check:**
1. Function deployed: `supabase functions list`
2. Secrets set: `supabase secrets list`
3. Logs: Supabase Dashboard → Functions → Logs
4. Redeploy: `supabase functions deploy send-reminders`

---

## 📡 API Reference

### Edge Functions

#### send-reminders
**URL:** `https://your-project.supabase.co/functions/v1/send-reminders`

**Method:** POST (called by cron job)

**Description:** Checks subscriptions and sends WhatsApp reminders

**Response:**
```json
{
  "message": "Reminder check completed",
  "pakistan_time": "2025-10-17 14:30:00",
  "results": {
    "total": 5,
    "sent": 3,
    "failed": 0,
    "skipped": 2,
    "details": [...]
  }
}
```

---

## 🎯 Key Features Explained

### 1. WhatsApp Number in Settings
- **Location:** `/dashboard/settings` → Notifications tab
- **Format:** +92 followed by 10 digits
- **Usage:** One number for all subscriptions
- **Storage:** `user_profiles` table

### 2. Reminder Time Per Subscription
- **Location:** Subscription form
- **Field:** Reminder Time (HH:MM)
- **Default:** 09:00 AM
- **Timezone:** Pakistan (UTC+5)

### 3. Bank Integration
- **Pakistani Banks:** HBL, UBL, MCB, Allied, Meezan, etc.
- **Display:** Shows in reminder message
- **Format:** "💳 Payment Method: Bank Name"

### 4. Website Links
- **Field:** Website URL in subscription
- **Display:** Shows in reminder message
- **Format:** "🌐 Website: https://example.com"

### 5. Dual Notifications
- **WhatsApp:** Mobile notification
- **Web:** In-app notification
- **Message:** Identical on both platforms
- **Timing:** Sent simultaneously

---

## 📊 Database Diagram

```
auth.users
    ↓
user_profiles (WhatsApp number, timezone)
    ↓
subscriptions (service, cost, reminder settings)
    ↓
notifications (WhatsApp reminder logs)

banks → subscriptions (payment method)
categories → subscriptions (organization)
```

---

## 🔄 Workflow

### User Journey
1. Sign up / Login
2. Go to Settings → Set WhatsApp number
3. Create subscription
4. Set reminder days before & time
5. Wait for reminder
6. Receive WhatsApp message
7. See web notification
8. Mark as read

### System Flow
1. Cron job runs every minute
2. Edge Function checks subscriptions
3. Calculates reminder date
4. Checks time match
5. Sends WhatsApp message
6. Creates web notification
7. Updates last_reminder_sent
8. Logs everything

---

## 💡 Tips & Best Practices

### For Users
1. Set WhatsApp number in Settings first
2. Use reminder_days_before wisely (1-7 days recommended)
3. Set reminder_time when you check phone
4. Add bank for better tracking
5. Add website for quick access

### For Developers
1. Always backup before running migrations
2. Test with sample data first
3. Check Edge Function logs regularly
4. Monitor cron job execution
5. Keep secrets secure

---

## 📞 Support

### Common Issues
- Notifications not showing → Run CREATE_NOTIFICATIONS_TABLE.sql
- WhatsApp not sending → Check secrets and logs
- Database errors → Verify RLS policies
- Time mismatch → Check Pakistan timezone (UTC+5)

### Resources
- Supabase Documentation: https://supabase.com/docs
- Meta WhatsApp API: https://developers.facebook.com/docs/whatsapp
- Next.js Documentation: https://nextjs.org/docs

---

## 📝 Changelog

### Latest Updates
- ✅ WhatsApp reminders with bank and website info
- ✅ Web notifications for WhatsApp reminders
- ✅ WhatsApp number moved to user settings
- ✅ Reminder time per subscription
- ✅ SQL scripts organized in dedicated folder
- ✅ Comprehensive documentation

---

## 🎉 Summary

**Subscription Tracker** is a complete subscription management system with:
- 📱 WhatsApp reminders via Meta API
- 💻 Web notifications in real-time
- 🏦 Pakistani banks integration
- 🌍 Pakistan timezone support
- 🔒 Secure with RLS policies
- 📊 Cost analysis and tracking
- ⚡ Automated with Edge Functions

**Everything you need to never miss a payment again!** 🚀

---

**Last Updated:** October 17, 2025  
**Version:** 2.0.0
