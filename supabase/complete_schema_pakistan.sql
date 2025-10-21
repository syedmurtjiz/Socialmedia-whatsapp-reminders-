-- ============================================
-- COMPLETE DATABASE SCHEMA FOR SUBSCRIPTION TRACKER
-- Optimized for Pakistan Timezone (UTC+5)
-- ============================================

-- ============================================
-- SECTION 1: ENABLE REQUIRED EXTENSIONS
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_cron for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http;

-- ============================================
-- SECTION 2: CREATE TABLES
-- ============================================

-- --------------------------------------------
-- Table: user_profiles
-- Purpose: Store user-specific settings and preferences
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  whatsapp_number TEXT,
  reminder_time TIME DEFAULT '09:00:00',
  timezone TEXT DEFAULT 'Asia/Karachi',
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment for clarity
COMMENT ON TABLE public.user_profiles IS 'User profile settings including WhatsApp number and notification preferences';
COMMENT ON COLUMN public.user_profiles.whatsapp_number IS 'Format: +923001234567 (with country code)';
COMMENT ON COLUMN public.user_profiles.reminder_time IS 'Default reminder time in Pakistan timezone (HH:MM:SS)';

-- --------------------------------------------
-- Table: banks
-- Purpose: Store payment methods/banks (shared across all users)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.banks IS 'Shared bank/payment method list for all users';

-- --------------------------------------------
-- Table: subscriptions
-- Purpose: Store user subscription data
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  cost DECIMAL(10, 2) NOT NULL CHECK (cost >= 0),
  currency TEXT DEFAULT 'PKR' CHECK (currency IN ('PKR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly', 'weekly', 'custom')),
  custom_cycle_days INTEGER CHECK (custom_cycle_days > 0),
  next_payment_date DATE NOT NULL,
  last_payment_date DATE,
  start_date DATE,
  issue_date DATE,
  end_date DATE,
  trial_end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'paused')),
  bank_id UUID REFERENCES public.banks(id) ON DELETE SET NULL,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  is_shared BOOLEAN DEFAULT false,
  
  -- WhatsApp Reminder Fields
  reminder_days_before INTEGER DEFAULT 1 CHECK (reminder_days_before >= 0),
  reminder_time TIME DEFAULT '09:00:00',
  whatsapp_number TEXT,
  last_reminder_sent TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.subscriptions IS 'User subscriptions with WhatsApp reminder configuration';
COMMENT ON COLUMN public.subscriptions.service_name IS 'Name of the subscription service (e.g., Netflix, Spotify)';
COMMENT ON COLUMN public.subscriptions.next_payment_date IS 'Next payment date in YYYY-MM-DD format';
COMMENT ON COLUMN public.subscriptions.reminder_days_before IS 'Days before payment to send reminder (0 = same day)';
COMMENT ON COLUMN public.subscriptions.reminder_time IS 'Time to send reminder in Pakistan timezone (HH:MM:SS)';
COMMENT ON COLUMN public.subscriptions.last_reminder_sent IS 'Timestamp of last reminder sent (prevents duplicates)';

