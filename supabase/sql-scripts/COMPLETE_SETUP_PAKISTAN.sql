-- ============================================
-- COMPLETE SUPABASE SETUP FOR PAKISTAN TIMEZONE
-- ============================================
-- This script sets up everything for your subscription tracking app
-- with Pakistan (Islamabad) timezone configuration (UTC+5)
-- 
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: CLEAN UP (if re-running)
-- ============================================
-- Drop existing tables and functions
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.banks CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS calculate_next_payment_date(DATE, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS set_next_payment_date() CASCADE;

-- ============================================
-- STEP 2: CREATE BANKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for banks
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for banks
CREATE POLICY "Users can view own banks"
ON public.banks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own banks"
ON public.banks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own banks"
ON public.banks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own banks"
ON public.banks FOR DELETE
USING (auth.uid() = user_id);

-- Index for banks
CREATE INDEX IF NOT EXISTS idx_banks_user_id ON public.banks(user_id);

-- ============================================
-- STEP 2B: INSERT PAKISTANI BANK NAMES
-- ============================================
-- Insert common Pakistani banks for all users
-- These will be available in the dropdown on the frontend

INSERT INTO public.banks (user_id, name) 
SELECT 
  u.id,
  bank_name
FROM auth.users u
CROSS JOIN (
  VALUES 
    ('HBL - Habib Bank Limited'),
    ('UBL - United Bank Limited'),
    ('MCB - Muslim Commercial Bank'),
    ('NBP - National Bank of Pakistan'),
    ('Allied Bank Limited'),
    ('Bank Alfalah'),
    ('Bank Al-Habib'),
    ('Askari Bank'),
    ('Faysal Bank'),
    ('Meezan Bank'),
    ('Standard Chartered Bank Pakistan'),
    ('JS Bank'),
    ('Silk Bank'),
    ('Soneri Bank'),
    ('Summit Bank'),
    ('Bank of Punjab'),
    ('Bank of Khyber'),
    ('Sindh Bank'),
    ('The Bank of Azad Jammu & Kashmir'),
    ('First Women Bank Limited'),
    ('Industrial Development Bank of Pakistan'),
    ('SME Bank'),
    ('Zarai Taraqiati Bank Limited'),
    ('Dubai Islamic Bank Pakistan'),
    ('MCB Islamic Bank'),
    ('Al Baraka Bank Pakistan'),
    ('BankIslami Pakistan'),
    ('Samba Bank'),
    ('Habib Metropolitan Bank'),
    ('Citibank Pakistan'),
    ('Deutsche Bank Pakistan'),
    ('Industrial and Commercial Bank of China'),
    ('Easypaisa'),
    ('JazzCash'),
    ('SadaPay'),
    ('NayaPay'),
    ('Kuickpay'),
    ('Credit Card'),
    ('Debit Card'),
    ('Cash'),
    ('Other')
) AS banks(bank_name)
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 3: CREATE SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE public.subscriptions (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User Reference (links to Supabase Auth)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Subscription Details
    service_name TEXT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL CHECK (cost >= 0.01),
    currency TEXT NOT NULL DEFAULT 'PKR' CHECK (currency IN ('PKR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD')),
    
    -- Billing Information
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('weekly', 'monthly', 'yearly', 'custom')),
    custom_cycle_days INTEGER CHECK (custom_cycle_days > 0 AND custom_cycle_days <= 365),
    
    -- Dates (stored in UTC but displayed in Pakistan time)
    start_date DATE,
    next_payment_date DATE NOT NULL,
    issue_date DATE,
    end_date DATE,
    
    -- Additional Information
    website_url TEXT,
    description TEXT,
    logo_url TEXT,
    
    -- Bank Reference (optional)
    bank_id UUID REFERENCES public.banks(id) ON DELETE SET NULL,
    
    -- WhatsApp Reminder Settings
    reminder_days_before INTEGER DEFAULT 3 CHECK (reminder_days_before >= 0 AND reminder_days_before <= 30),
    reminder_time TIME DEFAULT '09:00:00',
    whatsapp_number TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'paused')),
    
    -- Tracking
    last_reminder_sent TIMESTAMPTZ,
    
    -- Timestamps (stored in UTC)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_custom_cycle CHECK (
        (billing_cycle = 'custom' AND custom_cycle_days IS NOT NULL) OR
        (billing_cycle != 'custom')
    )
);

-- ============================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ============================================
-- Index on user_id for faster user-specific queries
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Index on next_payment_date for cron job queries
CREATE INDEX idx_subscriptions_next_payment_date ON public.subscriptions(next_payment_date);

-- Composite index for reminder queries (used by cron job)
CREATE INDEX idx_subscriptions_reminder_lookup ON public.subscriptions(next_payment_date, reminder_time, last_reminder_sent);

