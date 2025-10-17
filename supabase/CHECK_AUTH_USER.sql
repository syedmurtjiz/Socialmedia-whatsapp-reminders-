-- Check if you exist in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE id = '7b714ce0-b622-45de-8f4a-3e0b79b018bd';

-- Check all auth users
SELECT id, email FROM auth.users;

-- If the user doesn't exist in auth.users, that's the problem!
-- The users table has a foreign key to auth.users
-- So you must exist in auth.users first
