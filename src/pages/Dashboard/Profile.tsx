
import { ProfileForm } from "@/components/profile/ProfileForm";

const Profile = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="max-w-2xl">
        <ProfileForm />
      </div>
    </div>
  );
};

export default Profile;
