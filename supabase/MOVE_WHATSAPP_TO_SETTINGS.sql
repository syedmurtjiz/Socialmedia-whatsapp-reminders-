-- ============================================
-- MOVE WHATSAPP NUMBER TO USER SETTINGS
-- ============================================
-- This script moves WhatsApp number from subscriptions table to user metadata
-- One WhatsApp number per user instead of per subscription
-- ============================================

-- ============================================
-- STEP 1: CREATE USER PROFILES TABLE
-- ============================================
-- Store user settings including WhatsApp number
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    whatsapp_number TEXT,
    reminder_time TIME DEFAULT '09:00:00',
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

-- ============================================
-- STEP 2: MIGRATE EXISTING WHATSAPP NUMBERS
-- ============================================
-- Copy WhatsApp numbers from subscriptions to user_profiles
-- Takes the first non-null WhatsApp number for each user

INSERT INTO public.user_profiles (id, whatsapp_number, reminder_time)
SELECT DISTINCT ON (user_id)
    user_id,
    whatsapp_number,
    COALESCE(reminder_time, '09:00:00'::TIME)
FROM public.subscriptions
WHERE whatsapp_number IS NOT NULL 
  AND whatsapp_number != ''
ORDER BY user_id, created_at DESC
ON CONFLICT (id) DO UPDATE
SET 
    whatsapp_number = EXCLUDED.whatsapp_number,
    reminder_time = EXCLUDED.reminder_time;

-- ============================================
-- STEP 3: CREATE PROFILES FOR USERS WITHOUT SUBSCRIPTIONS
-- ============================================
-- Ensure all users have a profile entry

INSERT INTO public.user_profiles (id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 4: REMOVE WHATSAPP FIELDS FROM SUBSCRIPTIONS
-- ============================================
-- Note: We'll keep these fields for now for backward compatibility
-- You can remove them later after confirming everything works

-- Optional: Drop the columns (uncomment when ready)
/*
ALTER TABLE public.subscriptions 
DROP COLUMN IF EXISTS whatsapp_number,
DROP COLUMN IF EXISTS reminder_time;
*/

-- ============================================
-- STEP 5: GRANT PERMISSIONS
-- ============================================
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;
GRANT ALL ON public.user_profiles TO service_role;

-- ============================================
-- STEP 6: ADD COMMENTS
-- ============================================
COMMENT ON TABLE public.user_profiles IS 'Stores user settings including WhatsApp number and preferences';
COMMENT ON COLUMN public.user_profiles.id IS 'User ID (references auth.users)';
COMMENT ON COLUMN public.user_profiles.whatsapp_number IS 'WhatsApp number for all reminders (format: +923XXXXXXXXX)';
COMMENT ON COLUMN public.user_profiles.reminder_time IS 'Default time to send reminders (Pakistan time)';
COMMENT ON COLUMN public.user_profiles.timezone IS 'User timezone (default: Asia/Karachi)';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check user_profiles table
SELECT 
    '✅ User Profiles Created' as message,
    COUNT(*) as total_profiles,
    COUNT(whatsapp_number) as profiles_with_whatsapp
FROM public.user_profiles;

-- List all user profiles
SELECT 
    up.id,
    u.email,
    up.whatsapp_number,
    up.reminder_time,
    up.timezone,
    up.created_at AT TIME ZONE 'Asia/Karachi' as created_at_pakistan
FROM public.user_profiles up
JOIN auth.users u ON u.id = up.id
ORDER BY up.created_at DESC;

-- Check subscriptions count per user
SELECT 
    u.email,
    up.whatsapp_number,
    COUNT(s.id) as subscription_count
FROM public.user_profiles up
JOIN auth.users u ON u.id = up.id
LEFT JOIN public.subscriptions s ON s.user_id = up.id
GROUP BY u.email, up.whatsapp_number
ORDER BY subscription_count DESC;
