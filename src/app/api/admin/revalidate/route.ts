import { createClient } from '@supabase/supabase-js';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { articleTag, collectionTag, commentsTag, rankingTag } from '@/lib/public-cache';

const ADMIN_USER_ID = '988b7d1f-4028-42a6-9a8f-be869224be6e';
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) return reply({ error: 'Admin sessiyasi topilmadi.' }, 401);
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await db.auth.getUser(token);
  if (error || data.user?.id !== ADMIN_USER_ID) return reply({ error: 'Bu amal faqat admin uchun.' }, 403);
  const body = await request.json().catch(() => null);
  if (body?.kind === 'articles') {
    if (!Array.isArray(body.slugs) || !body.slugs.length || body.slugs.length > 2 ||
      body.slugs.some((s: unknown) => typeof s !== 'string' || !/^[a-z0-9-]{1,200}$/i.test(s))) {
      return reply({ error: 'Maqola havolasi noto‘g‘ri.' }, 400);
    }
    revalidateTag(collectionTag, { expire: 0 });
    revalidateTag(rankingTag, { expire: 0 });
    for (const slug of new Set<string>(body.slugs)) {
      revalidateTag(articleTag(slug), { expire: 0 });
      revalidatePath(`/bunyodkorlar/${slug}`);
    }
    for (const path of ['/', '/bunyodkorlar', '/iqtiboslar', '/sitemap.xml', '/profiles-sitemap.xml', '/rss.xml', '/atom.xml']) revalidatePath(path);
  } else if (body?.kind === 'comments') {
    if (typeof body.articleId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.articleId)) return reply({ error: 'Maqola ID noto‘g‘ri.' }, 400);
    revalidateTag(commentsTag(body.articleId), { expire: 0 });
  } else if (body?.kind === 'rankings') {
    revalidateTag(rankingTag, { expire: 0 });
  } else {
    return reply({ error: 'Yangilash turi noto‘g‘ri.' }, 400);
  }
  return reply({ ok: true });
}
