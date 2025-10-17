-- ============================================
-- ADD WHATSAPP NUMBER TO YOUR PROFILE
-- ============================================
-- Run this to add your WhatsApp number
-- ============================================

-- Check if you have a profile
SELECT 
    id,
    whatsapp_number,
    timezone
FROM public.user_profiles
WHERE id = (SELECT id FROM auth.users LIMIT 1);

-- If you see a row above, update it with your WhatsApp number
-- Replace +923447470874 with your actual number

UPDATE public.user_profiles
SET whatsapp_number = '+923447470874'
WHERE id = (SELECT id FROM auth.users LIMIT 1);

-- Verify it was updated
SELECT 
    '✅ WhatsApp number added!' as message,
    id,
    whatsapp_number,
    timezone
FROM public.user_profiles
WHERE id = (SELECT id FROM auth.users LIMIT 1);
