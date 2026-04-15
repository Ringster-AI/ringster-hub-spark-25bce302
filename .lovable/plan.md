

# Cal.com and Calendly Integration Plan for Ringster Agents

## Overview

Add Cal.com and Calendly as calendar provider options alongside the existing Google Calendar integration, allowing Ringster agents to check availability and book appointments into these platforms via their APIs.

## Architecture

The existing system follows a clean provider pattern:
- `IntegrationProvider` interface (connect/disconnect/refresh/test)
- `IntegrationRegistry` registers providers and types
- `vapi-calendar-api` Edge Function handles agent booking calls (check_availability, book_appointment)
- `resolveTenant()` currently resolves agent → user → `google_integrations` table

The key change: make `vapi-calendar-api` provider-agnostic so it delegates to the correct calendar backend (Google, Cal.com, or Calendly) based on the user's connected integration.

```text
Agent call → vapi-calendar-api
                 ↓
           resolveTenant()
                 ↓
      ┌──────────┼──────────┐
      │          │          │
  Google    Cal.com    Calendly
  (direct   (REST      (REST
   API)      API)       API)
```

## Implementation Steps

### 1. Create Cal.com Provider (frontend)

**New file: `src/services/integrations/providers/CalComProvider.ts`**

- Implements `IntegrationProvider` interface
- `connect()`: prompts user for their Cal.com API key (v2 API), stores it encrypted via the `encrypt-integration-credentials` function
- `disconnect()`: removes the integration record
- `test()`: calls Cal.com `/availability` endpoint to verify the key works
- Config schema: API key, event type slug, default duration

### 2. Create Calendly Provider (frontend)

**New file: `src/services/integrations/providers/CalendlyProvider.ts`**

- Implements `IntegrationProvider` interface
- `connect()`: initiates OAuth2 flow via a new `connect-calendly` Edge Function (Calendly uses OAuth2)
- `disconnect()`: revokes token, removes integration
- `test()`: calls Calendly `/users/me` to verify connectivity
- Config schema: event type URI, default duration

### 3. Register Providers in IntegrationRegistry

**Edit: `src/services/integrations/IntegrationRegistry.ts`**

- Add `cal_com` and `calendly` entries to `types[]` with `isAvailable: true`
- Register providers in the static initializer block

### 4. Create Backend Edge Functions

**New: `supabase/functions/connect-calendly/index.ts`**
- OAuth2 authorization URL generator (similar to `connect-google`)

**New: `supabase/functions/calendly-callback/index.ts`**
- Handles OAuth callback, stores encrypted tokens in `integrations` table

**New: `supabase/functions/store-calcom-key/index.ts`**
- Accepts encrypted Cal.com API key, validates it, stores in `integrations` table

### 5. Make vapi-calendar-api Provider-Agnostic

**Edit: `supabase/functions/vapi-calendar-api/index.ts`**

This is the core change. Refactor `resolveTenant()` to:

1. Look up the agent's user
2. Check `integrations` table for any calendar-capable integration (not just `google_integrations`)
3. Return a `calendarProvider` field (`google`, `cal_com`, or `calendly`)

Then extract provider-specific logic into helper modules:

- **Google**: existing FreeBusy + Events API calls (unchanged)
- **Cal.com**: `GET /availability` for slots, `POST /bookings` to book
- **Calendly**: `GET /event_type_available_times` for slots, `POST /scheduling_links` or invitee creation for booking

The `checkAvailability()` and `bookAppointment()` functions become dispatchers:

```text
checkAvailability(params) {
  tenant = resolveTenant(...)
  switch(tenant.provider) {
    case 'google':  return googleCheckAvailability(...)
    case 'cal_com': return calcomCheckAvailability(...)
    case 'calendly': return calendlyCheckAvailability(...)
  }
}
```

### 6. Database Migration

- No new tables needed — uses existing `integrations` table
- `integration_type` values: `cal_com`, `calendly`
- Credentials stored encrypted (same pattern as Google tokens)

### 7. UI Updates

**Edit: `src/components/calendar/AgentCalendarToolsManagement.tsx`**

- Show which calendar provider is connected
- Allow switching between providers in agent calendar settings

**Edit: `src/components/settings/Integrations.tsx`**

- Cal.com and Calendly cards appear in the integrations management page (already scaffolded via registry)

## Required Secrets

| Secret | Purpose |
|--------|---------|
| `CALENDLY_CLIENT_ID` | OAuth2 app ID |
| `CALENDLY_CLIENT_SECRET` | OAuth2 app secret |
| `CAL_COM_WEBHOOK_SECRET` | (optional) webhook verification |

Cal.com uses API keys (no OAuth needed), so no client ID/secret required for it.

## API Details

- **Cal.com v2 API**: `https://api.cal.com/v2/` — uses Bearer token (API key). Endpoints: `/slots/available`, `/bookings`
- **Calendly API v2**: `https://api.calendly.com/` — uses OAuth2 Bearer token. Endpoints: `/event_type_available_times`, `/scheduled_events`

