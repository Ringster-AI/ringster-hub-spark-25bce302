
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Settings, Campaign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CampaignCalendarToolsManagementProps {
  campaignId: string;
}

export function CampaignCalendarToolsManagement({ campaignId }: CampaignCalendarToolsManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agents } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_configs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: campaignCalendarTools, isLoading } = useQuery({
    queryKey: ["campaign-calendar-tools", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_tools")
        .select(`
          *,
          agent:agent_configs(*)
        `)
        .eq("campaign_id", campaignId);

      if (error) throw error;
      return data;
    },
  });

  const { data: availableAgents } = useQuery({
    queryKey: ["available-agents-for-calendar", campaignId],
    queryFn: async () => {
      const { data: existingTools } = await supabase
        .from("calendar_tools")
        .select("agent_id")
        .eq("campaign_id", campaignId);

      const existingAgentIds = existingTools?.map(tool => tool.agent_id) || [];

      const { data, error } = await supabase
        .from("agent_configs")
        .select("*")
        .not("id", "in", `(${existingAgentIds.join(',') || 'null'})`)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const addCalendarTool = useMutation({
    mutationFn: async (agentId: string) => {
      const { data, error } = await supabase
        .from("calendar_tools")
        .insert({
          agent_id: agentId,
          campaign_id: campaignId,
          tool_name: "calendar_booking",
          is_enabled: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-calendar-tools", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["available-agents-for-calendar", campaignId] });
      toast({
        title: "Calendar Tool Added",
        description: "Calendar booking tool has been added to the agent for this campaign.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add calendar tool",
        variant: "destructive",
      });
    },
  });

  const updateCalendarTool = useMutation({
    mutationFn: async ({ toolId, updates }: { toolId: string; updates: any }) => {
      const { data, error } = await supabase
        .from("calendar_tools")
        .update(updates)
        .eq("id", toolId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-calendar-tools", campaignId] });
      toast({
        title: "Settings Updated",
        description: "Calendar tool settings have been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update calendar tool",
        variant: "destructive",
      });
    },
  });

  const removeCalendarTool = useMutation({
    mutationFn: async (toolId: string) => {
      const { error } = await supabase
        .from("calendar_tools")
        .delete()
        .eq("id", toolId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-calendar-tools", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["available-agents-for-calendar", campaignId] });
      toast({
        title: "Calendar Tool Removed",
        description: "Calendar booking tool has been removed from the agent.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove calendar tool",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Loading campaign calendar tools...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Campaign className="h-5 w-5" />
            Campaign Calendar Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Configure calendar booking tools for agents in this campaign. These tools will only be active for outbound calls made through this campaign.
          </p>

          {availableAgents && availableAgents.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Add Agent Calendar Tool</h4>
              <div className="flex gap-2">
                <Select onValueChange={(agentId) => addCalendarTool.mutate(agentId)}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select an agent to add calendar tool" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {campaignCalendarTools?.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No calendar tools configured for this campaign</p>
                <p className="text-sm text-muted-foreground">Add an agent above to enable calendar booking</p>
              </div>
            ) : (
              campaignCalendarTools?.map((tool) => (
                <Card key={tool.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {tool.agent?.name || 'Unknown Agent'}
                          <Badge variant={tool.is_enabled ? "default" : "secondary"}>
                            {tool.is_enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </CardTitle>
                      </div>
                      <Switch
                        checked={tool.is_enabled}
                        onCheckedChange={(enabled) => 
                          updateCalendarTool.mutate({ 
                            toolId: tool.id, 
                            updates: { is_enabled: enabled } 
                          })
                        }
                        disabled={updateCalendarTool.isPending}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        <strong>Tool Name:</strong> {tool.tool_name}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <strong>Configuration:</strong>
                        <ul className="list-disc list-inside ml-2 mt-1">
                          <li>Phone verification: {tool.configuration.requirePhoneVerification ? 'Required' : 'Optional'}</li>
                          <li>Buffer time: {tool.configuration.bufferMinutes} minutes</li>
                          <li>Max advance booking: {tool.configuration.maxAdvanceBookingDays} days</li>
                        </ul>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // This would open a configuration modal
                            console.log('Configure tool:', tool.id);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeCalendarTool.mutate(tool.id)}
                          disabled={removeCalendarTool.isPending}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
