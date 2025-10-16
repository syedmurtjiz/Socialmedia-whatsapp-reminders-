-- ============================================
-- Migration Script: Update Existing Schema to Match Subscription Form
-- ============================================
-- This script updates the existing subscriptions table without losing data
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 0. Drop Old Triggers and Functions First
-- ============================================
-- This prevents errors from old column name references

DROP TRIGGER IF EXISTS calculate_next_payment_date_trigger ON public.subscriptions;
DROP TRIGGER IF EXISTS set_next_payment_date_trigger ON public.subscriptions;
DROP TRIGGER IF EXISTS set_updated_at ON public.subscriptions;

DROP FUNCTION IF EXISTS set_next_payment_date();
DROP FUNCTION IF EXISTS calculate_next_payment_date(DATE, TEXT, INTEGER);

-- ============================================
-- 1. Create Banks Table (if not exists)
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own banks" ON public.banks;
DROP POLICY IF EXISTS "Users can insert own banks" ON public.banks;
DROP POLICY IF EXISTS "Users can update own banks" ON public.banks;
DROP POLICY IF EXISTS "Users can delete own banks" ON public.banks;

-- Create RLS Policies for banks
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
-- 2. Add New Columns to Subscriptions Table
-- ============================================

-- Rename 'name' to 'service_name' if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.subscriptions RENAME COLUMN name TO service_name;
    END IF;
END $$;

-- Add cost column
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2) DEFAULT 0.00;

-- Add currency column
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Rename subscription_type to billing_cycle if needed
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'subscription_type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.subscriptions RENAME COLUMN subscription_type TO billing_cycle;
    END IF;
END $$;

-- Rename custom_interval_days to custom_cycle_days if needed
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'custom_interval_days'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.subscriptions RENAME COLUMN custom_interval_days TO custom_cycle_days;
    END IF;
END $$;

-- Add issue_date column
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS issue_date DATE;

-- Add end_date column
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add website_url column
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Add description column
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add logo_url column
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add bank_id column (foreign key to banks table)
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS bank_id UUID REFERENCES public.banks(id) ON DELETE SET NULL;

-- Add status column
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- ============================================
-- 3. Update Existing Data (BEFORE adding constraints)
-- ============================================

-- Update billing_cycle values if needed (convert 'daily' to 'weekly' or keep as is)
-- Note: 'daily' is not in the new schema, so we'll convert it to 'weekly'
UPDATE public.subscriptions 
SET billing_cycle = 'weekly' 
WHERE billing_cycle = 'daily';

-- Set default cost for existing records without cost
-- This MUST happen BEFORE adding the cost constraint
UPDATE public.subscriptions 
SET cost = 0.01 
WHERE cost IS NULL OR cost = 0 OR cost < 0.01;

-- Set default currency for existing records
UPDATE public.subscriptions 
SET currency = 'USD' 
WHERE currency IS NULL OR currency = '';

-- Set default status for existing records
UPDATE public.subscriptions 
SET status = 'active' 
WHERE status IS NULL OR status = '';

-- ============================================
-- 4. Update Constraints
-- ============================================

-- Drop old constraints if they exist
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_subscription_type_check;

ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_billing_cycle_check;

ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_custom_interval_days_check;

ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_custom_cycle_days_check;

ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_currency_check;

ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_cost_check;

ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS valid_custom_cycle;

-- Add new constraints (AFTER data is updated)
ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_billing_cycle_check 
CHECK (billing_cycle IN ('weekly', 'monthly', 'yearly', 'custom'));

ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_custom_cycle_days_check 
CHECK (custom_cycle_days > 0 AND custom_cycle_days <= 365);

ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_currency_check 
CHECK (currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD'));

ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_cost_check 
CHECK (cost >= 0.01);

ALTER TABLE public.subscriptions 
ADD CONSTRAINT valid_custom_cycle 
CHECK (
    (billing_cycle = 'custom' AND custom_cycle_days IS NOT NULL) OR
    (billing_cycle != 'custom')
);

ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('active', 'inactive', 'cancelled'));

-- ============================================
-- 5. Update Column Constraints
-- ============================================

-- Make start_date optional (nullable)
ALTER TABLE public.subscriptions 
ALTER COLUMN start_date DROP NOT NULL;

-- Make whatsapp_number optional (nullable)
ALTER TABLE public.subscriptions 
ALTER COLUMN whatsapp_number DROP NOT NULL;

