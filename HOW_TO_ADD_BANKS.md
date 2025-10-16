# How to Add Banks

## Why "No options" is showing

The banks dropdown shows "No options" because you haven't added any banks to your account yet. Banks are user-specific, so each user needs to create their own banks.

## Quick Fix: Add Banks via SQL

### Step 1: Get Your User ID

In Supabase SQL Editor, run:
```sql
SELECT id, email FROM auth.users;
```

Copy your user ID (it's a UUID like `123e4567-e89b-12d3-a456-426614174000`)

### Step 2: Add Sample Banks

Replace `YOUR_USER_ID` with your actual user ID:

```sql
INSERT INTO public.banks (user_id, name) VALUES
('YOUR_USER_ID', 'Chase Bank'),
('YOUR_USER_ID', 'Bank of America'),
('YOUR_USER_ID', 'Wells Fargo'),
('YOUR_USER_ID', 'Citibank'),
('YOUR_USER_ID', 'PayPal'),
('YOUR_USER_ID', 'Credit Card');
```

### Step 3: Verify

```sql
SELECT * FROM public.banks WHERE user_id = 'YOUR_USER_ID';
```

### Alternative: Use Current User

If you're logged in, you can use this simpler version:

```sql
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
) AS banks(name);
```

## Better Solution: Add Bank Management UI

You should create a bank management page in your app where users can:
- Add new banks
- Edit bank names
- Delete banks

### Quick Implementation:

Create a simple component in your dashboard:

```typescript
// src/components/banks/BankManager.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useBanks } from '@/hooks/useBanks'

export function BankManager() {
  const [newBankName, setNewBankName] = useState('')
  const { user } = useAuth()
  const { banks, loading } = useBanks()

  const addBank = async () => {
    if (!user || !newBankName.trim()) return

    await supabase
      .from('banks')
      .insert([{ user_id: user.id, name: newBankName.trim() }])

    setNewBankName('')
    window.location.reload() // Refresh to show new bank
  }

  return (
    <div>
      <h2>Manage Banks</h2>
      
      <div>
        <input
          type="text"
          value={newBankName}
          onChange={(e) => setNewBankName(e.target.value)}
          placeholder="Bank name"
        />
        <button onClick={addBank}>Add Bank</button>
      </div>

      <ul>
        {banks.map(bank => (
          <li key={bank.id}>{bank.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

## For Now: Quick Test

To test immediately, run this in Supabase SQL Editor:

```sql
-- Get your user ID
DO $$
DECLARE
  current_user_id UUID;
BEGIN
  SELECT id INTO current_user_id FROM auth.users LIMIT 1;
  
  -- Add sample banks
  INSERT INTO public.banks (user_id, name) VALUES
  (current_user_id, 'Chase Bank'),
  (current_user_id, 'Bank of America'),
  (current_user_id, 'Wells Fargo'),
  (current_user_id, 'PayPal'),
  (current_user_id, 'Credit Card');
  
  RAISE NOTICE 'Banks added for user: %', current_user_id;
END $$;
```

Then refresh your app - the banks should appear in the dropdown!

## What I Fixed

I also updated the `useBanks` hook to:
- Filter banks by current user (`.eq('user_id', user.id)`)
- Handle cases when user is not logged in
- Remove the duplicate filtering (not needed)

Now the banks dropdown will only show banks that belong to the logged-in user.
