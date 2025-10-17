-- Check if notifications table exists and has data
SELECT * FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;

-- Check notifications for your user
SELECT 
    n.*,
    s.service_name
FROM notifications n
LEFT JOIN subscriptions s ON n.subscription_id = s.id
WHERE n.user_id = (SELECT id FROM auth.users LIMIT 1)
ORDER BY n.created_at DESC;

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
