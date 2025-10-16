-- ============================================
-- Add Sample Banks
-- ============================================
-- Run this to add some banks to your account
-- Replace 'YOUR_USER_ID' with your actual user ID
-- ============================================

-- First, get your user ID
-- Run this query to find your user ID:
SELECT id, email FROM auth.users;

-- Then use that ID below (replace the placeholder)

-- ============================================
-- Option 1: Add banks with your user ID
-- ============================================
-- Get the first user and add Pakistani banks
DO $$
DECLARE
  current_user_id UUID;
BEGIN
  SELECT id INTO current_user_id FROM auth.users LIMIT 1;
  
  INSERT INTO public.banks (user_id, name) VALUES
  -- Major Pakistani Banks
  (current_user_id, 'Habib Bank Limited (HBL)'),
  (current_user_id, 'United Bank Limited (UBL)'),
  (current_user_id, 'National Bank of Pakistan (NBP)'),
  (current_user_id, 'MCB Bank Limited'),
  (current_user_id, 'Allied Bank Limited (ABL)'),
  (current_user_id, 'Bank Alfalah Limited'),
  (current_user_id, 'Askari Bank Limited'),
  (current_user_id, 'Habib Metropolitan Bank (HMB)'),
  (current_user_id, 'Soneri Bank Limited'),
  (current_user_id, 'Bank Al-Habib Limited'),
  (current_user_id, 'Faysal Bank Limited'),
  (current_user_id, 'Standard Chartered Bank Pakistan'),
  (current_user_id, 'JS Bank Limited'),
  (current_user_id, 'Silk Bank Limited'),
  (current_user_id, 'Summit Bank Limited'),
  (current_user_id, 'Samba Bank Limited'),
  (current_user_id, 'Sindh Bank Limited'),
  (current_user_id, 'Bank of Punjab (BOP)'),
  (current_user_id, 'Bank of Khyber (BOK)'),
  (current_user_id, 'The Bank of Azad Jammu & Kashmir'),
  
  -- Islamic Banks
  (current_user_id, 'Meezan Bank Limited'),
  (current_user_id, 'Dubai Islamic Bank Pakistan Limited'),
  (current_user_id, 'BankIslami Pakistan Limited'),
  (current_user_id, 'Al Baraka Bank (Pakistan) Limited'),
  (current_user_id, 'MCB Islamic Bank Limited'),
  (current_user_id, 'Faysal Islamic Bank'),
  
  -- Microfinance Banks
  (current_user_id, 'Khushhali Microfinance Bank'),
  (current_user_id, 'Telenor Microfinance Bank (Easypaisa)'),
  (current_user_id, 'U Microfinance Bank Limited'),
  (current_user_id, 'FINCA Microfinance Bank'),
  (current_user_id, 'Mobilink Microfinance Bank (JazzCash)'),
  (current_user_id, 'NRSP Microfinance Bank'),
  (current_user_id, 'Apna Microfinance Bank'),
  (current_user_id, 'Advans Pakistan Microfinance Bank'),
  
  -- Digital/Fintech
  (current_user_id, 'Easypaisa'),
  (current_user_id, 'JazzCash'),
  (current_user_id, 'SadaPay'),
  (current_user_id, 'NayaPay'),
  (current_user_id, 'Finja'),
  (current_user_id, 'Keenu'),
  
  -- Payment Methods
  (current_user_id, 'Credit Card'),
  (current_user_id, 'Debit Card'),
  (current_user_id, 'Cash'),
  
  -- International
  (current_user_id, 'PayPal'),
  (current_user_id, 'Wise (TransferWise)'),
  (current_user_id, 'Western Union'),
  (current_user_id, 'MoneyGram');
  
  RAISE NOTICE 'Pakistani banks added successfully for user: %', current_user_id;
END $$;

-- ============================================
-- Option 2: Add banks using current authenticated user
-- ============================================
-- This works if you're logged in through the app

INSERT INTO public.banks (user_id, name) 
SELECT auth.uid(), name
FROM (VALUES 
    ('Chase Bank'),
    ('Bank of America'),
    ('Wells Fargo'),
    ('Citibank'),
    ('Capital One'),
    ('PayPal'),
    ('Credit Card')
) AS banks(name)
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================
-- Verify banks were added
-- ============================================
SELECT * FROM public.banks WHERE user_id = auth.uid();

-- ============================================
-- Alternative: Add custom bank
-- ============================================
-- Add your own bank name:
-- INSERT INTO public.banks (user_id, name) 
-- VALUES (auth.uid(), 'Your Bank Name');
