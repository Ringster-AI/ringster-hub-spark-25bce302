import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // User client for auth verification
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Admin client for data deletion
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      throw new Error("Unauthorized");
    }

    const userId = user.id;
    console.log(`Starting account deletion for user: ${userId}`);

    // 1. Cancel Stripe subscription if exists
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (stripeSecretKey) {
      try {
        const stripe = new Stripe(stripeSecretKey, {
          apiVersion: "2023-10-16",
        });

        // Get user's subscription
        const { data: subscription } = await supabaseAdmin
          .from("user_subscriptions")
          .select("stripe_subscription_id, stripe_customer_id")
          .eq("user_id", userId)
          .single();

        if (subscription?.stripe_subscription_id) {
          console.log(`Cancelling Stripe subscription: ${subscription.stripe_subscription_id}`);
          await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
          console.log("Stripe subscription cancelled");
        }

        // Delete the Stripe customer to remove all payment methods
        if (subscription?.stripe_customer_id) {
          console.log(`Deleting Stripe customer: ${subscription.stripe_customer_id}`);
          await stripe.customers.del(subscription.stripe_customer_id);
          console.log("Stripe customer deleted");
        }
      } catch (stripeError) {
        console.error("Stripe error (continuing with deletion):", stripeError);
        // Continue with deletion even if Stripe fails
      }
    }

    // 2. Delete all user data in order (respecting foreign key constraints)
    console.log("Deleting user data...");

    // Delete calendar bookings
    await supabaseAdmin
      .from("calendar_bookings")
      .delete()
      .eq("google_integration_id", userId);
    console.log("Deleted calendar bookings");

    // Delete calendar tools (via agent_id)
    const { data: agents } = await supabaseAdmin
      .from("agent_configs")
      .select("id")
      .eq("user_id", userId);

    if (agents && agents.length > 0) {
      const agentIds = agents.map((a) => a.id);
      
      await supabaseAdmin
        .from("calendar_tools")
        .delete()
        .in("agent_id", agentIds);
      console.log("Deleted calendar tools");

      await supabaseAdmin
        .from("tool_call_logs")
        .delete()
        .in("agent_id", agentIds);
      console.log("Deleted tool call logs");

      // Delete call recordings and logs
      const { data: callLogs } = await supabaseAdmin
        .from("call_logs")
        .select("id")
        .in("agent_id", agentIds);

      if (callLogs && callLogs.length > 0) {
        const callLogIds = callLogs.map((c) => c.id);
        
        await supabaseAdmin
          .from("call_recordings")
          .delete()
          .in("call_log_id", callLogIds);
        console.log("Deleted call recordings");

        await supabaseAdmin
          .from("credit_transactions")
          .delete()
          .in("call_log_id", callLogIds);
      }

      await supabaseAdmin
        .from("call_logs")
        .delete()
        .in("agent_id", agentIds);
      console.log("Deleted call logs");
    }

    // Delete campaigns and related data
    const { data: campaigns } = await supabaseAdmin
      .from("campaigns")
      .select("id")
      .eq("user_id", userId);

    if (campaigns && campaigns.length > 0) {
      const campaignIds = campaigns.map((c) => c.id);

      await supabaseAdmin
        .from("campaign_integrations")
        .delete()
        .in("campaign_id", campaignIds);
      console.log("Deleted campaign integrations");

      await supabaseAdmin
        .from("follow_up_sequences")
        .delete()
        .in("campaign_id", campaignIds);
      console.log("Deleted follow up sequences");

      await supabaseAdmin
        .from("booking_requests")
        .delete()
        .in("campaign_id", campaignIds);
      console.log("Deleted booking requests");

      await supabaseAdmin
        .from("campaign_contacts")
        .delete()
        .in("campaign_id", campaignIds);
      console.log("Deleted campaign contacts");

      await supabaseAdmin
        .from("calendar_bookings")
        .delete()
        .in("campaign_id", campaignIds);
    }

    await supabaseAdmin
      .from("campaigns")
      .delete()
      .eq("user_id", userId);
    console.log("Deleted campaigns");

    // Delete agent configs
    await supabaseAdmin
      .from("agent_configs")
      .delete()
      .eq("user_id", userId);
    console.log("Deleted agent configs");

    // Delete remaining credit transactions
    await supabaseAdmin
      .from("credit_transactions")
      .delete()
      .eq("user_id", userId);
    console.log("Deleted credit transactions");

    // Delete user credits
    await supabaseAdmin
      .from("user_credits")
      .delete()
      .eq("user_id", userId);
    console.log("Deleted user credits");

    // Delete custom voices
    await supabaseAdmin
      .from("custom_voices")
      .delete()
      .eq("created_by", userId);
    console.log("Deleted custom voices");

    // Delete google integrations
    await supabaseAdmin
      .from("google_integrations")
      .delete()
      .eq("user_id", userId);
    console.log("Deleted google integrations");

    // Delete integrations
    await supabaseAdmin
      .from("integrations")
      .delete()
      .eq("user_id", userId);
    console.log("Deleted integrations");

    // Delete oauth states
    await supabaseAdmin
      .from("oauth_states")
      .delete()
      .eq("user_id", userId);
    console.log("Deleted oauth states");

    // Delete usage summary
    await supabaseAdmin
      .from("usage_summary")
      .delete()
      .eq("user_id", userId);
    console.log("Deleted usage summary");

    // Delete user subscription
    await supabaseAdmin
      .from("user_subscriptions")
      .delete()
      .eq("user_id", userId);
    console.log("Deleted user subscription");

    // Delete user roles
    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", userId);
    console.log("Deleted user roles");

    // Delete organization
    await supabaseAdmin
      .from("organizations")
      .delete()
      .eq("user_id", userId);
    console.log("Deleted organization");

    // Delete cookie consent logs
    await supabaseAdmin
      .from("cookie_consent_logs")
      .delete()
      .eq("user_id", userId);
    console.log("Deleted cookie consent logs");

    // Delete profile
    await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);
    console.log("Deleted profile");

    // 3. Delete the auth user
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      console.error("Error deleting auth user:", deleteUserError);
      throw deleteUserError;
    }
    console.log("Deleted auth user");

    console.log(`Account deletion completed for user: ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Delete account error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to delete account" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
