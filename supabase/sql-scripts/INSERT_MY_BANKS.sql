-- Simple fix: Insert banks using auth.uid() directly
-- This assumes banks.user_id references auth.users(id)

-- Insert banks for the authenticated user
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
        ('Summit Bank'),
        ('Bank of Punjab'),
        ('Bank of Khyber'),
        ('Sindh Bank'),
        ('Dubai Islamic Bank Pakistan'),
        ('MCB Islamic Bank'),
        ('Al Baraka Bank Pakistan'),
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
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

-- Verify
SELECT COUNT(*) as my_banks FROM banks WHERE user_id = auth.uid();

-- Show your banks
SELECT id, name FROM banks WHERE user_id = auth.uid() ORDER BY name;
