
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { BlogPost, BlogPostFormData } from "@/types/blog";
import { generateSlug } from "@/utils/blogHelpers";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  featured_image: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

export function useBlogPost(initialData?: BlogPost) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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

  // Get the current user ID on component mount
  useEffect(() => {
    const getUserId = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        console.log("Auth user data:", data);
        
        if (error) {
          console.error("Auth error:", error);
          toast({
            title: "Authentication Error",
            description: error.message || "Failed to get user information",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        
        if (data.user) {
          console.log("User authenticated with ID:", data.user.id);
          setUserId(data.user.id);
        } else {
          console.log("No authenticated user found");
          toast({
            title: "Authentication Error",
            description: "You must be logged in to create or edit blog posts.",
            variant: "destructive",
          });
          navigate("/login");
        }
      } catch (err) {
        console.error("Unexpected error during auth check:", err);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    getUserId();
  }, [navigate, toast]);

  // Update the slug when the title changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'title' && value.title && !initialData) {
        form.setValue('slug', generateSlug(value.title as string));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, initialData]);

  // Form submission function
  const handleSubmit = async (values: BlogPostFormData) => {
    if (!userId) {
      console.error("No user ID available for submission");
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create or edit blog posts.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const postData = {
        ...values,
        published_at: values.status === "published" ? new Date().toISOString() : null,
        author_id: userId,
      };

      console.log("Submitting post data:", postData);

      // Verify we have a valid session before proceeding
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error("Session verification failed:", sessionError);
        throw new Error("Your session has expired. Please log in again.");
      }
      
      console.log("Session verified, proceeding with submission");

      // Use direct Supabase client for blog posts operations
      if (initialData) {
        // Update existing post
        console.log("Updating existing post with ID:", initialData.id);
        const { error, data } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", initialData.id)
          .select();
          
        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        
        console.log("Updated post:", data);
      } else {
        // Create new post
        console.log("Creating new post");
        const { error, data } = await supabase
          .from("blog_posts")
          .insert(postData)
          .select();
          
        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
        
        console.log("Created post:", data);
      }

      // Success handling
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      
      toast({
        title: `Post ${initialData ? "updated" : "created"} successfully`,
        description: "Your blog post has been saved.",
      });
      
      navigate("/dashboard/blog");
      
    } catch (error: any) {
      console.error("Submission error:", error);
      
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the post",
        variant: "destructive",
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    handleSubmit,
    isSubmitting,
    userId
  };
}
