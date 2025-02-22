
export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image: string | null;
  excerpt: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_id: string;
  status: 'draft' | 'published';
};

export type BlogPostFormData = Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'author_id'>;
