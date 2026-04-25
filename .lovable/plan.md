# Live Call Coach (Beta) Integration Plan

## Architecture decision

You set up `livecoach.ringster.ai` → Vercel (frontend) → Railway (backend). Inside Ringster we add a sidebar item that loads the Vercel app in an iframe, with a usage gate that enforces monthly session limits per subscription tier.

**Why this approach:**
- Ships in hours, not days — no migration of the Vercel/Railway stack
- Feels native (sidebar, no new tab)
- Keeps Live Call Coach independently deployable while in Beta
- When it graduates from Beta, we can migrate to a true in-repo page

---

## Tier-based access (your custom answer)

| Plan | Monthly sessions | Behavior when exhausted |
|---|---|---|
| Free | 0 (locked) | Sidebar item shows lock icon, click opens upgrade modal |
| Starter ($99) | 1 / month | After 1 session, show "Upgrade for more sessions" overlay |
| Professional ($499) | 5 / month | After 5 sessions, same upgrade overlay |
| Enterprise ($1,999) | Unlimited | No limit |

A "session" = one tracked use of Live Call Coach. We start counting when the user clicks "Start Session" inside the embedded app (or when the iframe loads, depending on what your Railway backend can signal — see open question #2 below).

---

## Implementation steps

### 1. Database — track sessions per user per month
New table `live_coach_sessions`:
- `id`, `user_id`, `started_at`, `ended_at` (nullable), `session_token` (uuid for the embed handshake), `metadata` (jsonb for whatever Live Call Coach reports back)
- RLS: users can SELECT their own; service role manages all
- Index on `(user_id, started_at)` for fast monthly counts

A `has_live_coach_access(p_user_id)` SECURITY DEFINER function returns `{ allowed: bool, sessions_used: int, limit: int|null, plan_name: text }` — used by both the sidebar (to render lock state) and the page (to gate the iframe).

### 2. Edge function — `start-live-coach-session`
- Validates JWT, looks up user's plan from `user_subscriptions` + `subscription_plans`
- Counts sessions in the current calendar month from `live_coach_sessions`
- If under the limit: inserts a row, returns `{ session_token, expires_at }`
- If over: returns 403 with `{ reason: 'limit_reached', limit, used }`

### 3. Sidebar — new "Live Call Coach (Beta)" item
- Add to `ManagementMenu.tsx` (or new "Beta Features" section)
- Use `Headphones` or `Radio` icon, with a small "BETA" pill badge
- For Free users: show a lock icon overlay; click → upgrade modal instead of navigating

### 4. New route — `/dashboard/live-coach`
New file `src/pages/Dashboard/LiveCoach.tsx`:
- On mount, calls `start-live-coach-session` edge function
- If allowed: renders `<iframe src="https://livecoach.ringster.ai?token={session_token}" allow="microphone; camera" />` full-height
- If blocked: renders an upgrade card showing usage (e.g. "5 of 5 sessions used this month") with "Upgrade Plan" CTA → `/dashboard/subscription`
- Header shows "X of Y sessions used this month" (or "Unlimited" for Enterprise)

Register the route in `src/pages/Dashboard.tsx`.

### 5. Subdomain setup (you handle)
- In Vercel: add `livecoach.ringster.ai` as a custom domain
- In your DNS (Lovable-managed for ringster.ai): add a CNAME `livecoach` → Vercel's target

### 6. Auth handshake (deferred per your answer)
For Beta v1 we just pass the `session_token` as a query param. The Vercel/Railway side can later validate it by calling a Supabase edge function `verify-live-coach-session` that checks the token exists and isn't expired. This is enough to prevent random people from loading the iframe URL directly.

---

## Files to create / edit

**Create:**
- `supabase/migrations/<timestamp>_live_coach_sessions.sql` — table, RLS, `has_live_coach_access` function
- `supabase/functions/start-live-coach-session/index.ts`
- `src/pages/Dashboard/LiveCoach.tsx`
- `src/hooks/useLiveCoachAccess.ts` — wraps the access check for sidebar + page

**Edit:**
- `src/pages/Dashboard.tsx` — add route
- `src/components/dashboard/sidebar/ManagementMenu.tsx` — add menu item with BETA badge + lock state

---

## Open questions to resolve before I build

1. **Sidebar placement**: under "Management" alongside Calendar/Recordings/Analytics, or a new "Beta Features" group at the bottom? I'd lean toward Management for discoverability.
2. **Session counting trigger**: when should a session "count"?
   - **Option A**: As soon as the user opens `/dashboard/live-coach` and the iframe loads (simple, slightly unfair if they immediately leave)
   - **Option B**: When the Live Call Coach app explicitly POSTs back to a Supabase webhook saying "session started" — requires a small change on your Railway backend, but is fairest
3. **Upgrade modal copy**: anything specific you want to say on the lock screen, or use a generic "Live Call Coach is available on Starter and above"?
4. **Microphone permission**: confirm the embedded app needs mic access via `getUserMedia`? If yes the iframe needs `allow="microphone"` (already in the plan).

Pick answers for #1 and #2 and I'll execute.
