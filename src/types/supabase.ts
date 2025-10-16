import { Database } from './database';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type SettingsPageProps = {
  user: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};
