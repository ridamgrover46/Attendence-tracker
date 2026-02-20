import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Subject {
  id: string
  user_id: string
  subject_name: string
  total_lectures: number
  attended_lectures: number
  created_at: string
}

export interface SyllabusTopic {
  id: string
  subject_id: string
  user_id: string
  topic_title: string
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface Assignment {
  id: string
  subject_id: string
  user_id: string
  title: string
  description: string | null
  deadline: string
  status: 'pending' | 'completed'
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      subjects: {
        Row: Subject
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
      syllabus_topics: {
        Row: SyllabusTopic
        Insert: {
          id?: string
          subject_id: string
          user_id: string
          topic_title: string
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subject_id?: string
          user_id?: string
          topic_title?: string
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      assignments: {
        Row: Assignment
        Insert: {
          id?: string
          subject_id: string
          user_id: string
          title: string
          description?: string | null
          deadline: string
          status?: 'pending' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subject_id?: string
          user_id?: string
          title?: string
          description?: string | null
          deadline?: string
          status?: 'pending' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
