-- Test: Create a manual notification to see if it appears in the web app

-- First, get your user ID
SELECT id, email FROM auth.users LIMIT 1;

-- Create a test notification (replace USER_ID with your actual user ID from above)
INSERT INTO notifications (
    user_id,
    subscription_id,
    type,
    title,
    message,
    status,
    created_at
) VALUES (
    (SELECT id FROM auth.users LIMIT 1), -- Your user ID
    NULL, -- No subscription for test
    'whatsapp_reminder',
    'Test WhatsApp Reminder',
    '🔔 Payment Reminder\n\nThis is a test notification to verify the system is working.\n\n💳 Payment Method: Test Bank\n🌐 Website: https://test.com\n\n✅ Please ensure sufficient funds are available.',
    'sent',
    NOW()
);

-- Verify it was created
SELECT 
    id,
    user_id,
    type,
    title,
    LEFT(message, 50) as message_preview,
    status,
    created_at
FROM notifications
WHERE user_id = (SELECT id FROM auth.users LIMIT 1)
ORDER BY created_at DESC
LIMIT 5;
