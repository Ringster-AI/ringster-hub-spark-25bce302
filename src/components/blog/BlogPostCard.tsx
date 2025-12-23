
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { BlogPost } from "@/types/blog";
import ReactMarkdown from "react-markdown";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface BlogPostCardProps {
  post: BlogPost;
}

const BlogPostCard = ({ post }: BlogPostCardProps) => {
  return (
    <article className="group">
      <Link to={`/blog/${post.slug}`}>
        <div className="relative mb-4 overflow-hidden rounded-lg bg-muted">
          {post.featured_image ? (
            <OptimizedImage
              src={post.featured_image}
              alt={post.title}
              width={400}
              height={225}
              aspectRatio="16/9"
              className="group-hover:scale-105 transition-transform duration-300"
              fallback={
                <span className="text-muted-foreground">No image</span>
              }
            />
          ) : (
            <div 
              className="w-full bg-muted flex items-center justify-center"
              style={{ aspectRatio: "16/9" }}
            >
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
        </div>
        <h2 className="text-xl font-semibold text-[#1A1F2C] group-hover:text-[#DD2476] transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <div className="mt-2 text-gray-600 line-clamp-3 prose prose-sm">
            <ReactMarkdown>{post.excerpt}</ReactMarkdown>
          </div>
        )}
        <div className="mt-4 text-sm text-gray-500">
          {post.published_at && format(new Date(post.published_at), 'MMMM d, yyyy')}
        </div>
      </Link>
    </article>
  );
};

export default BlogPostCard;
