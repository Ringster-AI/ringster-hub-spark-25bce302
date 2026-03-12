

## Analysis of Your Two Questions

### 1. "What happens tomorrow if no sync takes place?"

You're exactly right to question this. If we inject a static date like "Today is Wednesday, March 12, 2026" into the system prompt at sync time, the agent will think it's March 12 forever until someone edits/re-saves the agent. This is a bad approach.

**Better solution**: Instead of putting the date in the system prompt, we should:
- **Add a `get_current_datetime` Vapi code tool** that returns the current server date/time when the agent calls it. This is always fresh with zero syncing needed.
- **Modify the `check_availability` response** to also include `current_date` and `current_day` in its return payload so the agent always has temporal context when doing calendar work.

### 2. "Do the code tools have descriptions?"

Yes, partially:
- `check_availability` has: *"Check available appointment slots on a specific date. Returns available time slots for booking."*
- `book_appointment` has: *"Book an appointment at a specific date and time. Use check_availability first to find open slots."*
- `transferCall` has: *"Transfer the call to a specific department or person."*

**But the problem is**: the transfer tool only lists phone numbers as enum values -- the agent has no idea that "6475235895" maps to "marcel". The system prompt (agent description) needs to contain the name-to-number mapping so the agent can reason about WHO to transfer to.

---

## Plan

### Step 1: Create a `get_current_datetime` global code tool
Register a new Vapi code tool alongside the calendar tools in `register-vapi-calendar-tools`. This tool takes no required parameters and returns `{ date, day_of_week, time, timezone }` from the server. It gets attached to all assistants via `toolIds`, so every agent can ask "what day is it?" without any sync.

**File**: `supabase/functions/register-vapi-calendar-tools/index.ts` -- add a third tool definition and store its ID in `vapi_global_config`.

### Step 2: Self-healing calendar tool registration in manage-vapi-assistant
When an agent has calendar enabled but `vapi_global_config` has no calendar tool IDs, inline-create the three tools (check_availability, book_appointment, get_current_datetime) by calling the Vapi API directly from the Netlify function and store the IDs. This uses the `VAPI_API_KEY` already available in Netlify env.

**File**: `netlify/functions/manage-vapi-assistant.ts` -- add a `ensureCalendarToolsExist()` helper that creates tools if missing.

### Step 3: Enrich the system prompt with transfer directory context
When building the Vapi assistant config, append transfer directory details to the system prompt so the agent knows the name-to-number mapping. Example addition: *"You can transfer calls. Available transfers: Marcel (6475235895). Use the transferCall tool with the phone number as the destination."*

This is static config that doesn't go stale (it only changes when the agent is re-saved, which triggers a sync anyway).

**File**: `netlify/functions/services/vapi-config.ts` -- modify `createVapiAssistantConfig` to append transfer directory and calendar instructions to the system message content.

### Step 4: Include current date in calendar API responses
Modify the `check_availability` response to include `current_date` and `current_day_of_week` so the agent always knows what day it is when doing calendar operations.

**File**: `supabase/functions/vapi-calendar-api/index.ts` -- add `current_date` and `current_day` to the return object of `checkAvailability`.

### Step 5: Improve transfer tool error handling
Add try/catch with logging around the transfer tool creation in the create path and ensure `transfer_tool_id` is persisted even if other operations fail.

**File**: `netlify/functions/manage-vapi-assistant.ts` -- wrap transfer tool creation in explicit error handling on the create path.

---

## Summary of Changes

| File | Change |
|------|--------|
| `supabase/functions/register-vapi-calendar-tools/index.ts` | Add `get_current_datetime` code tool |
| `netlify/functions/manage-vapi-assistant.ts` | Self-healing calendar tool registration; transfer tool error handling |
| `netlify/functions/services/vapi-config.ts` | Append transfer directory + calendar context to system prompt |
| `supabase/functions/vapi-calendar-api/index.ts` | Add `current_date`/`current_day` to availability response |

