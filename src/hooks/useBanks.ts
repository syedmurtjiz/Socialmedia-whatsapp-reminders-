import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Bank } from '@/types';

export function useBanks(): { banks: Bank[]; loading: boolean; error: Error | null } {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBanks = async () => {
      if (!user) {
        setBanks([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('banks')
          .select('*')
          .eq('user_id', user.id)
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;
        
        setBanks(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanks();
  }, [user]);

  return { banks, loading, error };
}