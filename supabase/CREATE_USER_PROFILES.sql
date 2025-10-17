-- ============================================
-- CREATE USER PROFILES TABLE
-- ============================================
-- Run this in Supabase SQL Editor to create the user_profiles table
-- ============================================

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    whatsapp_number TEXT,
    timezone TEXT DEFAULT 'Asia/Karachi',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Service role can access all profiles"
ON public.user_profiles FOR ALL
USING (auth.role() = 'service_role');

-- Index
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);

-- Trigger for updated_at
CREATE TRIGGER set_updated_at_user_profiles
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;
GRANT ALL ON public.user_profiles TO service_role;

-- Create profiles for existing users
INSERT INTO public.user_profiles (id, timezone)
SELECT id, 'Asia/Karachi'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT 
    '✅ user_profiles table created successfully!' as message,
    COUNT(*) as total_profiles
FROM public.user_profiles;
