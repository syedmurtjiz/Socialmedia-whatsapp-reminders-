-- Check if banks have correct user_id

-- Get your user ID
SELECT id, email FROM auth.users LIMIT 1;

-- Check banks for your user
SELECT 
    id,
    name,
    user_id,
    created_at
FROM banks
WHERE user_id = (SELECT id FROM auth.users LIMIT 1)
ORDER BY name;

-- Count banks for your user
SELECT COUNT(*) as my_banks 
FROM banks 
WHERE user_id = (SELECT id FROM auth.users LIMIT 1);

-- Check all banks (to see if user_id is NULL)
SELECT 
    id,
    name,
    user_id,
    created_at
FROM banks
ORDER BY name
LIMIT 10;
