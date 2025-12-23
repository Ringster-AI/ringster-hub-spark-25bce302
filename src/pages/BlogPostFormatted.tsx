
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/types/blog";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { Seo } from "@/components/seo/Seo";
import { OptimizedImage } from "@/components/ui/optimized-image";

const BlogPostFormatted = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-24 max-w-3xl">
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-6 py-24 max-w-3xl">
        <h1 className="text-3xl font-bold">Post not found</h1>
      </div>
    );
  }

  const description = post.excerpt || (post.content ? post.content.replace(/\s+/g, ' ').slice(0, 150) : '');
  
  return (
    <main className="min-h-screen bg-white">
      <Seo 
        title={`${post.title} | Ringster Blog`} 
        description={description} 
        image={post.featured_image || undefined} 
        jsonLd={{ 
          "@context": "https://schema.org", 
          "@type": "BlogPosting", 
          headline: post.title, 
          description: description, 
          image: post.featured_image || undefined, 
          datePublished: post.published_at || undefined, 
          dateModified: (post as any).updated_at || post.published_at || undefined, 
          mainEntityOfPage: { 
            "@type": "WebPage", 
            "@id": typeof window !== "undefined" ? window.location.href : "" 
          } 
        }} 
      />
      <article className="container mx-auto px-6 py-24 max-w-3xl">
        {post.featured_image && (
          <div className="mb-8 overflow-hidden rounded-lg">
            <OptimizedImage
              src={post.featured_image}
              alt={post.title}
              width={800}
              height={450}
              aspectRatio="16/9"
              containerClassName="w-full"
            />
          </div>
        )}

        <h1 className="text-4xl font-bold text-[#1A1F2C] mb-4">{post.title}</h1>
        
        <div className="text-gray-500 mb-8">
          {post.published_at && (
            <time dateTime={post.published_at}>
              {format(new Date(post.published_at), "MMMM d, yyyy")}
            </time>
          )}
        </div>

        <div className="prose prose-lg max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
    </main>
  );
};

export default BlogPostFormatted;
