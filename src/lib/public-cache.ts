// Shared by the anonymous server client and authenticated revalidation route.
export const PUBLIC_TTL = 3600;
export const collectionTag = 'bunyodkor:collections';
export const rankingTag = 'bunyodkor:rankings';
export const articleTag = (slug: string) => `bunyodkor:article:${slug}`;
export const commentsTag = (id: string) => `bunyodkor:comments:${id}`;

export function publicQueryTags(url: URL): string[] {
  const table = url.pathname.split('/').pop();
  if (table === 'article_comments') {
    const id = url.searchParams.get('article_id')?.replace(/^eq\./, '');
    return id ? [commentsTag(id)] : [];
  }
  if (table === 'article_rankings') return [rankingTag];
  if (table !== 'articles') return [];
  const slug = url.searchParams.get('slug');
  return slug?.startsWith('eq.') ? [articleTag(slug.slice(3))] : [collectionTag];
}