-- --------------------------------------------
-- Table: notifications
-- Purpose: Store notification history
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'whatsapp_reminder' CHECK (type IN ('whatsapp_reminder', 'email_reminder', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  whatsapp_number TEXT,
  whatsapp_message_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  error_message TEXT,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.notifications IS 'Notification history for tracking WhatsApp and other reminders';

-- ============================================
-- SECTION 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_whatsapp ON public.user_profiles(whatsapp_number) WHERE whatsapp_number IS NOT NULL;

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_payment ON public.subscriptions(next_payment_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_bank_id ON public.subscriptions(bank_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_reminder_check ON public.subscriptions(status, next_payment_date, reminder_days_before) WHERE status = 'active';

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_subscription_id ON public.notifications(subscription_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Banks indexes
CREATE INDEX IF NOT EXISTS idx_banks_name ON public.banks(name);

-- ============================================
-- SECTION 4: CREATE FUNCTIONS
-- ============================================

-- --------------------------------------------
-- Function: update_updated_at_column
-- Purpose: Automatically update updated_at timestamp
-- --------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Function: create_user_profile
-- Purpose: Automatically create user profile on signup
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, timezone)
  VALUES (NEW.id, 'Asia/Karachi')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SECTION 5: CREATE TRIGGERS
-- ============================================

-- Trigger for user_profiles updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for subscriptions updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for notifications updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for banks updated_at
DROP TRIGGER IF EXISTS update_banks_updated_at ON public.banks;
CREATE TRIGGER update_banks_updated_at
  BEFORE UPDATE ON public.banks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_profile();

-- ============================================
-- SECTION 6: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------
-- RLS Policies for user_profiles
-- --------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- --------------------------------------------
-- RLS Policies for banks (shared, read-only for users)
-- --------------------------------------------
DROP POLICY IF EXISTS "Banks are viewable by all authenticated users" ON public.banks;
CREATE POLICY "Banks are viewable by all authenticated users"
  ON public.banks FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role can manage banks
DROP POLICY IF EXISTS "Service role can manage banks" ON public.banks;
CREATE POLICY "Service role can manage banks"
  ON public.banks FOR ALL
  USING (auth.role() = 'service_role');

-- --------------------------------------------
-- RLS Policies for subscriptions
-- --------------------------------------------
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update own subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can delete own subscriptions"
  ON public.subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can access all subscriptions (for cron job)
DROP POLICY IF EXISTS "Service role can access all subscriptions" ON public.subscriptions;
CREATE POLICY "Service role can access all subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- --------------------------------------------
-- RLS Policies for notifications
-- --------------------------------------------
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can manage all notifications
DROP POLICY IF EXISTS "Service role can manage notifications" ON public.notifications;
CREATE POLICY "Service role can manage notifications"
  ON public.notifications FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- SECTION 7: INSERT DEFAULT DATA
-- ============================================

-- Insert common Pakistani banks
INSERT INTO public.banks (name) VALUES
  ('HBL'),
  ('UBL'),
  ('MCB'),
  ('Allied Bank'),
  ('Bank Alfalah'),
  ('Meezan Bank'),
  ('Faysal Bank'),
  ('Standard Chartered'),
  ('JS Bank'),
  ('Askari Bank'),
  ('Bank Al Habib'),
  ('Soneri Bank'),
  ('Silk Bank'),
  ('Summit Bank'),
  ('EasyPaisa'),
  ('JazzCash'),
  ('SadaPay'),
  ('NayaPay'),
  ('Cash'),
  ('Credit Card'),
  ('Debit Card')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SECTION 8: HELPER VIEWS FOR DEBUGGING
-- ============================================

-- View to check reminders with Pakistan time
CREATE OR REPLACE VIEW public.v_reminders_pakistan AS
SELECT 
  s.id,
  s.service_name,
  s.next_payment_date,
  s.reminder_days_before,
  s.reminder_time,
  s.last_reminder_sent,
  up.whatsapp_number,
  s.status,
  -- Calculate reminder date
  (s.next_payment_date - (s.reminder_days_before || ' days')::INTERVAL)::DATE as reminder_date,
  -- Current Pakistan time
  (NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Karachi')::TIMESTAMP as pakistan_now,
  -- Check if today is reminder date
  (s.next_payment_date - (s.reminder_days_before || ' days')::INTERVAL)::DATE = CURRENT_DATE as is_reminder_date_today,
  -- Check if reminder already sent today
  CASE 
    WHEN s.last_reminder_sent IS NULL THEN false
    WHEN (s.last_reminder_sent AT TIME ZONE 'Asia/Karachi')::DATE = CURRENT_DATE THEN true
    ELSE false
  END as already_sent_today
FROM public.subscriptions s
LEFT JOIN public.user_profiles up ON s.user_id = up.id
WHERE s.status = 'active'
ORDER BY s.next_payment_date;

COMMENT ON VIEW public.v_reminders_pakistan IS 'Helper view to debug reminders with Pakistan timezone';

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📊 Tables created: user_profiles, banks, subscriptions, notifications';
  RAISE NOTICE '🔐 Row Level Security (RLS) enabled on all tables';
  RAISE NOTICE '⚡ Indexes created for performance optimization';
  RAISE NOTICE '🔄 Triggers created for automatic timestamp updates';
  RAISE NOTICE '🏦 Default Pakistani banks inserted';
  RAISE NOTICE '🇵🇰 Timezone configured: Asia/Karachi (UTC+5)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Deploy Edge Function: supabase functions deploy send-reminders';
  RAISE NOTICE '2. Set secrets: supabase secrets set META_WHATSAPP_ACCESS_TOKEN=xxx';
  RAISE NOTICE '3. Set secrets: supabase secrets set META_PHONE_NUMBER_ID=xxx';
  RAISE NOTICE '4. Create cron job in Supabase Dashboard';
END $$;
