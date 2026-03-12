

## Problem

The VAPI PATCH request to update assistant `12e95db6-57e6-4f96-9d1d-6b4cdb7181c2` returns **"Couldn't Find"** — meaning this assistant no longer exists in the VAPI account (deleted or created under a different API key). The update action has no fallback, so it just fails.

Additionally, `vapi_global_config` is empty (confirmed via DB query), so the self-healing tool creation runs every time but the assistant update still fails before those tools can be attached.

## Plan

### Fix 1: Auto-recreate assistant when PATCH returns "not found"
**File: `netlify/functions/manage-vapi-assistant.ts`**

In the `update` action, after the PATCH fails with a "Couldn't Find" error:
1. Catch the specific "Couldn't Find" error
2. Fall back to creating a brand-new VAPI assistant using `vapiService.createAssistant(vapiConfig)`
3. Update `agent_configs.vapi_assistant_id` and `config.vapi_assistant_id` with the new ID
4. Import the Twilio phone number to the new assistant if one exists
5. Continue normally

This makes the system self-healing for stale/deleted assistant IDs.

### Fix 2: Ensure `vapi_global_config` upsert uses correct conflict key
The upsert to `vapi_global_config` may be silently failing if the table has no primary key on `key` column. Verify the upsert includes `onConflict: 'key'` so it works correctly.

### Summary of changes

| File | Change |
|------|--------|
| `netlify/functions/manage-vapi-assistant.ts` | Add fallback: if PATCH returns "not found", create a new assistant and update DB |

