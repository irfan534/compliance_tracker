// This file provides a Supabase client for Server Components and Server Actions
// that respects Row Level Security (RLS) by using the user's session cookies.
// It should be used for all data operations that require RLS enforcement.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerClientWithRLS() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // `cookies().set()` can only be called in a Server Action or Route Handler.
        // These are safe to ignore if only reading cookies in a Server Component.
        set() {},
        remove() {},
      },
    },
  );
}