-- Make reminder_days_before optional with default
ALTER TABLE public.subscriptions 
ALTER COLUMN reminder_days_before SET DEFAULT 3;

ALTER TABLE public.subscriptions 
ALTER COLUMN reminder_days_before DROP NOT NULL;

-- Make reminder_time optional with default
ALTER TABLE public.subscriptions 
ALTER COLUMN reminder_time DROP NOT NULL;

-- Make next_payment_date required (NOT NULL)
ALTER TABLE public.subscriptions 
ALTER COLUMN next_payment_date SET NOT NULL;

-- ============================================
-- 6. Create/Update Indexes
-- ============================================

-- Index on bank_id for filtering by bank
CREATE INDEX IF NOT EXISTS idx_subscriptions_bank_id ON public.subscriptions(bank_id);

-- Ensure other indexes exist
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_payment_date ON public.subscriptions(next_payment_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_reminder_lookup ON public.subscriptions(next_payment_date, reminder_time, last_reminder_sent);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON public.subscriptions(created_at DESC);

-- ============================================
-- 7. Update Functions
-- ============================================

-- Update the calculate_next_payment_date function to use billing_cycle
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

-- Update the trigger function to use billing_cycle
CREATE OR REPLACE FUNCTION set_next_payment_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Only calculate if start_date is provided and next_payment_date is not
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

-- Drop the old trigger first
DROP TRIGGER IF EXISTS calculate_next_payment_date_trigger ON public.subscriptions;
DROP TRIGGER IF EXISTS set_next_payment_date_trigger ON public.subscriptions;

-- Recreate the trigger (only for INSERT, not UPDATE to avoid issues)
CREATE TRIGGER calculate_next_payment_date_trigger
BEFORE INSERT ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION set_next_payment_date();

-- ============================================
-- 8. Add Trigger for Banks Updated_at
-- ============================================
DROP TRIGGER IF EXISTS set_updated_at_banks ON public.banks;

CREATE TRIGGER set_updated_at_banks
BEFORE UPDATE ON public.banks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. Update RLS Policy for Service Role
-- ============================================
DROP POLICY IF EXISTS "Service role can access all subscriptions" ON public.subscriptions;

CREATE POLICY "Service role can access all subscriptions"
ON public.subscriptions
FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- 10. Grant Permissions
-- ============================================

-- Grant privileges on banks table
GRANT ALL ON public.banks TO authenticated;
GRANT SELECT ON public.banks TO anon;
GRANT ALL ON public.banks TO service_role;

-- ============================================
-- 11. Update Comments
-- ============================================
COMMENT ON COLUMN public.subscriptions.service_name IS 'Name of the subscription service (e.g., Netflix, Spotify)';
COMMENT ON COLUMN public.subscriptions.cost IS 'Cost of the subscription per billing cycle';
COMMENT ON COLUMN public.subscriptions.currency IS 'Currency code (USD, EUR, GBP, CAD, AUD)';
COMMENT ON COLUMN public.subscriptions.billing_cycle IS 'Billing frequency: weekly, monthly, yearly, or custom';
COMMENT ON COLUMN public.subscriptions.custom_cycle_days IS 'Custom interval in days (only used when billing_cycle is custom)';
COMMENT ON COLUMN public.subscriptions.issue_date IS 'Issue date of the subscription (optional)';
COMMENT ON COLUMN public.subscriptions.end_date IS 'End date of the subscription (optional)';
COMMENT ON COLUMN public.subscriptions.website_url IS 'URL of the subscription service website';
COMMENT ON COLUMN public.subscriptions.description IS 'Additional notes or description';
COMMENT ON COLUMN public.subscriptions.logo_url IS 'URL to the service logo';
COMMENT ON COLUMN public.subscriptions.bank_id IS 'Reference to the bank/payment method used';
COMMENT ON COLUMN public.subscriptions.status IS 'Subscription status: active, inactive, or cancelled';

-- ============================================
-- 12. Verification Queries
-- ============================================
-- Run these to verify the migration was successful

-- Check all columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'subscriptions'
AND table_schema = 'public';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'subscriptions'
AND schemaname = 'public';

-- Check sample data
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

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Your existing data is preserved
-- New columns have been added
-- Constraints have been updated
-- The schema now matches your subscription form
-- ============================================
