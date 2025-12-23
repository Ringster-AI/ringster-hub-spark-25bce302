
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost as BlogPostType } from "@/types/blog";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { Seo } from "@/components/seo/Seo";
import { OptimizedImage } from "@/components/ui/optimized-image";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          navigate("/blog");
        }
        throw error;
      }
      return data as BlogPostType;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-32 max-w-4xl">
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-64 w-full mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!post) return null;

  const description = post.excerpt || (post.content ? post.content.replace(/\s+/g, ' ').slice(0, 150) : '');
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    image: post.featured_image || undefined,
    datePublished: post.published_at || undefined,
    dateModified: (post as any).updated_at || post.published_at || undefined,
    author: (post as any).author_name ? { "@type": "Person", name: (post as any).author_name } : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": typeof window !== "undefined" ? window.location.href : ""
    }
  } as const;
  
  return (
    <main className="min-h-screen bg-white">
      <Seo title={`${post.title} | Ringster Blog`} description={description} image={post.featured_image || undefined} jsonLd={jsonLd} />
      <article className="container mx-auto px-6 py-32 max-w-4xl">
        <h1 className="text-4xl font-bold text-[#1A1F2C] mb-6">{post.title}</h1>
        
        {post.featured_image && (
          <div className="mb-8">
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

        {post.published_at && (
          <div className="text-sm text-gray-500 mb-8">
            Published on {format(new Date(post.published_at), "MMMM d, yyyy")}
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
    </main>
  );
};

export default BlogPost;
