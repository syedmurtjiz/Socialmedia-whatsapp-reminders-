-- ============================================
-- BETTER APPROACH: SHARED BANKS FOR ALL USERS
-- ============================================
-- Instead of each user having their own copy of banks,
-- all users share the same bank list.
-- This is more efficient and easier to maintain.
-- ============================================

-- Step 1: Clean up existing banks table
-- Option A: Drop and recreate (RECOMMENDED for fresh start)
DROP TABLE IF EXISTS public.banks CASCADE;

-- Option B: Keep existing and remove duplicates (uncomment if needed)
-- DELETE FROM public.banks a USING public.banks b
-- WHERE a.id > b.id AND a.name = b.name;

-- Step 2: Create new banks table WITHOUT user_id
CREATE TABLE IF NOT EXISTS public.banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add unique constraint on name
CREATE UNIQUE INDEX IF NOT EXISTS banks_name_unique_idx ON public.banks(name);

-- Enable RLS
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view banks" ON public.banks;
DROP POLICY IF EXISTS "Only admins can modify banks" ON public.banks;

-- RLS Policy: Everyone can read banks
CREATE POLICY "Anyone can view banks"
ON public.banks FOR SELECT
TO authenticated, anon
USING (true);

-- RLS Policy: Only service role can modify
CREATE POLICY "Only admins can modify banks"
ON public.banks FOR ALL
TO service_role
USING (true);

-- Grant permissions
GRANT SELECT ON public.banks TO authenticated;
GRANT SELECT ON public.banks TO anon;
GRANT ALL ON public.banks TO service_role;

-- Step 3: Add unique constraint on name (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'banks_name_key'
    ) THEN
        ALTER TABLE public.banks ADD CONSTRAINT banks_name_key UNIQUE (name);
    END IF;
END $$;

-- Step 4: Insert Pakistani banks (ONCE, shared by all users)
INSERT INTO public.banks (name) 
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
    ('Dubai Islamic Bank Pakistan'),
    ('MCB Islamic Bank'),
    ('Al Baraka Bank Pakistan'),
    ('BankIslami Pakistan'),
    ('Easypaisa'),
    ('JazzCash'),
    ('SadaPay'),
    ('NayaPay'),
    ('Credit Card'),
    ('Debit Card'),
    ('Cash'),
    ('Other')
ON CONFLICT (name) DO NOTHING;

-- Step 4: Verify
SELECT 
    '✅ Shared banks setup complete!' as message,
    COUNT(*) as total_banks
FROM public.banks;

-- Show all banks
SELECT id, name FROM public.banks ORDER BY name;

-- ============================================
-- BENEFITS OF THIS APPROACH:
-- ============================================
-- ✅ Only 30 bank records total (not 30 × number of users)
-- ✅ All users see the same banks
-- ✅ Easy to add/remove banks globally
-- ✅ Much faster queries
-- ✅ Less database storage
-- ✅ No need for triggers or user-specific setup
-- ============================================
