import { Json } from './auth';

export interface ProfilesSchema {
  Tables: {
    profiles: {
      Row: {
        id: string
        username: string | null
        full_name: string | null
        avatar_url: string | null
        created_at: string
        updated_at: string
        bio: string | null
        website: string | null
        email: string | null
        phone: string | null
      }
      Insert: {
        id: string
        username?: string | null
        full_name?: string | null
        avatar_url?: string | null
        created_at?: string
        updated_at?: string
        bio?: string | null
        website?: string | null
        email?: string | null
        phone?: string | null
      }
      Update: {
        id?: string
        username?: string | null
        full_name?: string | null
        avatar_url?: string | null
        created_at?: string
        updated_at?: string
        bio?: string | null
        website?: string | null
        email?: string | null
        phone?: string | null
      }
    }
  }
}