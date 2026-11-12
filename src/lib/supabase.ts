import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export interface Profile {
  id: string
  nom: string
  prenom: string
  contact: string
  role: string
  statut: string
  created_at: string
}

export interface Client {
  id: string
  nom: string
  prenom: string
  contact: string
  numapp: number | null
  user_id: string
  created_at: string
}
