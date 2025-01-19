import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    const body = await req.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
      );
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed.`, err.message);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`🔔 Event received: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const priceId = subscription.items.data[0].price.id;

        console.log('Processing subscription event:', {
          customerId,
          priceId,
          status: subscription.status
        });

        // Get customer's email
        const customer = await stripe.customers.retrieve(customerId as string);
        if (!customer || !('email' in customer)) {
          throw new Error('No customer email found');
        }

        console.log('Found customer:', customer.email);

        // Get user by email
        const { data: users, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customer.email)
          .single();

        if (userError || !users) {
          console.error('User lookup error:', userError);
          throw new Error(`No user found for email: ${customer.email}`);
        }

        console.log('Found user:', users.id);

        // Get plan from Stripe price ID
        const { data: plans, error: planError } = await supabase
          .from('subscription_plans')
          .select('id')
          .eq('stripe_price_id', priceId)
          .single();

        if (planError || !plans) {
          console.error('Plan lookup error:', planError);
          throw new Error(`No plan found for price: ${priceId}`);
        }

        console.log('Found plan:', plans.id);

        // Update subscription with new plan ID and status
        const { error: updateError } = await supabase.rpc(
          'handle_subscription_update',
          {
            user_id: users.id,
            new_plan_id: plans.id,
            new_status: subscription.status,
            new_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            new_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          }
        );

        if (updateError) {
          console.error('Subscription update error:', updateError);
          throw updateError;
        }

        console.log(`✅ Successfully processed ${event.type} for ${customer.email}`);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});