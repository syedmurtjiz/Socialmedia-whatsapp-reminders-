-- Check if subscription has bank_id

-- Check your Spotify subscription
SELECT 
    id,
    service_name,
    bank_id,
    website_url,
    next_payment_date,
    reminder_days_before,
    reminder_time
FROM subscriptions
WHERE service_name = 'Spotify'
ORDER BY created_at DESC
LIMIT 1;

-- Check if bank exists
SELECT * FROM banks WHERE id = (
    SELECT bank_id FROM subscriptions WHERE service_name = 'Spotify' LIMIT 1
);

-- If bank_id is NULL, you need to update it
-- UPDATE subscriptions 
-- SET bank_id = (SELECT id FROM banks WHERE name LIKE '%HBL%' LIMIT 1)
-- WHERE service_name = 'Spotify';
