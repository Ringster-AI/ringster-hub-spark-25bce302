

## Plan: Fix Credit Balance Privilege Escalation

### Problem
The `user_credits` table has an UPDATE RLS policy ("Users can update their own credits") that lets any authenticated user directly modify their row — including `plan_credits` and `add_on_credits`. A malicious user could grant themselves unlimited credits via a direct Supabase client call.

### Why it's safe to remove
All legitimate credit mutations already use SECURITY DEFINER database functions (`deduct_credits`, `add_credits`, `reset_monthly_credits`, `initialize_user_credits`) which bypass RLS entirely. The frontend `CreditsService` calls these RPCs — it never does a direct `.update()` on `user_credits`. Removing the user-facing UPDATE policy breaks nothing.

### Fix (1 migration)
Drop the permissive UPDATE policy on `user_credits`:

```sql
DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;
```

That's the entire fix. Users keep SELECT access to view their credits. Service role keeps ALL access. The SECURITY DEFINER functions continue to work unchanged.

### Files
- New migration file (single SQL statement)

