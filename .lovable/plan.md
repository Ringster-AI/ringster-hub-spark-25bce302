

## Issues Found in Calendar Booking Implementation

After reviewing the deployed code, edge function logs (no invocations yet), secrets, and database state, I identified **4 critical issues** that will prevent the flow from working.

---

### Issue 1: Missing `assistant_id` Injection in Code Tools

The Vapi code tools reference `params.assistant_id` but this value is never provided. The tool parameter schemas in `register-vapi-calendar-tools/index.ts` don't include `assistant_id`, and the environment variables don't set it either.

**The original plan specified using `{{call.assistantId}}`** — a Vapi Liquid template variable that resolves to the current assistant's ID at runtime. This needs to be injected as a hardcoded environment variable on the tool, or as a default parameter value.

**Fix**: Add `assistant_id` as an environment variable to both tools using the Vapi Liquid template `{{call.assistantId}}`. In the `buildCheckAvailabilityTool` and `buildBookAppointmentTool` functions, add it to `environmentVariables`. Then in the code tool source, read it from `params.assistant_id` (which maps from env vars).

Actually, Vapi Code Tools environment variables don't support Liquid templates. The correct approach is to **add `assistant_id` as a hidden/injected parameter** in the code itself, using Vapi's `call` context object. The code tool's `main` function receives a second argument with call context. Alternatively, pass it via the tool's `function.parameters` but mark it with a description telling the AI to use `{{call.assistantId}}`.

**Simplest fix**: Add `assistant_id` to the code tool's environment variables list, but since it changes per assistant, we can't use env vars. Instead, we should modify the code to accept `assistant_id` as a required function parameter, and in the assistant's model config, ensure the AI always passes it. The `agentDescriptionUtils.ts` instructions should tell the AI: "Always pass your own assistant ID."

**Best approach**: Since Vapi provides `call.assistant.id` in the code tool context, modify the tool code to extract it:

```javascript
async function main({ params, call }) {
  const assistantId = call?.assistant?.id || params.assistant_id;
  // ... rest of code
}
```

### Issue 2: Missing Required Supabase Secrets

The edge functions need these secrets but only `VAPI_CALENDAR_SECRET` and `TOKEN_ENCRYPTION_KEY` are configured:

- **`VAPI_API_KEY`** — needed by `register-vapi-calendar-tools` to create tools in Vapi
- **`GOOGLE_CLIENT_ID`** — needed by `vapi-calendar-api` for token refresh  
- **`GOOGLE_CLIENT_SECRET`** — needed by `vapi-calendar-api` for token refresh
- **`RESEND_API_KEY`** — needed for owner auth failure notifications (optional but in code)

Without `VAPI_API_KEY`, the registration function will fail. Without Google credentials, token refresh will fail.

**Fix**: Add these secrets via the secrets tool.

### Issue 3: Missing `allow_public_network_access` on `vapi-calendar-api`

The `vapi-calendar-api` function calls Google's APIs (`googleapis.com`). In `supabase/config.toml`, it's missing `allow_public_network_access = true`, which means outbound HTTP requests to Google will be blocked.

**Fix**: Add `allow_public_network_access = true` to the `[functions.vapi-calendar-api]` and `[functions.register-vapi-calendar-tools]` sections in `config.toml`.

### Issue 4: `toolIds` Placement in Vapi Config

In `manage-vapi-assistant.ts`, `toolIds` is placed inside `model` (`vapiConfig.model.toolIds`). According to Vapi's API, `toolIds` should be a **top-level** property on the assistant config, not nested inside `model`. This means tools are never actually attached to the assistant.

**Fix**: Change `vapiConfig.model.toolIds` to set `toolIds` at the top level of the PATCH/POST body, not inside the model object. Update the `VapiAssistantConfig` interface accordingly.

---

### Implementation Summary

| File | Change |
|------|--------|
| `supabase/functions/register-vapi-calendar-tools/index.ts` | Fix code tool source to extract `assistant_id` from `call.assistant.id` |
| `supabase/config.toml` | Add `allow_public_network_access = true` to both calendar functions |
| `netlify/functions/manage-vapi-assistant.ts` | Move `toolIds` from `model` to top-level in the PATCH/POST body |
| `netlify/functions/services/vapi-config.ts` | Move `toolIds` to top-level interface |
| Supabase secrets | Add `VAPI_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY` |

