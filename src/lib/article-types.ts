export type ContentBlockType =
  | "heading"
  | "text"
  | "html"
  | "preface"
  | "image"
  | "video"
  | "file"
  | "quote";

export type ContentBlock = {
  id?: string;
  ty: ContentBlockType | string;
  te?: string;
  le?: number;
  url?: string;
  alt?: string;
  caption?: string;
  title?: string;
  author?: string;
};

export type ArticleRecord = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  image_url: string | null;
  thumb_image_url: string | null;
  media_type: string | null;
  video_url: string | null;
  description: string | null;
  content: string | null;
  content_blocks: ContentBlock[] | null;
  gallery: string[] | null;
  attachments: unknown[] | null;
  status: "draft" | "published" | "archived";
  source_url: string | null;
  source_id: string | null;
  legacy_post_id: string | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  author_name: string | null;
  author_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  social_title: string | null;
  social_description: string | null;
  social_image_url: string | null;
  canonical_url: string | null;
  reading_minutes: number | null;
  view_count: number | null;
};
