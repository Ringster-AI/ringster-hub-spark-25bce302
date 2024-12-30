import { Json } from './auth';

export interface OrganizationsSchema {
  Tables: {
    organizations: {
      Row: {
        id: string
        name: string
        created_at: string | null
        updated_at: string | null
      }
      Insert: {
        id?: string
        name: string
        created_at?: string | null
        updated_at?: string | null
      }
      Update: {
        id?: string
        name?: string
        created_at?: string | null
        updated_at?: string | null
      }
    }
    custom_voices: {
      Row: {
        id: string
        name: string
        voice_id: string
        organization_id: string | null
        created_by: string | null
        created_at: string | null
        updated_at: string | null
      }
      Insert: {
        id?: string
        name: string
        voice_id: string
        organization_id?: string | null
        created_by?: string | null
        created_at?: string | null
        updated_at?: string | null
      }
      Update: {
        id?: string
        name?: string
        voice_id?: string
        organization_id?: string | null
        created_by?: string | null
        created_at?: string | null
        updated_at?: string | null
      }
    }
  }
}