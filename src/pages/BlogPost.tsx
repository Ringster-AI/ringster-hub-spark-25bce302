
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost as BlogPostType } from "@/types/blog";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";

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

  return (
    <main className="min-h-screen bg-white">
      <article className="container mx-auto px-6 py-32 max-w-4xl">
        <h1 className="text-4xl font-bold text-[#1A1F2C] mb-6">{post.title}</h1>
        
        {post.featured_image && (
          <div className="mb-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-auto rounded-lg"
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
