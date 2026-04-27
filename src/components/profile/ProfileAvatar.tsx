import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  fullName?: string | null;
  username?: string | null;
  onAvatarUpdate: (url: string) => void;
}

export const ProfileAvatar = ({ avatarUrl, fullName, username, onAvatarUpdate }: ProfileAvatarProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("No user found");

      const fileExt = file.name.split(".").pop();
      // Path MUST start with the user's UID so storage RLS can enforce ownership
      const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      onAvatarUpdate(filePath);
      toast.success("Avatar updated successfully");
    } catch (error) {
      toast.error("Failed to upload avatar");
      console.error("Error uploading avatar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-8 flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={avatarUrl ?? undefined} />
        <AvatarFallback>
          {fullName?.charAt(0) || username?.charAt(0) || "?"}
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
          {isUploading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </span>
          ) : (
            "Recommended: Square image, max 1MB"
          )}
        </p>
      </div>
    </div>
  );
};