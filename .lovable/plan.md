

## Updated Plan: Final Considerations Added

All 8 items are incorporated into the previously approved plan. Here are the specific changes:

### 1. Overlap Prevention (replaces simple unique constraint)

Instead of `UNIQUE(appointment_datetime, google_integration_id)`, use a PostgreSQL **exclusion constraint** with `tsrange`:

```sql
ALTER TABLE calendar_bookings
ADD COLUMN appointment_end timestamp with time zone
  GENERATED ALWAYS AS (appointment_datetime + (duration_minutes || ' minutes')::interval) STORED;

ALTER TABLE calendar_bookings
ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (
    google_integration_id WITH =,
    tstzrange(appointment_datetime, appointment_datetime + (duration_minutes || ' minutes')::interval) WITH &&
  );
```

This requires enabling the `btree_gist` extension. This provides database-level overlap prevention, not just same-start-time prevention.

### 2. Idempotency for Google Event Creation

- Generate a UUID `idempotency_key` in the code tool before calling the edge function.
- Pass it to `book_appointment` as a parameter.
- The edge function inserts `idempotency_key` into `calendar_bookings` (new nullable column) with a unique constraint.
- Before creating a Google event, check if a booking with that key already exists. If so, return the existing booking.
- This prevents duplicate Google events on retries.

**DB change**: Add `idempotency_key text UNIQUE` column to `calendar_bookings`.

### 3. Owner Notification Rate Limiting

In the edge function's auth failure handler, before sending email:
- Query `integration_logs` for entries with `action = 'auth_failure'` for the same `integration_id` within the last 24 hours.
- Only send email if no such entry exists (first failure in window).
- Log every failure, but email only once per day.

### 4. Duration-Aware Availability Check

- Add optional `duration_minutes` parameter to `check_availability` code tool (default: 30).
- Edge function filters free slots to only return windows where the full duration fits.
- For `book_appointment`, the FreeBusy pre-check verifies the entire `[datetime, datetime + duration]` interval is free.

### 5. Edge Function Booking Idempotency

Already addressed by item 2. The `idempotency_key` from the code tool serves both purposes: preventing duplicate Google events AND deduplicating edge function invocations.

### 6. Calendar Selection Logic

- The edge function uses `google_integrations.calendar_id` as the target calendar.
- If `calendar_id` is null, default to `"primary"` (Google's default).
- The `calendar_tools.configuration` can optionally override with a `calendar_id` field, which takes precedence.
- Resolution order: `calendar_tools.configuration.calendar_id` → `google_integrations.calendar_id` → `"primary"`.

### 7. Edge Function Timeout

No change needed. 60s Pro plan limit is sufficient.

### 8. Migration Safety for Existing Data

The migration will:
1. Delete exact duplicates from `calendar_bookings` before adding constraints (keep the most recent by `updated_at`).
2. Apply the exclusion constraint only after cleanup.

```sql
-- Clean up exact duplicates before constraint
DELETE FROM calendar_bookings a
USING calendar_bookings b
WHERE a.id < b.id
  AND a.appointment_datetime = b.appointment_datetime
  AND a.google_integration_id = b.google_integration_id;
```

---

### Updated Files Summary

| File | Action | Changes from previous plan |
|------|--------|---------------------------|
| `supabase/functions/vapi-calendar-api/index.ts` | **Create** | + idempotency_key check, + duration-aware availability, + calendar_id resolution chain, + notification rate limiting |
| `supabase/functions/register-vapi-calendar-tools/index.ts` | **Create** | + `duration_minutes` param on check_availability, + `idempotency_key` param on book_appointment |
| `supabase/config.toml` | **Modify** | Add both new functions |
| `netlify/functions/manage-vapi-assistant.ts` | **Modify** | Attach/detach toolIds |
| `netlify/functions/services/vapi-config.ts` | **Modify** | Add toolIds to config type |
| `src/utils/agentDescriptionUtils.ts` | **Modify** | Richer calendar instructions |
| `src/components/calendar/hooks/useAgentCalendarData.ts` | **Modify** | Trigger registration on enable |
| DB migration | **Create** | `vapi_global_config` table, `btree_gist` extension, exclusion constraint on `calendar_bookings`, `idempotency_key` column, `appointment_end` generated column, duplicate cleanup, service role policies |

### New Secret Required
- **`VAPI_CALENDAR_SECRET`**: Shared secret for code tool → edge function auth.

