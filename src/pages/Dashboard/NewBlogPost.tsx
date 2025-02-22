
import BlogPostForm from "./BlogPostForm";

const NewBlogPost = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Create New Blog Post</h1>
      <BlogPostForm />
    </div>
  );
};

export default NewBlogPost;
