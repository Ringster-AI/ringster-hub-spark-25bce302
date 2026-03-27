import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { decryptToken, isEncrypted } from '../_shared/crypto.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-vapi-secret',
}

const TOKEN_ENCRYPTION_KEY = Deno.env.get('TOKEN_ENCRYPTION_KEY') || ''

const GOOGLE_API_BASE = 'https://www.googleapis.com'

// Retry helper for Google API calls (429/5xx)
async function withRetry<T>(fn: () => Promise<T>, retries = 2, baseDelayMs = 500): Promise<T> {
  let lastError: Error
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      lastError = err
      const status = err?.status || err?.statusCode
      const retryable = status === 429 || (status >= 500 && status < 600)
      if (!retryable || attempt === retries) throw err
      const delay = baseDelayMs * Math.pow(2, attempt)
      console.warn(`Google API retry ${attempt + 1}/${retries}`, { status, delay })
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw lastError!
}

// Refresh Google access token
async function refreshGoogleToken(
  supabase: any,
  integration: any
): Promise<string> {
  const now = new Date()
  const expiresAt = new Date(integration.expires_at)

  if (expiresAt > now) {
    // Decrypt if encrypted
    let token = integration.access_token
    if (TOKEN_ENCRYPTION_KEY && isEncrypted(token)) {
      token = await decryptToken(token, TOKEN_ENCRYPTION_KEY)
    }
    return token
  }

  const clientId = Deno.env.get('GOOGLE_CLIENT_ID')!
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!

  // Decrypt refresh token if encrypted
  let refreshToken = integration.refresh_token
  if (TOKEN_ENCRYPTION_KEY && isEncrypted(refreshToken)) {
    refreshToken = await decryptToken(refreshToken, TOKEN_ENCRYPTION_KEY)
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw Object.assign(new Error(`Token refresh failed: ${errBody}`), {
      permanent: true,
      status: res.status,
    })
  }

  const data = await res.json()
  const newExpiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()

  await supabase
    .from('google_integrations')
    .update({
      access_token: data.access_token,
      expires_at: newExpiresAt,
    })
    .eq('id', integration.id)

  return data.access_token
}

// Resolve tenant: assistant_id → agent → user → google integration
async function resolveTenant(supabase: any, assistantId: string) {
  const { data: agent, error: agentError } = await supabase
    .from('agent_configs')
    .select('id, user_id, agent_type, config')
    .eq('vapi_assistant_id', assistantId)
    .single()

  if (agentError || !agent) {
    throw new Error(`Agent not found for assistant ${assistantId}`)
  }

  const { data: calendarTool } = await supabase
    .from('calendar_tools')
    .select('configuration')
    .eq('agent_id', agent.id)
    .eq('tool_name', 'calendar_booking')
    .eq('is_enabled', true)
    .single()

  const { data: integration, error: intError } = await supabase
    .from('google_integrations')
    .select('*')
    .eq('user_id', agent.user_id)
    .limit(1)
    .single()

  if (intError || !integration) {
    throw new Error('Google Calendar not connected for this agent owner')
  }

  // Calendar ID resolution: tool config → integration setting → "primary"
  const toolConfig = calendarTool?.configuration as any || {}
  const calendarId = toolConfig.calendar_id || integration.calendar_id || 'primary'

  return { agent, integration, calendarTool: toolConfig, calendarId }
}

function getBookingSource(agentType?: string | null) {
  return agentType === 'outbound' ? 'outbound_campaign' : 'inbound'
}

// Notify owner on permanent auth failure (rate limited to 1/day)
async function notifyOwnerAuthFailure(
  supabase: any,
  integration: any,
  userId: string,
  errorMsg: string
) {
  try {
    // Check if we already sent a notification in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recentLogs } = await supabase
      .from('integration_logs')
      .select('id')
      .eq('integration_id', integration.id)
      .eq('action', 'auth_failure_notified')
      .gte('created_at', oneDayAgo)
      .limit(1)

    // Always log the failure
    await supabase.from('integration_logs').insert({
      integration_id: integration.id,
      action: 'auth_failure',
      status: 'error',
      message: errorMsg,
      details: { user_id: userId },
    })

    if (recentLogs && recentLogs.length > 0) {
      console.log('Auth failure notification already sent within 24h, skipping')
      return
    }

    // Get owner email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (profile?.email) {
      const resendKey = Deno.env.get('RESEND_API_KEY')
      if (resendKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Ringster <notifications@ringster.ai>',
            to: [profile.email],
            subject: 'Action Required: Google Calendar Reconnection Needed',
            html: `<p>Hi ${profile.full_name || 'there'},</p>
              <p>Your Google Calendar connection has expired or been revoked. Your AI agent can no longer book appointments until you reconnect.</p>
              <p>Please log in to your Ringster dashboard and reconnect Google Calendar in Settings → Integrations.</p>
              <p>— Ringster Team</p>`,
          }),
        }).catch(e => console.error('Failed to send auth failure email:', e))
      }
    }

    // Log that we notified
    await supabase.from('integration_logs').insert({
      integration_id: integration.id,
      action: 'auth_failure_notified',
      status: 'info',
      message: 'Owner notified of auth failure',
    })
  } catch (e) {
    console.error('Error in notifyOwnerAuthFailure:', e)
  }
}

