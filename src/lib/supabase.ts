import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const env = process.env as Record<string, string | undefined>;
const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
const mocksFlag = env.EXPO_PUBLIC_ENABLE_MOCKS === 'true';

export const isMockMode = mocksFlag || !supabaseUrl || !supabaseAnonKey;

export const supabase = createClient<Database>(
  supabaseUrl || 'https://mock.supabase.co',
  supabaseAnonKey || 'mock-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);

export function createInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
