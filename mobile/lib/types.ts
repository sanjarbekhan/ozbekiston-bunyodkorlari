export type Article = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  image_url: string | null;
  thumb_image_url: string | null;
  description: string | null;
  content: string | null;
  content_blocks: unknown[];
  gallery: unknown[];
  author_name: string | null;
  published_at: string | null;
  view_count: number;
};

export type AppProfile = {
  id: string;
  article_id: string | null;
  username: string | null;
  full_name: string;
  headline: string | null;
  avatar_url: string | null;
  region: string | null;
  profession: string | null;
  bio: string | null;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  profile_visibility: 'public' | 'members' | 'private';
  profile_completion: number;
  points: number;
  rating: number;
};

export type FeedItem = {
  id: string;
  kind: 'achievement' | 'work' | 'article';
  title: string;
  subtitle: string;
  imageUrl: string | null;
  createdAt: string;
};
