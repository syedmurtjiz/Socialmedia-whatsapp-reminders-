-- Step 1: Create user record in users table
INSERT INTO public.users (id)
VALUES ('7b714ce0-b622-45de-8f4a-3e0b79b018bd')
ON CONFLICT (id) DO NOTHING;

-- Verify user created
SELECT * FROM users WHERE id = '7b714ce0-b622-45de-8f4a-3e0b79b018bd';

-- Step 2: Now insert banks
INSERT INTO public.banks (user_id, name) 
VALUES
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'HBL - Habib Bank Limited'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'UBL - United Bank Limited'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'MCB - Muslim Commercial Bank'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'NBP - National Bank of Pakistan'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Allied Bank Limited'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Bank Alfalah'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Bank Al-Habib'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Askari Bank'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Faysal Bank'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Meezan Bank'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Standard Chartered Bank Pakistan'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'JS Bank'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Silk Bank'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Soneri Bank'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Summit Bank'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Bank of Punjab'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Bank of Khyber'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Sindh Bank'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Dubai Islamic Bank Pakistan'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'MCB Islamic Bank'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Al Baraka Bank Pakistan'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'BankIslami Pakistan'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Easypaisa'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'JazzCash'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'SadaPay'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'NayaPay'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Credit Card'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Debit Card'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Cash'),
    ('7b714ce0-b622-45de-8f4a-3e0b79b018bd', 'Other')
ON CONFLICT DO NOTHING;

-- Verify banks inserted
SELECT COUNT(*) as my_banks 
FROM banks 
WHERE user_id = '7b714ce0-b622-45de-8f4a-3e0b79b018bd';

-- Show all your banks
SELECT id, name 
FROM banks 
WHERE user_id = '7b714ce0-b622-45de-8f4a-3e0b79b018bd'
ORDER BY name
LIMIT 10;
