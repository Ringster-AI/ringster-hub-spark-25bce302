
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { BlogPost } from "@/types/blog";
import ReactMarkdown from "react-markdown";

interface BlogPostCardProps {
  post: BlogPost;
}

const BlogPostCard = ({ post }: BlogPostCardProps) => {
  return (
    <article className="group">
      <Link to={`/blog/${post.slug}`}>
        <div className="relative aspect-video mb-4 overflow-hidden rounded-lg bg-gray-100">
          {post.featured_image ? (
            <img 
              src={post.featured_image}
              alt={post.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
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
