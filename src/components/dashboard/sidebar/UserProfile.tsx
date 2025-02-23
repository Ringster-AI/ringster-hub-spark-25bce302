
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface UserProfileProps {
  profile: {
    avatar_url?: string;
    full_name?: string;
    username?: string;
    email?: string;
  } | null;
}

export const UserProfile = ({ profile }: UserProfileProps) => {
  const navigate = useNavigate();

  return (
    <div className="px-4 mb-6">
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <button 
          onClick={() => navigate('/dashboard/profile')}
          className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <div className="font-medium text-sm truncate">
              {profile?.full_name || profile?.username || "User"}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {profile?.email || "No email"}
            </div>
          </div>
        </button>
      </Card>
    </div>
  );
};
