import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, UserPlus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InviteMemberDialog } from "@/components/team/InviteMemberDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Team = () => {
  const { toast } = useToast();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          *,
          profile:profiles(*)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error loading team members",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
  });

  const inviteButton = (
    <Button onClick={() => setIsInviteDialogOpen(true)}>
      <UserPlus className="mr-2" />
      Invite Member
    </Button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse">Loading team members...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your team members and their roles
          </p>
        </div>
        {inviteButton}
      </div>

      {teamMembers?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 space-y-4 border-2 border-dashed rounded-lg p-8">
          <Users className="w-12 h-12 text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">No team members yet</h3>
            <p className="text-muted-foreground">
              Invite your first team member to get started
            </p>
          </div>
          {inviteButton}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.profile.full_name || "Unnamed"}
                  </TableCell>
                  <TableCell>{member.profile.email}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {member.role}
                  </TableCell>
                  <TableCell>
                    {new Date(member.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {/* Actions will be implemented in the next iteration */}
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <InviteMemberDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />
    </div>
  );
};

export default Team;