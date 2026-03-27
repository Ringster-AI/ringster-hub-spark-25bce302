

## Plan: Configurable Required Booking Fields

### Problem
Different service businesses need different information from callers — a plumber needs an address, a clinic may need a phone number, etc. Currently only name and email are collected.

### Approach
Add a **configurable "required booking fields"** setting per agent in the Calendar Booking config. Business owners toggle which fields the agent must collect before booking. The Vapi tool schema stays flexible (all fields optional at the tool level), but the edge function enforces whatever the business configured.

### Changes

**1. Add booking fields config to CalendarBookingConfig UI**
- `src/components/agents/CalendarBookingConfig.tsx` — add a "Required Booking Information" section with checkboxes:
  - Phone number (toggle, default off)
  - Address (toggle, default off)
  - Custom fields (stretch — allow adding named free-text fields like "Insurance ID", "Vehicle make/model")
- These get stored in `calendar_booking.required_fields` as an array, e.g. `["phone", "address"]`

**2. Update AgentFormData type**
- `src/types/agents.ts` — add `required_fields?: string[]` and optionally `custom_fields?: { name: string; description: string }[]` inside `calendar_booking`

**3. Update Vapi tool definition to accept optional fields**
- `supabase/functions/register-vapi-calendar-tools/index.ts` — add optional parameters to `book_appointment`:
  - `attendee_phone` (string, optional)
  - `attendee_address` (string, optional)
  - `custom_fields` (object, optional — key/value pairs)
- Update the tool description to say: "The agent's configuration determines which fields are required. Always ask the caller for all required information before booking."

**4. Inject required-fields instructions into agent system prompt**
- `netlify/functions/services/vapi-config.ts` — in `buildToolContext`, read `calendar_booking.required_fields` and append instructions like: "Before booking, you MUST collect the following from the caller: phone number, service address. Do not proceed with booking until all required fields are provided."

**5. Enforce in the edge function**
- `supabase/functions/vapi-calendar-api/index.ts` — in `bookAppointment`:
  - Look up the agent's `config.calendar_booking.required_fields`
  - Validate each required field is present; return a clear error if missing
  - Store extra fields in the `notes` column or a new `metadata` jsonb on `calendar_bookings`

**6. Add metadata column to calendar_bookings** (migration)
- Add `metadata jsonb default '{}'` to `calendar_bookings` to store phone, address, custom fields without schema changes for every new field

**7. Include extra fields in confirmation email**
- Update the Resend email template in `vapi-calendar-api/index.ts` to display any collected phone/address/custom fields

### Files modified
- `src/types/agents.ts`
- `src/components/agents/CalendarBookingConfig.tsx`
- `netlify/functions/services/vapi-config.ts`
- `supabase/functions/register-vapi-calendar-tools/index.ts`
- `supabase/functions/vapi-calendar-api/index.ts`
- New migration for `metadata` column on `calendar_bookings`

