-- FINAL FIX: Using correct user ID (fb714ce0...)

-- Step 1: Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- RLS Policies
CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Step 2: Insert YOUR user record (CORRECT ID: fb714ce0...)
INSERT INTO public.users (id)
VALUES ('fb714ce0-b622-45de-8f4a-3e0b79b018bd')
ON CONFLICT (id) DO NOTHING;

-- Verify user created
SELECT * FROM users WHERE id = 'fb714ce0-b622-45de-8f4a-3e0b79b018bd';

-- Step 3: Insert banks for YOUR user
INSERT INTO public.banks (user_id, name) 
VALUES
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'HBL - Habib Bank Limited'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'UBL - United Bank Limited'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'MCB - Muslim Commercial Bank'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'NBP - National Bank of Pakistan'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Allied Bank Limited'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Bank Alfalah'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Bank Al-Habib'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Askari Bank'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Faysal Bank'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Meezan Bank'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Standard Chartered Bank Pakistan'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'JS Bank'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Silk Bank'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Soneri Bank'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Summit Bank'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Bank of Punjab'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Bank of Khyber'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Sindh Bank'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Dubai Islamic Bank Pakistan'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'MCB Islamic Bank'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Al Baraka Bank Pakistan'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'BankIslami Pakistan'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Easypaisa'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'JazzCash'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'SadaPay'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'NayaPay'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Credit Card'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Debit Card'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Cash'),
    ('fb714ce0-b622-45de-8f4a-3e0b79b018bd', 'Other')
ON CONFLICT DO NOTHING;

-- Step 4: Verify everything
SELECT COUNT(*) as my_banks 
FROM banks 
WHERE user_id = 'fb714ce0-b622-45de-8f4a-3e0b79b018bd';

-- Show your banks
SELECT id, name 
FROM banks 
WHERE user_id = 'fb714ce0-b622-45de-8f4a-3e0b79b018bd'
ORDER BY name
LIMIT 10;