-- Index on created_at for sorting
CREATE INDEX idx_subscriptions_created_at ON public.subscriptions(created_at DESC);

-- Index on bank_id for filtering by bank
CREATE INDEX idx_subscriptions_bank_id ON public.subscriptions(bank_id);

-- Index on status for filtering active/inactive subscriptions
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- ============================================
-- STEP 5: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: CREATE RLS POLICIES
-- ============================================

-- Policy: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own subscriptions
CREATE POLICY "Users can insert own subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own subscriptions
CREATE POLICY "Users can delete own subscriptions"
ON public.subscriptions
FOR DELETE
USING (auth.uid() = user_id);

-- Policy: Service role can access all subscriptions (for cron jobs)
CREATE POLICY "Service role can access all subscriptions"
ON public.subscriptions
FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- STEP 7: CREATE TRIGGER FOR UPDATED_AT
-- ============================================
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for subscriptions
CREATE TRIGGER set_updated_at_subscriptions
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for banks
CREATE TRIGGER set_updated_at_banks
BEFORE UPDATE ON public.banks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 8: CREATE FUNCTION TO CALCULATE NEXT PAYMENT DATE
-- ============================================
CREATE OR REPLACE FUNCTION calculate_next_payment_date(
    p_start_date DATE,
    p_billing_cycle TEXT,
    p_custom_cycle_days INTEGER DEFAULT NULL
)
RETURNS DATE AS $$
DECLARE
    v_interval_days INTEGER;
    v_today DATE;
    v_days_since_start INTEGER;
    v_intervals_passed INTEGER;
    v_next_date DATE;
BEGIN
    v_today := CURRENT_DATE;
    
    -- If no start date provided, return today + interval
    IF p_start_date IS NULL THEN
        p_start_date := v_today;
    END IF;
    
    -- Determine interval in days based on billing cycle
    CASE p_billing_cycle
        WHEN 'weekly' THEN v_interval_days := 7;
        WHEN 'monthly' THEN v_interval_days := 30;
        WHEN 'yearly' THEN v_interval_days := 365;
        WHEN 'custom' THEN v_interval_days := COALESCE(p_custom_cycle_days, 30);
        ELSE v_interval_days := 30;
    END CASE;
    
    -- If start date is in the future, that's the next payment date
    IF p_start_date > v_today THEN
        RETURN p_start_date;
    END IF;
    
    -- Calculate how many intervals have passed since start date
    v_days_since_start := v_today - p_start_date;
    v_intervals_passed := FLOOR(v_days_since_start / v_interval_days);
    
    -- Calculate next payment date
    v_next_date := p_start_date + ((v_intervals_passed + 1) * v_interval_days);
    
    -- If calculated date is still in the past, add one more interval
    IF v_next_date <= v_today THEN
        v_next_date := v_next_date + v_interval_days;
    END IF;
    
    RETURN v_next_date;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- STEP 9: CREATE TRIGGER TO AUTO-CALCULATE NEXT PAYMENT DATE
