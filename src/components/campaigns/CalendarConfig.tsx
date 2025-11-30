
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalendarConfigProps {
  form: UseFormReturn<any>;
}

export function CalendarConfig({ form }: CalendarConfigProps) {
  const enableCalendarBooking = form.watch("config.calendar_booking_enabled");

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="config.calendar_booking_enabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>Enable Calendar Booking</FormLabel>
              <div className="text-sm text-muted-foreground">
                Allow the agent to book calendar appointments during calls
              </div>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {enableCalendarBooking && (
        <>
          <FormField
            control={form.control}
            name="config.default_appointment_duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Appointment Duration (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || 30}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                    min="15"
                    max="240"
                    step="15"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="config.appointment_buffer_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buffer Time Between Appointments (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || 10}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                    min="0"
                    max="60"
                    step="5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="config.business_hours_start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Hours Start</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    value={field.value || "09:00"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="config.business_hours_end"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Hours End</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    value={field.value || "17:00"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="config.booking_lead_time_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Lead Time (hours)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || 2}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 2)}
                    min="1"
                    max="168"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
}
