import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface ProfileFormValues {
  full_name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  bio: string;
}

const Profile = () => {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      full_name: "",
      username: "",
      email: "",
      phone: "",
      website: "",
      bio: "",
    },
  });

  // Update form when profile data is loaded
  useState(() => {
    if (profile) {
      form.reset(profile);
    }
  });

  const updateProfile = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    },
  });

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("No user found");

      const fileExt = file.name.split(".").pop();
      const filePath = `${session.user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: filePath })
        .eq("id", session.user.id);

      if (updateError) throw updateError;

      toast.success("Avatar updated successfully");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (error) {
      toast.error("Failed to upload avatar");
      console.error("Error uploading avatar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile information and settings
        </p>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback>
            {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={isUploading}
            className="max-w-xs"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Recommended: Square image, max 1MB
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => updateProfile.mutate(data))}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input {...field} type="url" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={updateProfile.isPending}
            className="w-full"
          >
            {updateProfile.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Profile;