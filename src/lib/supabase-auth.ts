import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vkgvgrmfqcpstneyacfi.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
