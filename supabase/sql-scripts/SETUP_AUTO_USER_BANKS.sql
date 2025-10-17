-- ============================================
-- AUTOMATIC USER AND BANKS SETUP FOR ALL USERS
-- ============================================
-- This script sets up automatic triggers so that:
-- 1. When a new user signs up, they automatically get a user record
-- 2. When a user record is created, they automatically get all banks
-- ============================================

-- Step 1: Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- RLS Policies
CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Step 2: Create function to insert banks for a user
CREATE OR REPLACE FUNCTION public.insert_banks_for_user(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.banks (user_id, name)
  SELECT 
    user_id_param,
    bank_name
  FROM (
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
  ) AS banks(bank_name)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Step 3: Create trigger function to auto-create user record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert user record
  INSERT INTO public.users (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert banks for the user
  PERFORM insert_banks_for_user(NEW.id);
  
  RETURN NEW;
END;
$$;

-- Step 4: Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Backfill existing users (run once)
-- Create user records for all existing auth users
INSERT INTO public.users (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Insert banks for all existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    PERFORM insert_banks_for_user(user_record.id);
  END LOOP;
END $$;

-- Step 6: Verify
SELECT 
  'Setup Complete!' as message,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(DISTINCT user_id) FROM banks) as users_with_banks,
  (SELECT COUNT(*) FROM banks) as total_banks;

-- Show sample data
SELECT 
  u.id,
  (SELECT email FROM auth.users WHERE id = u.id) as email,
  COUNT(b.id) as bank_count
FROM users u
LEFT JOIN banks b ON b.user_id = u.id
GROUP BY u.id
LIMIT 5;
