-- ============================================
-- INSERT PAKISTANI BANK NAMES
-- ============================================
-- Run this to add Pakistani banks for existing users
-- This will create bank entries for all registered users
-- ============================================

-- Insert Pakistani banks for all existing users
INSERT INTO public.banks (user_id, name) 
SELECT 
  u.id,
  bank_name
FROM auth.users u
CROSS JOIN (
  VALUES 
    -- Major Pakistani Banks
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
    ('The Bank of Azad Jammu & Kashmir'),
    ('First Women Bank Limited'),
    
    -- Specialized Banks
    ('Industrial Development Bank of Pakistan'),
    ('SME Bank'),
    ('Zarai Taraqiati Bank Limited'),
    
    -- Islamic Banks
    ('Dubai Islamic Bank Pakistan'),
    ('MCB Islamic Bank'),
    ('Al Baraka Bank Pakistan'),
    ('BankIslami Pakistan'),
    
    -- Foreign Banks
    ('Samba Bank'),
    ('Habib Metropolitan Bank'),
    ('Citibank Pakistan'),
    ('Deutsche Bank Pakistan'),
    ('Industrial and Commercial Bank of China'),
    
    -- Digital Payment Methods
    ('Easypaisa'),
    ('JazzCash'),
    ('SadaPay'),
    ('NayaPay'),
    ('Kuickpay'),
    
    -- Other Payment Methods
    ('Credit Card'),
    ('Debit Card'),
    ('Cash'),
    ('Other')
) AS banks(bank_name)
ON CONFLICT DO NOTHING;

-- Verify banks were inserted
SELECT 
    '✅ Banks Inserted Successfully!' as message,
    COUNT(DISTINCT name) as total_unique_banks,
    COUNT(*) as total_bank_entries,
    COUNT(DISTINCT user_id) as users_with_banks
FROM public.banks;

-- List all banks for current user (if running from authenticated context)
SELECT 
    id,
    name,
    created_at AT TIME ZONE 'Asia/Karachi' as created_at_pakistan
FROM public.banks
WHERE user_id = auth.uid()
ORDER BY name;
