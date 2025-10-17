-- Check RLS policies on notifications table

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'notifications';

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'notifications';

-- If no policies exist, create them
-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY IF NOT EXISTS "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Service role can insert notifications
CREATE POLICY IF NOT EXISTS "Service role can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- Policy: Users can update their own notifications
CREATE POLICY IF NOT EXISTS "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own notifications
CREATE POLICY IF NOT EXISTS "Users can delete own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- Verify policies were created
SELECT policyname, cmd 
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'notifications';
