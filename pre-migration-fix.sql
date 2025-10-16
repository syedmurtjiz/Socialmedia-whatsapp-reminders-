-- ============================================
-- Pre-Migration Data Fix Script
-- ============================================
-- Run this FIRST to check and fix any data issues
-- before running the main migration script
-- ============================================

-- ============================================
-- 1. Check Current Table Structure
-- ============================================

-- Check what columns exist
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'subscriptions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- 2. Check for 'daily' billing cycle (not supported in new schema)
-- ============================================

-- Check for 'daily' subscription_type
SELECT 
    id, 
    name, 
    subscription_type,
    'daily billing cycle' as issue
FROM public.subscriptions
WHERE subscription_type = 'daily';

-- ============================================
-- 3. Fix Data Issues (Only what exists)
-- ============================================

-- Convert 'daily' to 'weekly' (since daily is not in new schema)
UPDATE public.subscriptions 
SET subscription_type = 'weekly' 
WHERE subscription_type = 'daily';

-- Note: Cost and currency columns will be added by the migration script
-- and will get default values automatically

-- ============================================
-- 4. Verify Fixes
-- ============================================

-- Check billing cycles
SELECT 
    subscription_type,
    COUNT(*) as count
FROM public.subscriptions
GROUP BY subscription_type;

-- ============================================
-- 5. Summary
-- ============================================
SELECT 
    'Pre-migration check complete! Ready for migration.' as status,
    COUNT(*) as total_subscriptions
FROM public.subscriptions;
