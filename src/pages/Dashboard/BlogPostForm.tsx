
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { BlogPost, BlogPostFormData } from "@/types/blog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  featured_image: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

interface BlogPostFormProps {
  initialData?: BlogPost;
}

const BlogPostForm = ({ initialData }: BlogPostFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      featured_image: "",
      status: "draft",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: BlogPostFormData) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const postData = {
        ...values,
        published_at: values.status === "published" ? new Date().toISOString() : null,
        author_id: userData.user.id,
      };

      if (initialData) {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", initialData.id);
        if (error) throw error;
        return initialData.id;
      } else {
        const { data, error } = await supabase
          .from("blog_posts")
          .insert(postData)
          .select()
          .single();
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({
        title: `Post ${initialData ? "updated" : "created"} successfully`,
        description: "Your blog post has been saved.",
      });
      navigate("/dashboard/blog");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filePath);

      form.setValue("featured_image", publicUrl.publicUrl);
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (values: BlogPostFormData) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Featured Image</FormLabel>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            {form.watch("featured_image") && (
              <img
                src={form.watch("featured_image")}
                alt="Preview"
                className="w-20 h-20 object-cover rounded"
              />
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={field.value === "draft" ? "default" : "outline"}
                  onClick={() => field.onChange("draft")}
                >
                  <Badge variant="secondary">Draft</Badge>
                </Button>
                <Button
                  type="button"
                  variant={field.value === "published" ? "default" : "outline"}
                  onClick={() => field.onChange("published")}
                >
                  <Badge>Published</Badge>
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={mutation.isPending}>
            {initialData ? "Update" : "Create"} Post
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/blog")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BlogPostForm;
