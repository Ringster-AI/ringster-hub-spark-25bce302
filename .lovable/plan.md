

## Problem

The Vapi API rejects code tool creation with 400 Bad Request because `name`, `description`, and `parameters` are nested inside a `function` object. For `type: "code"` tools, Vapi expects these at the **top level**.

Current (wrong):
```text
{
  type: "code",
  function: {
    name: "check_availability",
    description: "...",
    parameters: { ... }
  },
  code: "...",
}
```

Correct per Vapi docs:
```text
{
  type: "code",
  name: "check_availability",
  description: "...",
  parameters: { ... },
  code: "...",
}
```

## Changes

### File 1: `netlify/functions/manage-vapi-assistant.ts` (lines 125-158)
Flatten the three tool definitions -- move `name`, `description`, and `parameters` out of the `function` wrapper to the top level of each tool object. Remove the `function` key entirely.

### File 2: `supabase/functions/register-vapi-calendar-tools/index.ts`
Same fix in `buildCheckAvailabilityTool`, `buildBookAppointmentTool`, and `buildGetCurrentDatetimeTool` -- move `name`, `description`, `parameters` from inside `function` to the top level. Remove the `function` key.

Both files have the identical structural issue and need the same fix.

