

## Plan: Make Email Required + Send Meeting Confirmations

### What changes

**1. Make `attendee_email` required in the Vapi tool definition**

In `supabase/functions/register-vapi-calendar-tools/index.ts`:
- Change the `book_appointment` tool's `required` array from `['datetime', 'attendee_name']` to `['datetime', 'attendee_name', 'attendee_email']`
- Update the description to emphasize email is required
- Bump `TOOL_VERSION` to `'1.2'` to force tool re-registration

**2. Validate email in the booking edge function**

In `supabase/functions/vapi-calendar-api/index.ts`:
- Add a validation check at the top of `bookAppointment` — if `attendee_email` is missing or invalid, return an error telling the agent to collect the email first

**3. Send a confirmation email after successful booking**

In `supabase/functions/vapi-calendar-api/index.ts`, after the booking is saved to the DB (around line 551):
- Use the existing Resend API key (`RESEND_API_KEY`) to send a branded confirmation email to the attendee
- Include: appointment date/time (formatted in their timezone), duration, appointment type, and a note from Ringster
- This uses the same Resend pattern already in the file (lines 194-209)

**4. Deploy both edge functions**

- Deploy `vapi-calendar-api` (confirmation email logic)
- Deploy `register-vapi-calendar-tools` (updated tool schema)
- User will need to re-register tools for their agents (or we trigger it)

### Technical details

- No new edge functions or infrastructure needed — Resend is already configured and used in this file
- Google Calendar already sends its own invite via `sendUpdates=all` on event creation, but this adds a branded Ringster confirmation
- The confirmation email will be sent from `notifications@ringster.ai` (same sender as auth failure notifications)

