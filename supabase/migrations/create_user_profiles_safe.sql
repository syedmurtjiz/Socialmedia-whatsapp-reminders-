-- ============================================
-- CREATE USER_PROFILES TABLE (SAFE VERSION)
-- ============================================
-- This version safely handles existing objects
-- and won't error if table/policies already exist

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;

-- Create user_profiles table (only if it doesn't exist)
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

-- Add comments
COMMENT ON TABLE public.user_profiles IS 'User-level settings and preferences';
COMMENT ON COLUMN public.user_profiles.id IS 'User ID from auth.users';
COMMENT ON COLUMN public.user_profiles.whatsapp_number IS 'WhatsApp number with country code (e.g., +923001234567)';
COMMENT ON COLUMN public.user_profiles.reminder_time IS 'Default time for reminders';
COMMENT ON COLUMN public.user_profiles.timezone IS 'User timezone';

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (fresh)
CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
ON public.user_profiles
FOR DELETE
USING (auth.uid() = id);

-- Create index for faster lookups (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);

-- Create trigger for updated_at (drop and recreate to ensure it's correct)
DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON public.user_profiles;

-- Ensure the function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER set_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;
GRANT ALL ON public.user_profiles TO service_role;

-- ============================================
-- MIGRATE EXISTING DATA
-- ============================================
-- This will create user_profiles for all existing users
-- and populate WhatsApp numbers from subscriptions if available

-- Insert user profiles for all users who don't have one yet
INSERT INTO public.user_profiles (id, whatsapp_number, timezone, created_at, updated_at)
SELECT DISTINCT
    u.id,
    NULL as whatsapp_number,  -- Will be populated from subscriptions next
    COALESCE(u.raw_user_meta_data->>'timezone', 'Asia/Karachi') as timezone,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- Update user_profiles with WhatsApp numbers from subscriptions
-- (Takes the first non-null WhatsApp number found for each user)
UPDATE public.user_profiles up
SET whatsapp_number = sub.whatsapp_number
FROM (
    SELECT DISTINCT ON (user_id)
        user_id,
        whatsapp_number
    FROM public.subscriptions
    WHERE whatsapp_number IS NOT NULL
    ORDER BY user_id, created_at DESC
) sub
WHERE up.id = sub.user_id
AND up.whatsapp_number IS NULL;

-- ============================================
-- VERIFICATION
-- ============================================
-- Show summary of what was created/updated
SELECT 
    'user_profiles table' as object,
    'Created/Verified' as status,
    COUNT(*) as total_profiles
FROM public.user_profiles;

SELECT 
    'Profiles with WhatsApp' as metric,
    COUNT(*) as count
FROM public.user_profiles
WHERE whatsapp_number IS NOT NULL;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ user_profiles table setup complete!' as message;
