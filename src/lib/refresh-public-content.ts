import { supabase } from './supabase';

type Change = { kind: 'articles'; slugs: string[] } | { kind: 'comments'; articleId: string } | { kind: 'rankings' };

export async function refreshPublicContent(change: Change) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return false;
  try {
    const response = await fetch('/api/admin/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
      body: JSON.stringify(change),
    });
    return response.ok;
  } catch {
    return false;
  }
}