// Get available slots for a date
async function checkAvailability(
  supabase: any,
  params: {
    assistant_id: string
    date: string
    timezone?: string
    duration_minutes?: number
  }
) {
  const { agent, integration, calendarTool, calendarId } = await resolveTenant(
    supabase,
    params.assistant_id
  )
  const tz = params.timezone || integration.availability_start ? 'America/New_York' : 'America/New_York'
  const duration = params.duration_minutes || calendarTool.default_duration || 30

  let accessToken: string
  try {
    accessToken = await refreshGoogleToken(supabase, integration)
  } catch (e: any) {
    if (e.permanent) {
      await notifyOwnerAuthFailure(supabase, integration, agent.user_id, e.message)
    }
    throw e
  }

  // Build timeMin/timeMax for the full day in the user's timezone
  const dateObj = new Date(`${params.date}T00:00:00`)
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
  // Use start/end of day in the specified timezone
  const dayStart = new Date(new Intl.DateTimeFormat('sv-SE', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(new Date(`${params.date}T00:00:00`)).replace(' ', 'T') + 'Z')

  // Simpler approach: construct UTC bounds from the date + timezone
  const timeMin = `${params.date}T00:00:00`
  const timeMax = `${params.date}T23:59:59`

  // Convert to UTC using timezone offset
  const startInTz = new Date(new Date(`${timeMin}`).toLocaleString('en-US', { timeZone: tz }))
  const endInTz = new Date(new Date(`${timeMax}`).toLocaleString('en-US', { timeZone: tz }))

  // Use Intl to get proper ISO strings
  const timeMinUTC = new Date(`${params.date}T00:00:00`).toISOString()
  const timeMaxUTC = new Date(`${params.date}T23:59:59`).toISOString()

  // Call Google FreeBusy API
  const freeBusyRes = await withRetry(async () => {
    const res = await fetch(`${GOOGLE_API_BASE}/calendar/v3/freeBusy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin: timeMinUTC,
        timeMax: timeMaxUTC,
        timeZone: tz,
        items: [{ id: calendarId }],
      }),
    })
    if (!res.ok) {
      const errText = await res.text()
      throw Object.assign(new Error(`FreeBusy API error: ${errText}`), { status: res.status })
    }
    return res.json()
  })

  const busyPeriods = freeBusyRes.calendars?.[calendarId]?.busy || []

  // Get business hours from calendar_tools config or google_integrations
  const businessStart = calendarTool.business_hours_start || integration.availability_start || '09:00'
  const businessEnd = calendarTool.business_hours_end || integration.availability_end || '17:00'
  const bufferMinutes = calendarTool.buffer_time || integration.buffer_time || 10
  const allowedDays = integration.availability_days || [1, 2, 3, 4, 5]

  // Check if the requested date is on an allowed day
  const requestedDay = new Date(`${params.date}T12:00:00`).getDay()
  // JS: 0=Sun, 1=Mon... pg array uses 1=Mon convention too
  if (!allowedDays.includes(requestedDay === 0 ? 7 : requestedDay)) {
    return { available_slots: [], message: `This day is not available for bookings.` }
  }

  // Generate time slots within business hours
  const [startH, startM] = businessStart.split(':').map(Number)
  const [endH, endM] = businessEnd.split(':').map(Number)
  const businessStartMin = startH * 60 + startM
  const businessEndMin = endH * 60 + endM

  const slots: Array<{ start: string; end: string }> = []
  const slotIncrement = 30 // check every 30 minutes

  for (let minuteOfDay = businessStartMin; minuteOfDay + duration <= businessEndMin; minuteOfDay += slotIncrement) {
    const slotStartH = Math.floor(minuteOfDay / 60)
    const slotStartM = minuteOfDay % 60
    const slotStart = `${params.date}T${String(slotStartH).padStart(2, '0')}:${String(slotStartM).padStart(2, '0')}:00`

    const slotEndMinute = minuteOfDay + duration
    const slotEndH = Math.floor(slotEndMinute / 60)
    const slotEndM = slotEndMinute % 60
    const slotEnd = `${params.date}T${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}:00`

    // Convert slot times to UTC for comparison with busy periods
    // For simplicity, compare in the target timezone
    const slotStartDate = new Date(`${slotStart}`)
    const slotEndDate = new Date(`${slotEnd}`)

    // Check with buffer: the slot + buffer on each side must not overlap busy periods
    const bufferedStart = new Date(slotStartDate.getTime() - bufferMinutes * 60000)
    const bufferedEnd = new Date(slotEndDate.getTime() + bufferMinutes * 60000)

    let isFree = true
    for (const busy of busyPeriods) {
      const busyStart = new Date(busy.start)
      const busyEnd = new Date(busy.end)
      // Overlap check: buffered slot overlaps with busy period
      if (bufferedStart < busyEnd && bufferedEnd > busyStart) {
        isFree = false
        break
      }
    }

    if (isFree) {
      slots.push({ start: slotStart, end: slotEnd })
    }
  }

  // Log the tool call
  await supabase.from('tool_call_logs').insert({
    agent_id: agent.id,
    tool_name: 'check_availability',
    parameters: params,
    result: { slots_count: slots.length },
    status: 'success',
  })

  // Include current date/time context in every availability response
  const now = new Date()
  const currentDateFormatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  })
  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, weekday: 'long',
  })

  return {
    available_slots: slots,
    timezone: tz,
    duration_minutes: duration,
    current_date: currentDateFormatter.format(now),
    current_day_of_week: dayFormatter.format(now),
    message: slots.length > 0
      ? `Found ${slots.length} available slots on ${params.date}.`
      : `No available slots on ${params.date}. Please try another day.`,
  }
}

// Book an appointment
async function bookAppointment(
  supabase: any,
  params: {
    assistant_id: string
    datetime: string
    attendee_name: string
    attendee_email?: string
    duration_minutes?: number
    appointment_type?: string
    timezone?: string
    idempotency_key?: string
  }
) {
  const { agent, integration, calendarTool, calendarId } = await resolveTenant(
    supabase,
    params.assistant_id
  )
  const duration = params.duration_minutes || calendarTool.default_duration || 30
  const tz = params.timezone || 'America/New_York'

  // Check idempotency: if this key was already used, return existing booking
  if (params.idempotency_key) {
    const { data: existing } = await supabase
      .from('calendar_bookings')
      .select('*')
      .eq('idempotency_key', params.idempotency_key)
      .single()

    if (existing) {
      return {
        error: false,
        message: 'Appointment already booked.',
        booking: existing,
      }
    }
  }

  let accessToken: string
  try {
    accessToken = await refreshGoogleToken(supabase, integration)
  } catch (e: any) {
    if (e.permanent) {
      await notifyOwnerAuthFailure(supabase, integration, agent.user_id, e.message)
    }
    throw e
  }

  // Build start/end datetime strings in the agent's timezone (NOT UTC)
  // params.datetime is like "2026-03-27T12:00:00" — treat as local to tz
  const rawStart = params.datetime.replace('Z', '') // strip Z if present
  const [datePart, timePart] = rawStart.split('T')
  const [hh, mm] = (timePart || '12:00:00').split(':').map(Number)
  const endTotalMin = hh * 60 + mm + duration
  const endHH = String(Math.floor(endTotalMin / 60)).padStart(2, '0')
  const endMM = String(endTotalMin % 60).padStart(2, '0')
  const rawEnd = `${datePart}T${endHH}:${endMM}:00`

  // For FreeBusy, Google needs RFC3339 — send with timezone and let Google interpret
  const freeBusyRes = await withRetry(async () => {
    const res = await fetch(`${GOOGLE_API_BASE}/calendar/v3/freeBusy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin: rawStart,
        timeMax: rawEnd,
        timeZone: tz,
        items: [{ id: calendarId }],
      }),
    })
    if (!res.ok) {
      const errText = await res.text()
      throw Object.assign(new Error(`FreeBusy check failed: ${errText}`), { status: res.status })
    }
    return res.json()
  })

  const busyPeriods = freeBusyRes.calendars?.[calendarId]?.busy || []
  if (busyPeriods.length > 0) {
    return {
      error: true,
      message: 'This time slot is no longer available. Please choose a different time.',
    }
  }

  // Step 1: Create Google Calendar event FIRST (Google-first atomicity)
  // Send naive datetime + timeZone so Google places it correctly
  const eventBody = {
    summary: `${params.appointment_type || 'Appointment'} - ${params.attendee_name}`,
    description: `Booked via Ringster AI agent`,
    start: {
      dateTime: rawStart,
      timeZone: tz,
    },
    end: {
      dateTime: rawEnd,
      timeZone: tz,
    },
    attendees: params.attendee_email ? [{ email: params.attendee_email }] : [],
  }

  let googleEvent: any
  try {
    googleEvent = await withRetry(async () => {
      const res = await fetch(
        `${GOOGLE_API_BASE}/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventBody),
        }
      )
      if (!res.ok) {
        const errText = await res.text()
        throw Object.assign(new Error(`Google event creation failed: ${errText}`), { status: res.status })
      }
      return res.json()
    })
  } catch (e: any) {
    return {
      error: true,
      message: 'Failed to create calendar event. Please try again.',
    }
  }

  // Step 2: Insert into calendar_bookings
  const bookingRecord = {
    appointment_datetime: startTime.toISOString(),
    duration_minutes: duration,
    attendee_name: params.attendee_name,
    attendee_email: params.attendee_email || null,
    appointment_type: params.appointment_type || 'consultation',
    booking_status: 'confirmed',
    google_event_id: googleEvent.id,
    google_integration_id: integration.id,
    booking_source: getBookingSource(agent.agent_type),
    idempotency_key: params.idempotency_key || null,
    notes: `Booked by agent ${agent.id}`,
  }

  const { data: booking, error: insertError } = await supabase
    .from('calendar_bookings')
    .insert(bookingRecord)
    .select()
    .single()

  if (insertError) {
    // Rollback: delete Google event
    console.error('DB insert failed, rolling back Google event:', insertError)
    try {
      await fetch(
        `${GOOGLE_API_BASE}/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${googleEvent.id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      )
    } catch (delErr) {
      console.error('Failed to delete Google event during rollback:', delErr)
    }

    return {
      error: true,
      message: insertError.message?.includes('no_overlapping_bookings')
        ? 'This time slot was just booked by someone else. Please choose a different time.'
        : 'Failed to save booking. Please try again.',
    }
  }

  // Log the tool call
  await supabase.from('tool_call_logs').insert({
    agent_id: agent.id,
    tool_name: 'book_appointment',
    parameters: { ...params, assistant_id: '[redacted]' },
    result: { booking_id: booking.id, google_event_id: googleEvent.id },
    status: 'success',
  })

  return {
    error: false,
    message: `Appointment booked successfully for ${params.attendee_name} on ${startTime.toLocaleDateString('en-US', { timeZone: tz })} at ${startTime.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' })} for ${duration} minutes.`,
    booking: {
      id: booking.id,
      datetime: params.datetime,
      duration_minutes: duration,
      attendee_name: params.attendee_name,
    },
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Authenticate via shared secret
  const secret = req.headers.get('x-vapi-secret')
  const expectedSecret = Deno.env.get('VAPI_CALENDAR_SECRET')

  if (!secret || secret !== expectedSecret) {
    return new Response(
      JSON.stringify({ error: true, message: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const body = await req.json()
    const { action, ...params } = body
    const requestId = `cal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    console.log(`[${requestId}] vapi-calendar-api action=${action}`, { params: { ...params, assistant_id: params.assistant_id?.slice(0, 8) + '...' } })

    let result: any

    if (action === 'check_availability') {
      result = await checkAvailability(supabase, params)
    } else if (action === 'book_appointment') {
      result = await bookAppointment(supabase, params)
    } else {
      result = { error: true, message: `Unknown action: ${action}` }
    }

    console.log(`[${requestId}] completed`, { error: result.error })

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('vapi-calendar-api error:', err)

    const message = err.permanent
      ? 'Calendar authentication has expired. The business owner has been notified.'
      : 'Calendar service error. Please try again.'

    return new Response(
      JSON.stringify({ error: true, message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
