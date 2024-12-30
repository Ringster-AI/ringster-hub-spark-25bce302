import { Json } from './auth';

export interface TeamsSchema {
  Tables: {
    team_members: {
      Row: {
        id: string
        organization_id: string
        user_id: string
        role: 'owner' | 'admin' | 'member'
        created_at: string
        updated_at: string
      }
      Insert: {
        id?: string
        organization_id: string
        user_id: string
        role?: 'owner' | 'admin' | 'member'
        created_at?: string
        updated_at?: string
      }
      Update: {
        id?: string
        organization_id?: string
        user_id?: string
        role?: 'owner' | 'admin' | 'member'
        created_at?: string
        updated_at?: string
      }
    }
  }
}