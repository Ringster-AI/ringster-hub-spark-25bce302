
import { BlogPost } from "@/types/blog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/blog/ImageUpload";
import StatusSelector from "@/components/blog/StatusSelector";
import MarkdownHelp from "@/components/blog/MarkdownHelp";
import FormActions from "@/components/blog/FormActions";
import { useBlogPost } from "@/hooks/useBlogPost";

interface BlogPostFormProps {
  initialData?: BlogPost;
}

const BlogPostForm = ({ initialData }: BlogPostFormProps) => {
  const { form, handleSubmit, isSubmitting, userId } = useBlogPost(initialData);

  if (!userId) {
    return (
      <div className="p-6 text-center">
        <p>Please log in to create or edit blog posts.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                This is a short summary of your post. You can use Markdown here.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea className="min-h-[300px]" {...field} />
              </FormControl>
              <MarkdownHelp />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="featured_image"
          render={({ field }) => (
            <FormItem>
              <ImageUpload 
                imageUrl={field.value} 
                onImageUploaded={(url) => form.setValue("featured_image", url)} 
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <StatusSelector control={form.control} />

        <FormActions 
          isSubmitting={isSubmitting} 
          isEdit={Boolean(initialData)} 
          isUserAuthenticated={Boolean(userId)} 
        />
      </form>
    </Form>
  );
};

export default BlogPostForm;
