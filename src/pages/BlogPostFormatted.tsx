
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/types/blog";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

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

  // Function to convert text to formatted HTML 
  const formatContent = (content: string) => {
    if (!content) return "";

    // Replace line breaks with <br> tags
    let formattedContent = content.replace(/\n\n/g, '</p><p>');
    formattedContent = formattedContent.replace(/\n/g, '<br />');
    
    // Wrap in paragraph tags if not already
    if (!formattedContent.startsWith('<p>')) {
      formattedContent = '<p>' + formattedContent;
    }
    if (!formattedContent.endsWith('</p>')) {
      formattedContent = formattedContent + '</p>';
    }

    return formattedContent;
  };

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

  return (
    <main className="min-h-screen bg-white">
      <article className="container mx-auto px-6 py-24 max-w-3xl">
        {post.featured_image && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-auto object-cover"
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

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(post.content) 
          }}
        />
      </article>
    </main>
  );
};

export default BlogPostFormatted;
