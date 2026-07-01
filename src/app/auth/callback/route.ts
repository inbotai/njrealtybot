import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient(
      'https://vkgvgrmfqcpstneyacfi.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to MyHome Log after successful auth
  return NextResponse.redirect(new URL('/my-home/log', request.url));
}
