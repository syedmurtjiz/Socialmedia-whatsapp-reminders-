-- ============================================
-- Drop Old Trigger and Function
-- ============================================
-- Run this BEFORE the migration script
-- This removes the old trigger that references old column names
-- ============================================

-- Drop all existing triggers on subscriptions table
DROP TRIGGER IF EXISTS calculate_next_payment_date_trigger ON public.subscriptions;
DROP TRIGGER IF EXISTS set_next_payment_date_trigger ON public.subscriptions;
DROP TRIGGER IF EXISTS set_updated_at ON public.subscriptions;

-- Drop the old function (it will be recreated by migration)
DROP FUNCTION IF EXISTS set_next_payment_date();
DROP FUNCTION IF EXISTS calculate_next_payment_date(DATE, TEXT, INTEGER);

-- Verify triggers are dropped
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'subscriptions'
AND trigger_schema = 'public';

-- Should return no rows if all triggers are dropped
SELECT 'All old triggers dropped successfully!' as status;
