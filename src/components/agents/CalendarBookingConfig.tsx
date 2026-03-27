
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Shield, Phone, MapPin, Plus, X } from "lucide-react";
import { AgentFormData } from "@/types/agents";

interface CalendarBookingConfigProps {
  form: UseFormReturn<AgentFormData>;
  disabled?: boolean;
}

export const CalendarBookingConfig = ({ form, disabled }: CalendarBookingConfigProps) => {
  const calendarEnabled = form.watch("calendar_booking.enabled");

  const handleCalendarToggle = (enabled: boolean) => {
    form.setValue("calendar_booking.enabled", enabled);
    if (enabled && !form.getValues("calendar_booking.default_duration")) {
      // Set default values when enabling calendar booking
      form.setValue("calendar_booking.default_duration", 30);
      form.setValue("calendar_booking.buffer_time", 10);
      form.setValue("calendar_booking.business_hours_start", "09:00");
      form.setValue("calendar_booking.business_hours_end", "17:00");
      form.setValue("calendar_booking.booking_lead_time_hours", 2);
      form.setValue("calendar_booking.require_phone_verification", true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Booking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="calendar-enabled">Enable Calendar Booking</Label>
            <p className="text-sm text-muted-foreground">
              Allow this agent to book calendar appointments during calls
            </p>
          </div>
          <Switch
            id="calendar-enabled"
            checked={calendarEnabled || false}
            onCheckedChange={handleCalendarToggle}
            disabled={disabled}
          />
        </div>

        {calendarEnabled && (
          <div className="space-y-4 mt-4 border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="default-duration">Default Duration (minutes)</Label>
                <Input
                  id="default-duration"
                  type="number"
                  min="15"
                  max="240"
                  step="15"
                  value={form.watch("calendar_booking.default_duration") || 30}
                  onChange={(e) => form.setValue("calendar_booking.default_duration", parseInt(e.target.value) || 30)}
                  disabled={disabled}
                />
              </div>
              
              <div>
                <Label htmlFor="buffer-time">Buffer Time (minutes)</Label>
                <Input
                  id="buffer-time"
                  type="number"
                  min="0"
                  max="60"
                  step="5"
                  value={form.watch("calendar_booking.buffer_time") || 10}
                  onChange={(e) => form.setValue("calendar_booking.buffer_time", parseInt(e.target.value) || 10)}
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business-start">Business Hours Start</Label>
                <Input
                  id="business-start"
                  type="time"
                  value={form.watch("calendar_booking.business_hours_start") || "09:00"}
                  onChange={(e) => form.setValue("calendar_booking.business_hours_start", e.target.value)}
                  disabled={disabled}
                />
              </div>
              
              <div>
                <Label htmlFor="business-end">Business Hours End</Label>
                <Input
                  id="business-end"
                  type="time"
                  value={form.watch("calendar_booking.business_hours_end") || "17:00"}
                  onChange={(e) => form.setValue("calendar_booking.business_hours_end", e.target.value)}
                  disabled={disabled}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="lead-time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Minimum Lead Time (hours)
              </Label>
              <Input
                id="lead-time"
                type="number"
                min="1"
                max="168"
                value={form.watch("calendar_booking.booking_lead_time_hours") || 2}
                onChange={(e) => form.setValue("calendar_booking.booking_lead_time_hours", parseInt(e.target.value) || 2)}
                disabled={disabled}
              />
              <p className="text-sm text-muted-foreground mt-1">
                How far in advance appointments must be booked
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="phone-verification" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Require Phone Verification
                </Label>
                <p className="text-sm text-muted-foreground">
                  Verify caller's phone number before booking
                </p>
              </div>
              <Switch
                id="phone-verification"
                checked={form.watch("calendar_booking.require_phone_verification") ?? true}
                onCheckedChange={(checked) => form.setValue("calendar_booking.require_phone_verification", checked)}
                disabled={disabled}
              />
            </div>

            <RequiredFieldsSection form={form} disabled={disabled} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function RequiredFieldsSection({ form, disabled }: { form: UseFormReturn<AgentFormData>; disabled?: boolean }) {
  const requiredFields = form.watch("calendar_booking.required_fields") || [];
  const customFields = form.watch("calendar_booking.custom_fields") || [];
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldDesc, setNewFieldDesc] = useState("");

  const toggleField = (field: string) => {
    const current = [...requiredFields];
    const idx = current.indexOf(field);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(field);
    }
    form.setValue("calendar_booking.required_fields", current);
  };

  const addCustomField = () => {
    if (!newFieldName.trim()) return;
    const updated = [...customFields, { name: newFieldName.trim(), description: newFieldDesc.trim() || newFieldName.trim() }];
    form.setValue("calendar_booking.custom_fields", updated);
    // Also add to required_fields
    const rf = [...requiredFields, `custom:${newFieldName.trim()}`];
    form.setValue("calendar_booking.required_fields", rf);
    setNewFieldName("");
    setNewFieldDesc("");
  };

  const removeCustomField = (index: number) => {
    const field = customFields[index];
    const updated = customFields.filter((_, i) => i !== index);
    form.setValue("calendar_booking.custom_fields", updated);
    // Remove from required_fields
    const rf = requiredFields.filter(f => f !== `custom:${field.name}`);
    form.setValue("calendar_booking.required_fields", rf);
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div>
        <Label className="text-base font-medium">Required Booking Information</Label>
        <p className="text-sm text-muted-foreground">
          Select which information the agent must collect before booking
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="require-phone"
            checked={requiredFields.includes("phone")}
            onCheckedChange={() => toggleField("phone")}
            disabled={disabled}
          />
          <Label htmlFor="require-phone" className="flex items-center gap-2 cursor-pointer">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Phone Number
          </Label>
        </div>

        <div className="flex items-center space-x-3">
          <Checkbox
            id="require-address"
            checked={requiredFields.includes("address")}
            onCheckedChange={() => toggleField("address")}
            disabled={disabled}
          />
          <Label htmlFor="require-address" className="flex items-center gap-2 cursor-pointer">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Service Address
          </Label>
        </div>
      </div>

      {customFields.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Custom Fields</Label>
          {customFields.map((field, idx) => (
            <div key={idx} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
              <div>
                <span className="text-sm font-medium">{field.name}</span>
                {field.description && field.description !== field.name && (
                  <span className="text-xs text-muted-foreground ml-2">— {field.description}</span>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCustomField(idx)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-medium">Add Custom Field</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Field name (e.g., Insurance ID)"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            disabled={disabled}
            className="flex-1"
          />
          <Input
            placeholder="Description (optional)"
            value={newFieldDesc}
            onChange={(e) => setNewFieldDesc(e.target.value)}
            disabled={disabled}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={addCustomField} disabled={disabled || !newFieldName.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