-- ============================================
CREATE OR REPLACE FUNCTION set_next_payment_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Only auto-calculate if start_date is provided and next_payment_date is not
    IF NEW.start_date IS NOT NULL AND NEW.next_payment_date IS NULL THEN
        NEW.next_payment_date := calculate_next_payment_date(
            NEW.start_date,
            NEW.billing_cycle,
            NEW.custom_cycle_days
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_next_payment_date_trigger
BEFORE INSERT ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION set_next_payment_date();

-- ============================================
-- STEP 10: GRANT PERMISSIONS
-- ============================================
-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant privileges on subscriptions table
GRANT ALL ON public.subscriptions TO authenticated;
GRANT SELECT ON public.subscriptions TO anon;
GRANT ALL ON public.subscriptions TO service_role;

-- Grant privileges on banks table
GRANT ALL ON public.banks TO authenticated;
GRANT SELECT ON public.banks TO anon;
GRANT ALL ON public.banks TO service_role;

-- ============================================
-- STEP 11: ENABLE EXTENSIONS FOR CRON JOB
-- ============================================
-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net (or http) extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- STEP 12: PAKISTAN TIMEZONE HELPER FUNCTIONS
-- ============================================

-- Function to get current Pakistan time
CREATE OR REPLACE FUNCTION pakistan_now()
RETURNS TIMESTAMPTZ AS $$
BEGIN
    RETURN NOW() AT TIME ZONE 'Asia/Karachi';
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to convert UTC to Pakistan time
CREATE OR REPLACE FUNCTION to_pakistan_time(utc_time TIMESTAMPTZ)
RETURNS TIMESTAMPTZ AS $$
BEGIN
    RETURN utc_time AT TIME ZONE 'Asia/Karachi';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get current Pakistan date
CREATE OR REPLACE FUNCTION pakistan_current_date()
RETURNS DATE AS $$
BEGIN
    RETURN (NOW() AT TIME ZONE 'Asia/Karachi')::DATE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get current Pakistan time (hour and minute)
CREATE OR REPLACE FUNCTION pakistan_current_time()
RETURNS TIME AS $$
BEGIN
    RETURN (NOW() AT TIME ZONE 'Asia/Karachi')::TIME;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- STEP 13: ADD COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE public.subscriptions IS 'Stores user subscription information for tracking and reminder notifications (Pakistan timezone)';
COMMENT ON COLUMN public.subscriptions.id IS 'Unique identifier for the subscription';
COMMENT ON COLUMN public.subscriptions.user_id IS 'Reference to the user who owns this subscription';
COMMENT ON COLUMN public.subscriptions.service_name IS 'Name of the subscription service (e.g., Netflix, Spotify)';
COMMENT ON COLUMN public.subscriptions.cost IS 'Cost of the subscription per billing cycle';
COMMENT ON COLUMN public.subscriptions.currency IS 'Currency code (PKR, USD, EUR, GBP, CAD, AUD)';
COMMENT ON COLUMN public.subscriptions.billing_cycle IS 'Billing frequency: weekly, monthly, yearly, or custom';
COMMENT ON COLUMN public.subscriptions.custom_cycle_days IS 'Custom interval in days (only used when billing_cycle is custom)';
COMMENT ON COLUMN public.subscriptions.start_date IS 'Date when the subscription started (optional)';
COMMENT ON COLUMN public.subscriptions.next_payment_date IS 'Date of the next payment';
COMMENT ON COLUMN public.subscriptions.issue_date IS 'Issue date of the subscription (optional)';
COMMENT ON COLUMN public.subscriptions.end_date IS 'End date of the subscription (optional)';
COMMENT ON COLUMN public.subscriptions.website_url IS 'URL of the subscription service website';
COMMENT ON COLUMN public.subscriptions.description IS 'Additional notes or description';
COMMENT ON COLUMN public.subscriptions.logo_url IS 'URL to the service logo';
COMMENT ON COLUMN public.subscriptions.bank_id IS 'Reference to the bank/payment method used';
COMMENT ON COLUMN public.subscriptions.reminder_days_before IS 'Number of days before payment to send reminder (0-30)';
COMMENT ON COLUMN public.subscriptions.reminder_time IS 'Time of day to send the reminder (Pakistan time)';
COMMENT ON COLUMN public.subscriptions.whatsapp_number IS 'WhatsApp number to send reminders to (format: +923XXXXXXXXX)';
COMMENT ON COLUMN public.subscriptions.status IS 'Subscription status: active, inactive, cancelled, or paused';
COMMENT ON COLUMN public.subscriptions.last_reminder_sent IS 'Timestamp of the last reminder sent (UTC, convert to Pakistan time for display)';
COMMENT ON COLUMN public.subscriptions.created_at IS 'Timestamp when the subscription was created (UTC)';
COMMENT ON COLUMN public.subscriptions.updated_at IS 'Timestamp when the subscription was last updated (UTC)';

COMMENT ON TABLE public.banks IS 'Stores bank/payment method information for users';
COMMENT ON COLUMN public.banks.id IS 'Unique identifier for the bank';
COMMENT ON COLUMN public.banks.user_id IS 'Reference to the user who owns this bank';
COMMENT ON COLUMN public.banks.name IS 'Name of the bank or payment method';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables exist
SELECT 
    '✅ Tables Created' as status,
    table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscriptions', 'banks')
ORDER BY table_name;

-- Check RLS policies
SELECT 
    '✅ RLS Policies' as status,
    tablename, 
    policyname, 
    cmd 
FROM pg_policies 
WHERE tablename IN ('subscriptions', 'banks')
ORDER BY tablename, policyname;

-- Check indexes
SELECT 
    '✅ Indexes' as status,
    indexname, 
    tablename
FROM pg_indexes 
WHERE tablename IN ('subscriptions', 'banks')
ORDER BY tablename, indexname;

-- Check extensions
SELECT 
    '✅ Extensions' as status,
    extname 
FROM pg_extension 
WHERE extname IN ('pg_cron', 'pg_net')
ORDER BY extname;

-- Test Pakistan timezone functions
SELECT 
    '✅ Pakistan Timezone Functions' as status,
    NOW() as utc_time,
    pakistan_now() as pakistan_time,
    pakistan_current_date() as pakistan_date,
    pakistan_current_time() as pakistan_time_only,
    EXTRACT(HOUR FROM pakistan_now()) as pakistan_hour,
    EXTRACT(MINUTE FROM pakistan_now()) as pakistan_minute;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Deploy the Edge Function (see send-reminders/index.ts)
-- 2. Set up the cron job (see CRON_JOB_SETUP.sql)
-- 3. Test with a subscription
-- ============================================
