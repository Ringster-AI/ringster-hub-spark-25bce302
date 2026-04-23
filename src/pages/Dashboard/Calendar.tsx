
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarToolsManagement } from "@/components/calendar/CalendarToolsManagement";
import { BookingRequestsDashboard } from "@/components/calendar/BookingRequestsDashboard";
import { CalendarBookings } from "@/components/campaigns/CalendarBookings";
import { AgentCalendarToolsManagement } from "@/components/calendar/AgentCalendarToolsManagement";
import { Calendar as CalendarIcon, Settings, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Calendar() {
  const { agentId } = useParams();

  const { data: agents, isLoading: agentsLoading } = useQuery({
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

  const { data: calendarBookingsCount } = useQuery({
    queryKey: ["calendar-bookings-count"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { count, error } = await supabase
        .from("calendar_bookings")
        .select("*", { count: 'exact', head: true })
        .gte("appointment_datetime", today.toISOString())
        .lt("appointment_datetime", tomorrow.toISOString())
        .eq("booking_status", "confirmed");

      if (error) throw error;
      return count || 0;
    },
  });

  const { data: pendingRequestsCount } = useQuery({
    queryKey: ["booking-requests-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("booking_requests")
        .select("*", { count: 'exact', head: true })
        .eq("status", "pending_verification");

      if (error) throw error;
      return count || 0;
    },
  });

  if (agentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Loading calendar settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-6 w-6" />
        <h1 className="text-2xl md:text-3xl font-bold">Calendar Management</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="w-max md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="booking-requests">Booking Requests</TabsTrigger>
            <TabsTrigger value="calendar-bookings">Confirmed Bookings</TabsTrigger>
            <TabsTrigger value="agent-settings">Agent Settings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Enabled Agents
                </CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agents?.filter(agent => agent.status === 'active').length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active agents with calendar tools
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Requests
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingRequestsCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting verification
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today's Bookings
                </CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calendarBookingsCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Confirmed appointments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Success Rate
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pendingRequestsCount && calendarBookingsCount 
                    ? Math.round((calendarBookingsCount / (pendingRequestsCount + calendarBookingsCount)) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Verification to booking
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Enable Calendar Tools</h4>
                    <p className="text-sm text-muted-foreground">
                      Go to Agent Settings and enable calendar booking for your agents
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Configure Settings</h4>
                    <p className="text-sm text-muted-foreground">
                      Set up phone verification, time slots, and booking rules
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Monitor Requests</h4>
                    <p className="text-sm text-muted-foreground">
                      Track booking requests and confirmations in real-time
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking-requests">
          <BookingRequestsDashboard />
        </TabsContent>

        <TabsContent value="calendar-bookings">
          <CalendarBookings />
        </TabsContent>

        <TabsContent value="agent-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Calendar Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Configure calendar booking tools for each of your agents.
              </p>
            </CardContent>
          </Card>

          {agents?.map((agent) => (
            <AgentCalendarToolsManagement key={agent.id} agentId={agent.id} />
          ))}

          {(!agents || agents.length === 0) && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    No agents found. Create an agent first to configure calendar settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
