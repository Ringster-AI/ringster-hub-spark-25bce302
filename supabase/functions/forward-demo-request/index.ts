
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface DemoRequest {
  fullName: string
  email: string
  phone: string
  companyName: string
  teamSize: string
  industry?: string
  jobTitle?: string
  preferredDate?: string
  message?: string
}

serve(async (req) => {
  // Add CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get webhook URL from environment variable
    const webhookUrl = Deno.env.get('RINGSTER_THANKYOU')
    if (!webhookUrl) {
      throw new Error('RINGSTER_THANKYOU webhook URL is not configured')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse the request body
    const data: DemoRequest = await req.json()
    console.log('Demo request received:', data)

    // Basic validation
    if (!data.fullName || !data.email || !data.phone || !data.companyName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert the demo request into the database
    const { error: insertError } = await supabase
      .from('demo_requests')
      .insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        company_name: data.companyName,
        team_size: data.teamSize,
        industry: data.industry,
        job_title: data.jobTitle,
        preferred_date: data.preferredDate,
        message: data.message
      })

    if (insertError) {
      console.error('Error inserting demo request:', insertError)
      // Continue with the webhook call even if DB insert fails
    }

    // Forward the data to the webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName,
        teamSize: data.teamSize,
        industry: data.industry || '',
        jobTitle: data.jobTitle || '',
        preferredDate: data.preferredDate || '',
        message: data.message || '',
        source: 'ebook'
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Webhook error response:', errorText)
      throw new Error(`Webhook responded with status: ${response.status}`)
    }

    // Update the demo_requests record to mark it as forwarded
    if (!insertError) {
      await supabase
        .from('demo_requests')
        .update({ forwarded: true })
        .eq('email', data.email)
        .eq('full_name', data.fullName)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing demo request:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process demo request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
