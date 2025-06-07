
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Phone, Clock, User, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface BookingRequest {
  id: string;
  phone_number: string;
  attendee_name: string;
  attendee_email?: string;
  requested_datetime: string;
  duration_minutes: number;
  appointment_type: string;
  notes?: string;
  status: string;
  expires_at: string;
  created_at: string;
  campaign?: {
    name: string;
  };
}

export function BookingRequestsDashboard() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: bookingRequests, isLoading } = useQuery({
    queryKey: ["booking-requests", selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from("booking_requests")
        .select(`
          *,
          campaigns(name)
        `)
        .order("created_at", { ascending: false });

      if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BookingRequest[];
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending_verification: "outline",
      verified: "secondary",
      booked: "default",
      cancelled: "destructive",
      expired: "destructive",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const getStatusStats = () => {
    if (!bookingRequests) return {};
    
    return bookingRequests.reduce((acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const stats = getStatusStats();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading booking requests...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Requests Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.pending_verification || 0}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.verified || 0}</div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.booked || 0}</div>
              <div className="text-sm text-muted-foreground">Booked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.cancelled || 0}</div>
              <div className="text-sm text-muted-foreground">Cancelled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.expired || 0}</div>
              <div className="text-sm text-muted-foreground">Expired</div>
            </div>
          </div>

          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending_verification">Pending</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="booked">Booked</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedStatus} className="mt-6">
              <div className="space-y-4">
                {bookingRequests?.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No booking requests found</p>
                  </div>
                ) : (
                  bookingRequests?.map((request) => (
                    <BookingRequestCard key={request.id} request={request} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface BookingRequestCardProps {
  request: BookingRequest;
}

function BookingRequestCard({ request }: BookingRequestCardProps) {
  const isExpired = new Date(request.expires_at) < new Date();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium">{request.attendee_name}</span>
              {request.status === "pending_verification" && getStatusBadge(request.status)}
              {request.status === "verified" && getStatusBadge(request.status)}
              {request.status === "booked" && getStatusBadge(request.status)}
              {request.status === "cancelled" && getStatusBadge(request.status)}
              {request.status === "expired" && getStatusBadge(request.status)}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {request.phone_number}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(request.requested_datetime), "PPP p")}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {request.duration_minutes} min
              </div>
            </div>

            {request.attendee_email && (
              <div className="text-sm text-muted-foreground">
                Email: {request.attendee_email}
              </div>
            )}

            {request.notes && (
              <div className="text-sm">
                <strong>Notes:</strong> {request.notes}
              </div>
            )}

            {request.campaign && (
              <div className="text-sm text-muted-foreground">
                Campaign: {request.campaign.name}
              </div>
            )}

            {isExpired && request.status === "pending_verification" && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-3 w-3" />
                Expired on {format(new Date(request.expires_at), "PPP p")}
              </div>
            )}
          </div>

          <div className="flex gap-2 ml-4">
            {request.status === "verified" && (
              <Button size="sm" variant="outline">
                Confirm Booking
              </Button>
            )}
            {request.status === "pending_verification" && !isExpired && (
              <Button size="sm" variant="outline">
                Resend Code
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
