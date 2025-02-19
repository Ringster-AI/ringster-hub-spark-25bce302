
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
};

interface FeedbackRequest {
  message: string;
  userEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log(`${req.method} request to ${req.url}`);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain',
      } 
    });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error(`HTTP method ${req.method} is not allowed`);
    }

    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    const { message, userEmail }: FeedbackRequest = await req.json();

    if (!message || !userEmail) {
      throw new Error('Missing required fields: message and userEmail are required');
    }

    console.log('Attempting to send feedback email for:', userEmail);

    const emailResponse = await resend.emails.send({
      from: "Ringster Feedback <feedback@ringster.ai>",
      to: ["admin@ringster.ai"],
      subject: "New User Feedback",
      html: `
        <h2>New Feedback Received</h2>
        <p><strong>From:</strong> ${userEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-feedback function:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString(),
        timestamp: new Date().toISOString()
      }),
      {
        status: error.status || 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
