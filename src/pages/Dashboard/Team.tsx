import { Users } from "lucide-react";

const Team = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Team management functionality is currently being updated
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center h-96 space-y-4 border-2 border-dashed rounded-lg p-8">
        <Users className="w-12 h-12 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Team Management Coming Soon</h3>
          <p className="text-muted-foreground">
            We're working on bringing you improved team management features
          </p>
        </div>
      </div>
    </div>
  );
};

export default Team;