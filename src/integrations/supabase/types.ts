export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      agent_configs_5sy83d: {
        Row: {
          business_hours: Json
          calendar_integration: Json | null
          created_at: string
          goodbye: string
          greeting: string
          id: string
          name: string
          organization_id: string
          phone_number: string
          system_prompt: string
          transfer_directory: Json | null
          updated_at: string
          voice_id: string | null
        }
        Insert: {
          business_hours: Json
          calendar_integration?: Json | null
          created_at?: string
          goodbye: string
          greeting: string
          id?: string
          name: string
          organization_id: string
          phone_number: string
          system_prompt: string
          transfer_directory?: Json | null
          updated_at?: string
          voice_id?: string | null
        }
        Update: {
          business_hours?: Json
          calendar_integration?: Json | null
          created_at?: string
          goodbye?: string
          greeting?: string
          id?: string
          name?: string
          organization_id?: string
          phone_number?: string
          system_prompt?: string
          transfer_directory?: Json | null
          updated_at?: string
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_configs_5sy83d_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_5sy83d"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_phone_assistant_5sy83d_agent_configs: {
        Row: {
          business_hours: Json
          calendar_integration: Json | null
          created_at: string
          goodbye: string
          greeting: string
          id: string
          name: string
          organization_id: string
          phone_number: string
          system_prompt: string
          transfer_directory: Json | null
          updated_at: string
          user_email: string
          voice_id: string | null
        }
        Insert: {
          business_hours: Json
          calendar_integration?: Json | null
          created_at?: string
          goodbye: string
          greeting: string
          id?: string
          name: string
          organization_id: string
          phone_number: string
          system_prompt: string
          transfer_directory?: Json | null
          updated_at?: string
          user_email: string
          voice_id?: string | null
        }
        Update: {
          business_hours?: Json
          calendar_integration?: Json | null
          created_at?: string
          goodbye?: string
          greeting?: string
          id?: string
          name?: string
          organization_id?: string
          phone_number?: string
          system_prompt?: string
          transfer_directory?: Json | null
          updated_at?: string
          user_email?: string
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_phone_assistant_5sy83d_agent_configs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "ai_phone_assistant_5sy83d_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_phone_assistant_5sy83d_call_logs: {
        Row: {
          agent_id: string
          call_sid: string
          created_at: string
          duration: number | null
          from_number: string
          id: string
          organization_id: string
          recording_url: string | null
          status: string
          summary: string | null
          to_number: string
          transcript: string | null
          updated_at: string
          user_email: string
        }
        Insert: {
          agent_id: string
          call_sid: string
          created_at?: string
          duration?: number | null
          from_number: string
          id?: string
          organization_id: string
          recording_url?: string | null
          status: string
          summary?: string | null
          to_number: string
          transcript?: string | null
          updated_at?: string
          user_email: string
        }
        Update: {
          agent_id?: string
          call_sid?: string
          created_at?: string
          duration?: number | null
          from_number?: string
          id?: string
          organization_id?: string
          recording_url?: string | null
          status?: string
          summary?: string | null
          to_number?: string
          transcript?: string | null
          updated_at?: string
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_phone_assistant_5sy83d_call_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_phone_assistant_5sy83d_agent_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_phone_assistant_5sy83d_call_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "ai_phone_assistant_5sy83d_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_phone_assistant_5sy83d_google_integrations: {
        Row: {
          access_token: string
          availability_days: string | null
          availability_end: string | null
          availability_start: string | null
          calendar_id: string | null
          created_at: string
          email: string
          id: string
          refresh_token: string
          scopes: string
          updated_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          access_token: string
          availability_days?: string | null
          availability_end?: string | null
          availability_start?: string | null
          calendar_id?: string | null
          created_at?: string
          email: string
          id?: string
          refresh_token: string
          scopes: string
          updated_at?: string
          user_email: string
          user_id: string
        }
        Update: {
          access_token?: string
          availability_days?: string | null
          availability_end?: string | null
          availability_start?: string | null
          calendar_id?: string | null
          created_at?: string
          email?: string
          id?: string
          refresh_token?: string
          scopes?: string
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_phone_assistant_5sy83d_organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          settings: Json | null
          updated_at: string
          user_email: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          settings?: Json | null
          updated_at?: string
          user_email: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          settings?: Json | null
          updated_at?: string
          user_email?: string
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
      calendar_bookings: {
        Row: {
          appointment_datetime: string
          appointment_type: string | null
          attendee_email: string | null
          attendee_name: string | null
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
      call_logs_5sy83d: {
        Row: {
          agent_id: string
          call_sid: string
          created_at: string
          duration: number | null
          from_number: string
          id: string
          organization_id: string
          recording_url: string | null
          status: string
          summary: string | null
          to_number: string
          transcript: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          call_sid: string
          created_at?: string
          duration?: number | null
          from_number: string
          id?: string
          organization_id: string
          recording_url?: string | null
          status: string
          summary?: string | null
          to_number: string
          transcript?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          call_sid?: string
          created_at?: string
          duration?: number | null
          from_number?: string
          id?: string
          organization_id?: string
          recording_url?: string | null
          status?: string
          summary?: string | null
          to_number?: string
          transcript?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_5sy83d_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_configs_5sy83d"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_5sy83d_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_5sy83d"
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
      google_integrations_5sy83d: {
        Row: {
          access_token: string
          availability_days: string | null
          availability_end: string | null
          availability_start: string | null
          calendar_id: string | null
          created_at: string
          email: string
          id: string
          refresh_token: string
          scopes: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          availability_days?: string | null
          availability_end?: string | null
          availability_start?: string | null
          calendar_id?: string | null
          created_at?: string
          email: string
          id?: string
          refresh_token: string
          scopes: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          availability_days?: string | null
          availability_end?: string | null
          availability_start?: string | null
          calendar_id?: string | null
          created_at?: string
          email?: string
          id?: string
          refresh_token?: string
          scopes?: string
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
      organizations_5sy83d: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          settings?: Json | null
          updated_at?: string
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
      profiles_5sy83d: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          organization_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_5sy83d_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_5sy83d"
            referencedColumns: ["id"]
          },
        ]
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
      user_subscriptions_5sy83d: {
        Row: {
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          organization_id: string
          plan_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          organization_id: string
          plan_id: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          organization_id?: string
          plan_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_5sy83d_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_5sy83d"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_subscription_update: {
        Args: {
          user_id: string
          new_plan_id: string
          new_status: string
          new_period_start: string
          new_period_end: string
        }
        Returns: undefined
      }
      has_role: {
        Args: { user_id: string; role_name: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      process_campaign_contacts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_user_subscription: {
        Args: { p_user_id: string; p_plan_id?: string }
        Returns: undefined
      }
      update_minutes_used: {
        Args: { p_user_id: string; p_minutes: number }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
