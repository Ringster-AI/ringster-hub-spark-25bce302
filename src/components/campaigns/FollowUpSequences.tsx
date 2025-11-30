
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FollowUpSequence } from "@/types/database/calendar-bookings";
import { Plus, Mail, MessageSquare, Phone, Clock } from "lucide-react";

interface FollowUpSequencesProps {
  campaignId: string;
}

export function FollowUpSequences({ campaignId }: FollowUpSequencesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSequence, setNewSequence] = useState({
    sequence_type: 'email' as FollowUpSequence['sequence_type'],
    trigger_event: 'no_answer' as FollowUpSequence['trigger_event'],
    delay_hours: 24,
    content: ''
  });

  const { data: sequences, isLoading } = useQuery({
    queryKey: ["follow-up-sequences", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follow_up_sequences")
        .select(`
          *,
          contact:campaign_contacts(*)
        `)
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (FollowUpSequence & { contact: any })[];
    },
  });

  const createSequence = useMutation({
    mutationFn: async (sequenceData: typeof newSequence) => {
      const { error } = await supabase
        .from("follow_up_sequences")
        .insert({
          campaign_id: campaignId,
          ...sequenceData
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-up-sequences", campaignId] });
      setShowAddForm(false);
      setNewSequence({
        sequence_type: 'email',
        trigger_event: 'no_answer',
        delay_hours: 24,
        content: ''
      });
      toast({
        title: "Follow-up sequence created",
        description: "The follow-up sequence has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating sequence",
        description: error instanceof Error ? error.message : "Failed to create sequence",
        variant: "destructive",
      });
    },
  });

  const getSequenceIcon = (type: FollowUpSequence['sequence_type']) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: FollowUpSequence['status']) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'sent': return 'green';
      case 'failed': return 'red';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  };

  if (isLoading) {
    return <div>Loading follow-up sequences...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Follow-up Sequences</h3>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Sequence
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create Follow-up Sequence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={newSequence.sequence_type}
                  onValueChange={(value) => setNewSequence(prev => ({ 
                    ...prev, 
                    sequence_type: value as FollowUpSequence['sequence_type'] 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Trigger Event</label>
                <Select
                  value={newSequence.trigger_event}
                  onValueChange={(value) => setNewSequence(prev => ({ 
                    ...prev, 
                    trigger_event: value as FollowUpSequence['trigger_event'] 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_answer">No Answer</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="not_interested">Not Interested</SelectItem>
                    <SelectItem value="callback_requested">Callback Requested</SelectItem>
                    <SelectItem value="appointment_booked">Appointment Booked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Delay (hours)</label>
              <Input
                type="number"
                value={newSequence.delay_hours}
                onChange={(e) => setNewSequence(prev => ({ 
                  ...prev, 
                  delay_hours: parseInt(e.target.value) || 24 
                }))}
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={newSequence.content}
                onChange={(e) => setNewSequence(prev => ({ 
                  ...prev, 
                  content: e.target.value 
                }))}
                placeholder="Enter the follow-up message content..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => createSequence.mutate(newSequence)}
                disabled={createSequence.isPending || !newSequence.content}
              >
                Create Sequence
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!sequences?.length ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Clock className="mx-auto h-12 w-12 mb-4" />
              <p>No follow-up sequences configured</p>
              <p className="text-sm">Create automated follow-ups for different call outcomes</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sequences.map((sequence) => (
            <Card key={sequence.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getSequenceIcon(sequence.sequence_type)}
                    <CardTitle className="text-base capitalize">
                      {sequence.sequence_type} Follow-up
                    </CardTitle>
                  </div>
                  <Badge variant={getStatusColor(sequence.status) as any}>
                    {sequence.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Trigger:</strong> {sequence.trigger_event.replace('_', ' ')}
                  </div>
                  <div className="text-sm">
                    <strong>Delay:</strong> {sequence.delay_hours} hours
                  </div>
                  {sequence.scheduled_for && (
                    <div className="text-sm">
                      <strong>Scheduled for:</strong> {new Date(sequence.scheduled_for).toLocaleString()}
                    </div>
                  )}
                  {sequence.sent_at && (
                    <div className="text-sm">
                      <strong>Sent at:</strong> {new Date(sequence.sent_at).toLocaleString()}
                    </div>
                  )}
                  {sequence.content && (
                    <div className="text-sm">
                      <strong>Content:</strong>
                      <p className="mt-1 p-2 bg-muted rounded text-muted-foreground">
                        {sequence.content}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
