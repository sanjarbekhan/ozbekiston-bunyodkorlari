import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { publicQueryTags, articleTag, commentsTag, collectionTag, rankingTag } = require('../src/lib/public-cache.ts');
const query = (value) => publicQueryTags(new URL(`https://example.supabase.co/rest/v1/${value}`));

test('editing one biography invalidates its own cached record without evicting another', () => {
  const before = query('articles?slug=eq.sevinch&status=eq.published');
  const other = query('articles?slug=eq.another-person&status=eq.published');
  assert.deepEqual(before, [articleTag('sevinch')]);
  assert.equal(other.includes(before[0]), false);
  assert.equal(before.includes(collectionTag), false);
});

test('catalogue, homepage and sitemap projections share collection invalidation', () => {
  for (const select of ['title,slug', 'slug,updated_at', 'category']) {
    assert.deepEqual(query(`articles?select=${select}&status=eq.published`), [collectionTag]);
  }
});

test('comment and ranking refreshes cannot evict unrelated publication collections', () => {
  assert.deepEqual(query('article_comments?article_id=eq.123&status=eq.approved'), [commentsTag('123')]);
  assert.deepEqual(query('article_rankings?status=eq.approved'), [rankingTag]);
  assert.deepEqual(query('article_comments?status=eq.pending'), []);
  assert.deepEqual(query('applications?select=*'), []);
  assert.deepEqual(query('connect_messages?select=*'), []);
});
