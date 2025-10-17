-- Fix: Insert banks for current authenticated user
-- The banks table references 'users' table, not 'auth.users'

-- First, check if you have a record in the users table
SELECT * FROM users WHERE id = auth.uid();

-- If no record exists, create one
INSERT INTO users (id)
SELECT auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid());

-- Now insert banks for the authenticated user
INSERT INTO public.banks (user_id, name) 
SELECT 
    auth.uid(),
    bank_name
FROM (
    VALUES
        ('HBL - Habib Bank Limited'),
        ('UBL - United Bank Limited'),
        ('MCB - Muslim Commercial Bank'),
        ('NBP - National Bank of Pakistan'),
        ('Allied Bank Limited'),
        ('Bank Alfalah'),
        ('Bank Al-Habib'),
        ('Askari Bank'),
        ('Faysal Bank'),
        ('Meezan Bank'),
        ('Standard Chartered Bank Pakistan'),
        ('JS Bank'),
        ('Silk Bank'),
        ('Soneri Bank'),
        ('Dubai Islamic Bank Pakistan'),
        ('MCB Islamic Bank'),
        ('BankIslami Pakistan'),
        ('Easypaisa'),
        ('JazzCash'),
        ('SadaPay'),
        ('NayaPay'),
        ('Credit Card'),
        ('Debit Card'),
        ('Cash'),
        ('Other')
) AS banks(bank_name)
ON CONFLICT DO NOTHING;

-- Verify
SELECT COUNT(*) as my_banks FROM banks WHERE user_id = auth.uid();
