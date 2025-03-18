
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GoogleIntegration } from "@/types/integrations";
import { CalendarSettingsType } from "@/types/calendar";

const weekdays = [
  { id: 0, name: "Sunday" },
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
];

interface CalendarInfo {
  id: string;
  summary: string;
  primary: boolean;
}

const formSchema = z.object({
  calendar_id: z.string().min(1, "Please select a calendar"),
  calendar_name: z.string().optional(),
  default_duration: z.coerce.number().min(5, "Minimum 5 minutes").max(240, "Maximum 240 minutes"),
  buffer_time: z.coerce.number().min(0, "Minimum 0 minutes").max(60, "Maximum 60 minutes"),
  availability_days: z.array(z.number()).min(1, "Select at least one day"),
  availability_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Use format HH:MM"),
  availability_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Use format HH:MM"),
});

type FormValues = z.infer<typeof formSchema>;

interface CalendarConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: CalendarSettingsType) => Promise<void>;
  initialSettings: CalendarSettingsType | null;
  googleIntegration: GoogleIntegration | null;
}

export function CalendarConfigModal({
  isOpen,
  onClose,
  onSave,
  initialSettings,
  googleIntegration
}: CalendarConfigModalProps) {
  const { toast } = useToast();
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calendar_id: initialSettings?.calendar_id || "",
      calendar_name: initialSettings?.calendar_name || "",
      default_duration: initialSettings?.default_duration || 30,
      buffer_time: initialSettings?.buffer_time || 10,
      availability_days: initialSettings?.availability_days || [1, 2, 3, 4, 5],
      availability_start: initialSettings?.availability_start || "09:00",
      availability_end: initialSettings?.availability_end || "17:00",
    }
  });

  // Fetch user's Google calendars
  useEffect(() => {
    async function fetchCalendars() {
      if (!googleIntegration?.id || !isOpen) return;
      
      try {
        setIsLoadingCalendars(true);
        
        // Get the current session to include the auth token in the request
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session found");
        }
        
        // Call the Supabase Edge Function to fetch calendars
        const { data, error } = await supabase.functions.invoke('google-calendar-list', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        
        if (error) throw error;
        
        if (data && data.calendars) {
          setCalendars(data.calendars);
          
          // Set default calendar if one was previously selected
          if (initialSettings?.calendar_id) {
            form.setValue("calendar_id", initialSettings.calendar_id);
            form.setValue("calendar_name", initialSettings.calendar_name || "");
          } else if (data.calendars.length > 0) {
            // Find primary calendar or use the first one
            const primaryCalendar = data.calendars.find((cal: CalendarInfo) => cal.primary) || data.calendars[0];
            form.setValue("calendar_id", primaryCalendar.id);
            form.setValue("calendar_name", primaryCalendar.summary);
          }
        }
      } catch (err: any) {
        console.error('Error fetching calendars:', err);
        toast({
          variant: "destructive",
          title: "Failed to load calendars",
          description: err.message || "An error occurred while fetching your calendars",
        });
      } finally {
        setIsLoadingCalendars(false);
      }
    }
    
    fetchCalendars();
  }, [googleIntegration, isOpen, form, toast, initialSettings]);

  const handleCalendarChange = (calendarId: string) => {
    const selectedCalendar = calendars.find(cal => cal.id === calendarId);
    if (selectedCalendar) {
      form.setValue("calendar_name", selectedCalendar.summary);
    }
  };

  const onSubmit = async (values: FormValues) => {
    // Create a new CalendarSettings object with all required fields
    const settings: CalendarSettingsType = {
      calendar_id: values.calendar_id,
      calendar_name: values.calendar_name,
      default_duration: values.default_duration,
      buffer_time: values.buffer_time,
      availability_days: values.availability_days,
      availability_start: values.availability_start,
      availability_end: values.availability_end,
    };
    
    await onSave(settings);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Calendar Settings</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Calendar Selection</h3>
              
              <FormField
                control={form.control}
                name="calendar_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Calendar</FormLabel>
                    <Select 
                      disabled={isLoadingCalendars} 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleCalendarChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingCalendars ? "Loading calendars..." : "Select a calendar"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingCalendars ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Loading calendars...</span>
                          </div>
                        ) : (
                          calendars.map(calendar => (
                            <SelectItem key={calendar.id} value={calendar.id}>
                              {calendar.summary} {calendar.primary ? "(Primary)" : ""}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Appointment Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="default_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min={5} max={240} {...field} />
                      </FormControl>
                      <FormDescription>
                        The default length of appointments
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="buffer_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buffer Time (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={60} {...field} />
                      </FormControl>
                      <FormDescription>
                        Time between appointments
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Availability</h3>
              
              <FormField
                control={form.control}
                name="availability_days"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Available Days</FormLabel>
                      <FormDescription>
                        Select the days you're available for appointments
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {weekdays.map((day) => (
                        <FormField
                          key={day.id}
                          control={form.control}
                          name="availability_days"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={day.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, day.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== day.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {day.name}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="availability_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available From</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="availability_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Until</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
