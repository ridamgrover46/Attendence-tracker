import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      subjects: {
        Row: {
          id: string
          user_id: string
          subject_name: string
          total_lectures: number
          attended_lectures: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_name: string
          total_lectures: number
          attended_lectures: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_name?: string
          total_lectures?: number
          attended_lectures?: number
          created_at?: string
        }
      }
    }
  }
}
