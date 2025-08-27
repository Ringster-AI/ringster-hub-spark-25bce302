export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agent_configs: {
        Row: {
          advanced_config: Json | null
          agent_type: string
          config: Json | null
          created_at: string | null
          description: string | null
          goodbye: string | null
          greeting: string | null
          hipaa_enabled: boolean | null
          id: string
          is_trial: boolean | null
          is_web_only: boolean | null
          minutes_allowance: number | null
          minutes_used: number | null
          name: string
          phone_number: string | null
          status: string
          total_minutes_used: number | null
          transfer_directory: Json | null
          trial_ends_at: string | null
          twilio_sid: string | null
          updated_at: string | null
          user_id: string
          vapi_assistant_id: string | null
          voice_id: string | null
          widget_config: Json | null
        }
        Insert: {
          advanced_config?: Json | null
          agent_type?: string
          config?: Json | null
          created_at?: string | null
          description?: string | null
          goodbye?: string | null
          greeting?: string | null
          hipaa_enabled?: boolean | null
          id?: string
          is_trial?: boolean | null
          is_web_only?: boolean | null
          minutes_allowance?: number | null
          minutes_used?: number | null
          name: string
          phone_number?: string | null
          status?: string
          total_minutes_used?: number | null
          transfer_directory?: Json | null
          trial_ends_at?: string | null
          twilio_sid?: string | null
          updated_at?: string | null
          user_id: string
          vapi_assistant_id?: string | null
          voice_id?: string | null
          widget_config?: Json | null
        }
        Update: {
          advanced_config?: Json | null
          agent_type?: string
          config?: Json | null
          created_at?: string | null
          description?: string | null
          goodbye?: string | null
          greeting?: string | null
          hipaa_enabled?: boolean | null
          id?: string
          is_trial?: boolean | null
          is_web_only?: boolean | null
          minutes_allowance?: number | null
          minutes_used?: number | null
          name?: string
          phone_number?: string | null
          status?: string
          total_minutes_used?: number | null
          transfer_directory?: Json | null
          trial_ends_at?: string | null
          twilio_sid?: string | null
          updated_at?: string | null
          user_id?: string
          vapi_assistant_id?: string | null
          voice_id?: string | null
          widget_config?: Json | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_requests: {
        Row: {
          appointment_type: string | null
          attendee_email: string | null
          attendee_name: string
          call_log_id: string | null
          campaign_id: string | null
          contact_id: string | null
          created_at: string | null
          duration_minutes: number | null
          expires_at: string | null
          id: string
          notes: string | null
          phone_number: string
          requested_datetime: string
          status: string | null
          updated_at: string | null
          verification_id: string | null
        }
        Insert: {
          appointment_type?: string | null
          attendee_email?: string | null
          attendee_name: string
          call_log_id?: string | null
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          phone_number: string
          requested_datetime: string
          status?: string | null
          updated_at?: string | null
          verification_id?: string | null
        }
        Update: {
          appointment_type?: string | null
          attendee_email?: string | null
          attendee_name?: string
          call_log_id?: string | null
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          phone_number?: string
          requested_datetime?: string
          status?: string | null
          updated_at?: string | null
          verification_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_call_log_id_fkey"
            columns: ["call_log_id"]
            isOneToOne: false
            referencedRelation: "call_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "campaign_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "phone_verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_bookings: {
        Row: {
          appointment_datetime: string
          appointment_type: string | null
          attendee_email: string | null
          attendee_name: string | null
          booking_source: string | null
          booking_status: string
          call_log_id: string | null
          campaign_id: string | null
          contact_id: string | null
          created_at: string
          duration_minutes: number
          google_event_id: string | null
          google_integration_id: string | null
          id: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          appointment_datetime: string
          appointment_type?: string | null
          attendee_email?: string | null
          attendee_name?: string | null
          booking_source?: string | null
          booking_status?: string
          call_log_id?: string | null
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string
          duration_minutes?: number
          google_event_id?: string | null
          google_integration_id?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          appointment_datetime?: string
          appointment_type?: string | null
          attendee_email?: string | null
          attendee_name?: string | null
          booking_source?: string | null
          booking_status?: string
          call_log_id?: string | null
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string
          duration_minutes?: number
          google_event_id?: string | null
          google_integration_id?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_bookings_call_log_id_fkey"
            columns: ["call_log_id"]
            isOneToOne: false
            referencedRelation: "call_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_bookings_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_bookings_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "campaign_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_bookings_google_integration_id_fkey"
            columns: ["google_integration_id"]
            isOneToOne: false
            referencedRelation: "google_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_tools: {
        Row: {
          agent_id: string
          campaign_id: string | null
          configuration: Json | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          tool_name: string
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          campaign_id?: string | null
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          tool_name?: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          campaign_id?: string | null
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          tool_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_tools_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_tools_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          agent_id: string | null
          call_sid: string
          created_at: string | null
          duration: number | null
          end_time: string | null
          from_number: string | null
          id: string
          start_time: string | null
          status: string | null
          to_number: string | null
          transfer_count: number | null
        }
        Insert: {
          agent_id?: string | null
          call_sid: string
          created_at?: string | null
          duration?: number | null
          end_time?: string | null
          from_number?: string | null
          id?: string
          start_time?: string | null
          status?: string | null
          to_number?: string | null
          transfer_count?: number | null
        }
        Update: {
          agent_id?: string | null
          call_sid?: string
          created_at?: string | null
          duration?: number | null
          end_time?: string | null
          from_number?: string | null
          id?: string
          start_time?: string | null
          status?: string | null
          to_number?: string | null
          transfer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      call_recordings: {
        Row: {
          call_log_id: string
          created_at: string | null
          id: string
          recording_url: string | null
          transcript_url: string | null
        }
        Insert: {
          call_log_id: string
          created_at?: string | null
          id?: string
          recording_url?: string | null
          transcript_url?: string | null
        }
        Update: {
          call_log_id?: string
          created_at?: string | null
          id?: string
          recording_url?: string | null
          transcript_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_recordings_call_log_id_fkey"
            columns: ["call_log_id"]
            isOneToOne: false
            referencedRelation: "call_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_call_log"
            columns: ["call_log_id"]
            isOneToOne: false
            referencedRelation: "call_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_contacts: {
        Row: {
          call_attempts: number | null
          campaign_id: string | null
          created_at: string | null
          first_name: string
          id: string
          last_call_at: string | null
          last_name: string
          metadata: Json | null
          phone_number: string
          status: string
          updated_at: string | null
        }
        Insert: {
          call_attempts?: number | null
          campaign_id?: string | null
          created_at?: string | null
          first_name: string
          id?: string
          last_call_at?: string | null
          last_name: string
          metadata?: Json | null
          phone_number: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          call_attempts?: number | null
          campaign_id?: string | null
          created_at?: string | null
          first_name?: string
          id?: string
          last_call_at?: string | null
          last_name?: string
          metadata?: Json | null
          phone_number?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_integrations: {
        Row: {
          campaign_id: string
          configuration: Json
          created_at: string
          id: string
          integration_id: string
          is_enabled: boolean
          updated_at: string
        }
        Insert: {
          campaign_id: string
          configuration?: Json
          created_at?: string
          id?: string
          integration_id: string
          is_enabled?: boolean
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          configuration?: Json
          created_at?: string
          id?: string
          integration_id?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_integrations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_integrations_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          agent_id: string | null
          config: Json | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          scheduled_start: string | null
          status: string
          updated_at: string | null
          user_id: string | null
          webhook_url: string | null
        }
        Insert: {
          agent_id?: string | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          scheduled_start?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          webhook_url?: string | null
        }
        Update: {
          agent_id?: string | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          scheduled_start?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      custom_voices: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          updated_at: string | null
          voice_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          updated_at?: string | null
          voice_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          voice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_voices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_requests: {
        Row: {
          company_name: string
          created_at: string | null
          email: string
          forwarded: boolean | null
          full_name: string
          id: string
          message: string | null
          phone: string
          team_size: string | null
        }
        Insert: {
          company_name: string
          created_at?: string | null
          email: string
          forwarded?: boolean | null
          full_name: string
          id?: string
          message?: string | null
          phone: string
          team_size?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string | null
          email?: string
          forwarded?: boolean | null
          full_name?: string
          id?: string
          message?: string | null
          phone?: string
          team_size?: string | null
        }
        Relationships: []
      }
      ebook_subscribers: {
        Row: {
          created_at: string | null
          downloaded: boolean | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          downloaded?: boolean | null
          email: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          downloaded?: boolean | null
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      follow_up_sequences: {
        Row: {
          campaign_id: string | null
          contact_id: string | null
          content: string | null
          created_at: string
          delay_hours: number
          id: string
          scheduled_for: string | null
          sent_at: string | null
          sequence_type: string
          status: string
          trigger_event: string
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          contact_id?: string | null
          content?: string | null
          created_at?: string
          delay_hours?: number
          id?: string
          scheduled_for?: string | null
          sent_at?: string | null
          sequence_type: string
          status?: string
          trigger_event: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          contact_id?: string | null
          content?: string | null
          created_at?: string
          delay_hours?: number
          id?: string
          scheduled_for?: string | null
          sent_at?: string | null
          sequence_type?: string
          status?: string
          trigger_event?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_sequences_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_sequences_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "campaign_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      google_integrations: {
        Row: {
          access_token: string
          availability_days: number[] | null
          availability_end: string | null
          availability_start: string | null
          buffer_time: number | null
          calendar_id: string | null
          calendar_name: string | null
          created_at: string | null
          default_duration: number | null
          email: string
          expires_at: string
          googleCalendarEnabled: boolean | null
          id: string
          refresh_token: string
          scopes: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          availability_days?: number[] | null
          availability_end?: string | null
          availability_start?: string | null
          buffer_time?: number | null
          calendar_id?: string | null
          calendar_name?: string | null
          created_at?: string | null
          default_duration?: number | null
          email: string
          expires_at: string
          googleCalendarEnabled?: boolean | null
          id?: string
          refresh_token: string
          scopes: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          availability_days?: number[] | null
          availability_end?: string | null
          availability_start?: string | null
          buffer_time?: number | null
          calendar_id?: string | null
          calendar_name?: string | null
          created_at?: string | null
          default_duration?: number | null
          email?: string
          expires_at?: string
          googleCalendarEnabled?: boolean | null
          id?: string
          refresh_token?: string
          scopes?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      integration_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          integration_id: string
          message: string | null
          status: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          integration_id: string
          message?: string | null
          status: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          integration_id?: string
          message?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          capabilities: string[]
          configuration: Json
          created_at: string
          credentials: Json
          display_name: string
          expires_at: string | null
          id: string
          integration_type: string
          is_active: boolean
          last_sync_at: string | null
          metadata: Json
          provider_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capabilities?: string[]
          configuration?: Json
          created_at?: string
          credentials?: Json
          display_name: string
          expires_at?: string | null
          id?: string
          integration_type: string
          is_active?: boolean
          last_sync_at?: string | null
          metadata?: Json
          provider_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capabilities?: string[]
          configuration?: Json
          created_at?: string
          credentials?: Json
          display_name?: string
          expires_at?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean
          last_sync_at?: string | null
          metadata?: Json
          provider_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      oauth_states: {
        Row: {
          code_verifier: string
          created_at: string | null
          expires_at: string
          id: string
          return_url: string
          state: string
          user_id: string | null
        }
        Insert: {
          code_verifier: string
          created_at?: string | null
          expires_at: string
          id?: string
          return_url: string
          state: string
          user_id?: string | null
        }
        Update: {
          code_verifier?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          return_url?: string
          state?: string
          user_id?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          additional_info: string | null
          created_at: string
          id: string
          name: string
          size: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          additional_info?: string | null
          created_at?: string
          id?: string
          name: string
          size: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          additional_info?: string | null
          created_at?: string
          id?: string
          name?: string
          size?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_verifications: {
        Row: {
          attempts: number | null
          created_at: string | null
          expires_at: string
          id: string
          phone_number: string
          updated_at: string | null
          verification_code: string
          verified: boolean | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          expires_at?: string
          id?: string
          phone_number: string
          updated_at?: string | null
          verification_code: string
          verified?: boolean | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          expires_at?: string
          id?: string
          phone_number?: string
          updated_at?: string | null
          verification_code?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          count: number | null
          created_at: string | null
          id: string
          identifier: string
          updated_at: string | null
          window_start: string | null
        }
        Insert: {
          action_type: string
          count?: number | null
          created_at?: string | null
          id?: string
          identifier: string
          updated_at?: string | null
          window_start?: string | null
        }
        Update: {
          action_type?: string
          count?: number | null
          created_at?: string | null
          id?: string
          identifier?: string
          updated_at?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          billing_interval: string | null
          created_at: string | null
          features: Json
          id: string
          is_active: boolean | null
          is_pay_as_you_go: boolean | null
          max_agents: number
          max_team_members: number
          minutes_allowance: number
          name: string
          number_rental_fee: number | null
          per_minute_rate: number | null
          price: number
          prod_id: string | null
          stripe_price_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_interval?: string | null
          created_at?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          is_pay_as_you_go?: boolean | null
          max_agents: number
          max_team_members: number
          minutes_allowance: number
          name: string
          number_rental_fee?: number | null
          per_minute_rate?: number | null
          price: number
          prod_id?: string | null
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_interval?: string | null
          created_at?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          is_pay_as_you_go?: boolean | null
          max_agents?: number
          max_team_members?: number
          minutes_allowance?: number
          name?: string
          number_rental_fee?: number | null
          per_minute_rate?: number | null
          price?: number
          prod_id?: string | null
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tool_call_logs: {
        Row: {
          agent_id: string
          id: string
          parameters: Json
          result: Json | null
          status: string
          timestamp: string
          tool_name: string
        }
        Insert: {
          agent_id: string
          id?: string
          parameters: Json
          result?: Json | null
          status: string
          timestamp?: string
          tool_name: string
        }
        Update: {
          agent_id?: string
          id?: string
          parameters?: Json
          result?: Json | null
          status?: string
          timestamp?: string
          tool_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_agent"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_summary: {
        Row: {
          created_at: string | null
          id: string
          month: number
          total_calls: number | null
          total_minutes: number | null
          total_transfers: number | null
          user_id: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          month: number
          total_calls?: number | null
          total_minutes?: number | null
          total_transfers?: number | null
          user_id?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: number
          total_calls?: number | null
          total_minutes?: number | null
          total_transfers?: number | null
          user_id?: string | null
          year?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_subscription_update: {
        Args: {
          new_period_end: string
          new_period_start: string
          new_plan_id: string
          new_status: string
          user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: { role_name: string; user_id: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      migrate_google_integrations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      process_campaign_contacts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_user_subscription: {
        Args: { p_plan_id?: string; p_user_id: string }
        Returns: undefined
      }
      update_minutes_used: {
        Args: { p_minutes: number; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      team_member_role: "owner" | "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      team_member_role: ["owner", "admin", "member"],
    },
  },
} as const
