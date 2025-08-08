
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/types/blog";
import BlogPostGrid from "@/components/blog/BlogPostGrid";
import BlogPostsLoading from "@/components/blog/BlogPostsLoading";
import { Seo } from "@/components/seo/Seo";

const Blog = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  return (
    <main className="min-h-screen bg-white">
      <Seo title="Ringster Blog — AI Phone Agents Insights" description="Articles on AI phone agents, call automation, and lead capture strategies." />
      <div className="container mx-auto px-6 py-32">
        <h1 className="text-4xl font-bold text-[#1A1F2C] mb-12">Blog</h1>
        
        {isLoading ? <BlogPostsLoading /> : <BlogPostGrid posts={posts || []} />}
      </div>
    </main>
  );
};

export default Blog;
