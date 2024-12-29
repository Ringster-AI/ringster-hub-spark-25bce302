import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileForm, ProfileFormValues } from "@/components/profile/ProfileForm";

const Profile = () => {
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

  const handleAvatarUpdate = async (filePath: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: filePath })
      .eq("id", session.user.id);

    if (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["profile"] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const defaultValues: ProfileFormValues = {
    full_name: profile?.full_name ?? "",
    username: profile?.username ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    website: profile?.website ?? "",
    bio: profile?.bio ?? "",
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile information and settings
        </p>
      </div>

      <ProfileAvatar
        avatarUrl={profile?.avatar_url}
        fullName={profile?.full_name}
        username={profile?.username}
        onAvatarUpdate={handleAvatarUpdate}
      />

      <ProfileForm
        defaultValues={defaultValues}
        onSubmit={(data) => updateProfile.mutate(data)}
        isSubmitting={updateProfile.isPending}
      />
    </div>
  );
};

export default Profile;