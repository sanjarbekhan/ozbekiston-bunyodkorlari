import { supabase } from '@/lib/supabase';
import type { Article } from '@/lib/types';

const ARTICLE_FIELDS =
  'id,title,slug,category,image_url,thumb_image_url,description,content,content_blocks,gallery,author_name,published_at,view_count';

export async function getPublishedArticles(limit = 30): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_FIELDS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Article[];
}

export async function getPublishedArticleCount(): Promise<number> {
  const { count, error } = await supabase
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published');
  if (error) throw error;
  return count ?? 0;
}

export async function searchPublishedArticles(query: string): Promise<Article[]> {
  const normalized = query.trim();
  if (!normalized) return getPublishedArticles(60);
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_FIELDS)
    .eq('status', 'published')
    .or(`title.ilike.%${normalized.replaceAll(',', ' ')}%,category.ilike.%${normalized.replaceAll(',', ' ')}%`)
    .order('published_at', { ascending: false })
    .limit(60);
  if (error) throw error;
  return (data ?? []) as Article[];
}

export async function getArticle(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_FIELDS)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error) throw error;
  return data as Article | null;
}
