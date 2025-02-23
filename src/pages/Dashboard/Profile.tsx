
import { useState } from "react";
import { ProfileForm, ProfileFormValues } from "@/components/profile/ProfileForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: profile, refetch } = useQuery({
    queryKey: ["profile-details"],
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

  const handleSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error("No authenticated user found");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: values.full_name,
          username: values.username,
          email: values.email,
          phone: values.phone,
          website: values.website,
          bio: values.bio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      refetch(); // Refresh the profile data
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Default values for the form
  const defaultValues: ProfileFormValues = {
    full_name: profile?.full_name || "",
    username: profile?.username || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    website: profile?.website || "",
    bio: profile?.bio || "",
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="max-w-2xl">
        <ProfileForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default Profile;
