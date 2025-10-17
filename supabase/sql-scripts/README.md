# 📁 SQL Scripts Directory

This folder contains all SQL scripts for setting up and managing the subscription tracking system.

---

## 📋 **Setup Scripts (Run in Order)**

### **1. Core Setup**
- **`COMPLETE_SETUP_PAKISTAN.sql`** - Complete database setup for Pakistan
  - Creates all tables, indexes, RLS policies
  - Sets up triggers and functions
  - Configures for Pakistan timezone
  - **Run this first for new setup**

### **2. User Profiles**
- **`CREATE_USER_PROFILES.sql`** - Create user_profiles table
  - Stores WhatsApp number per user
  - Timezone settings
  - RLS policies
  - **Run if user_profiles table doesn't exist**

### **3. Notifications**
- **`CREATE_NOTIFICATIONS_TABLE.sql`** - Create notifications table
  - Stores web notifications
  - WhatsApp reminder logs
  - RLS policies
  - **Run if notifications table doesn't exist**

### **4. Banks Data**
- **`INSERT_PAKISTANI_BANKS.sql`** - Insert Pakistani banks
  - HBL, UBL, MCB, Allied, Meezan, etc.
  - Bank names and logos
  - **Run to populate banks**

### **5. Cron Job**
- **`CRON_JOB_SETUP.sql`** - Setup Supabase cron job
  - Runs every minute
  - Calls send-reminders Edge Function
  - **Run to enable automatic reminders**

---

## 🔧 **Configuration Scripts**

### **WhatsApp Settings**
- **`MOVE_WHATSAPP_TO_SETTINGS.sql`** - Migrate WhatsApp to user settings
  - Moves WhatsApp number from subscriptions to user_profiles
  - Data migration included
  - **Run if migrating from old schema**

- **`ADD_WHATSAPP_NUMBER.sql`** - Add WhatsApp number manually
  - Quick script to set WhatsApp number
  - **Run to add your number via SQL**

---

## 🧪 **Testing Scripts**

### **Test Queries**
- **`TEST_QUERIES_PAKISTAN.sql`** - Comprehensive test queries
  - Check subscriptions
  - Verify reminders
  - Test calculations
  - Debug queries

### **Test Notifications**
- **`TEST_CREATE_NOTIFICATION.sql`** - Create test notification
  - Manual notification creation
  - Verify notification system
  - **Run to test notifications**

- **`CHECK_NOTIFICATIONS.sql`** - Check notifications
  - View all notifications
  - Check notification structure
  - **Run to verify notifications exist**

- **`CHECK_NOTIFICATION_RLS.sql`** - Check notification RLS
  - Verify RLS policies
  - Check permissions
  - **Run if notifications not showing**

---

## 🚀 **Quick Start Guide**

### **For New Setup:**
```sql
1. Run: COMPLETE_SETUP_PAKISTAN.sql
2. Run: CREATE_USER_PROFILES.sql
3. Run: CREATE_NOTIFICATIONS_TABLE.sql
4. Run: INSERT_PAKISTANI_BANKS.sql
5. Run: CRON_JOB_SETUP.sql
6. Run: ADD_WHATSAPP_NUMBER.sql (add your number)
```

### **For Testing:**
```sql
1. Run: TEST_CREATE_NOTIFICATION.sql
2. Run: CHECK_NOTIFICATIONS.sql
3. Run: TEST_QUERIES_PAKISTAN.sql
```

---

## 📝 **Script Descriptions**

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `COMPLETE_SETUP_PAKISTAN.sql` | Full database setup | Initial setup |
| `CREATE_USER_PROFILES.sql` | User settings table | If table missing |
| `CREATE_NOTIFICATIONS_TABLE.sql` | Notifications table | If table missing |
| `INSERT_PAKISTANI_BANKS.sql` | Add bank data | Populate banks |
| `CRON_JOB_SETUP.sql` | Enable auto reminders | Setup cron job |
| `MOVE_WHATSAPP_TO_SETTINGS.sql` | Migrate WhatsApp | Schema migration |
| `ADD_WHATSAPP_NUMBER.sql` | Set WhatsApp number | Quick setup |
| `TEST_CREATE_NOTIFICATION.sql` | Test notification | Testing |
| `CHECK_NOTIFICATIONS.sql` | View notifications | Debugging |
| `CHECK_NOTIFICATION_RLS.sql` | Check RLS policies | Troubleshooting |
| `TEST_QUERIES_PAKISTAN.sql` | Test all features | Comprehensive testing |

---

## 🔍 **Troubleshooting**

### **Notifications not showing?**
1. Run: `CHECK_NOTIFICATION_RLS.sql`
2. Run: `CREATE_NOTIFICATIONS_TABLE.sql`
3. Run: `TEST_CREATE_NOTIFICATION.sql`

### **WhatsApp reminders not working?**
1. Run: `TEST_QUERIES_PAKISTAN.sql`
2. Check Edge Function logs
3. Verify WhatsApp number in user_profiles

### **Missing tables?**
1. Run: `COMPLETE_SETUP_PAKISTAN.sql`
2. Run individual CREATE scripts as needed

---

## 📊 **Database Schema**

### **Main Tables:**
- `subscriptions` - User subscriptions
- `user_profiles` - User settings (WhatsApp, timezone)
- `notifications` - Web notifications
- `banks` - Pakistani banks
- `categories` - Subscription categories

### **Key Features:**
- ✅ Row Level Security (RLS)
- ✅ Automatic timestamps
- ✅ Foreign key constraints
- ✅ Indexes for performance
- ✅ Triggers for updates

---

## 💡 **Tips**

1. **Always backup** before running migration scripts
2. **Run scripts in order** for new setup
3. **Check logs** after running scripts
4. **Test with sample data** before production
5. **Use Supabase SQL Editor** for running scripts

---

## 📚 **Documentation**

For detailed guides, see:
- `../QUICK_START.md` - Quick start guide
- `../WHATSAPP_IN_SETTINGS_GUIDE.md` - WhatsApp setup
- `../WEB_NOTIFICATIONS_GUIDE.md` - Notifications guide

---

**Last Updated:** October 17, 2025
