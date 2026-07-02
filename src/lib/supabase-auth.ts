import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vkgvgrmfqcpstneyacfi.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/** Supabase client for auth — only usable when NEXT_PUBLIC_SUPABASE_ANON_KEY is set */
export const supabaseAuth: SupabaseClient = SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : (null as unknown as SupabaseClient); // Will fail gracefully in components that check
