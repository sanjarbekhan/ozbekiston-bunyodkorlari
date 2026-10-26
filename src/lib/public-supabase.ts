import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { publicQueryTags, PUBLIC_TTL } from './public-cache';

// Large source documents are read only while generating a compact cached
// collection; persisting those raw responses would exceed Next's 2 MB limit.
export const uncachedSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  },
);

// Public rendering must never reuse the browser client's admin session.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch(input, init) {
        const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
        const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
        const tags = url.pathname.startsWith('/rest/v1/') ? publicQueryTags(url) : [];
        if (!['GET', 'HEAD'].includes(method) || !tags.length) return fetch(input, { ...init, cache: 'no-store' });
        return fetch(input, { ...init, cache: 'force-cache', next: { revalidate: PUBLIC_TTL, tags } });
      },
    },
  },
);
