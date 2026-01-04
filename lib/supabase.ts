import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Regular client for public/authenticated operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We're using Clerk for auth
  },
});

// Service role client for admin operations (bypasses RLS)
// Use this ONLY in server-side API routes for admin operations like syncing
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Type definitions for database
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_user_id: string;
          username: string | null;
          email: string | null;
          profile_picture_url: string | null;
          selected_state: string | null;
          points: number;
          exp: number;
          created_at: string;
          updated_at: string;
          last_login: string;
        };
      };
      polls: {
        Row: {
          id: string;
          legacy_id: string | null;
          question: string;
          description: string | null;
          category: string;
          created_by: string | null;
          is_system_poll: boolean;
          is_active: boolean;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      poll_options: {
        Row: {
          id: string;
          poll_id: string;
          option_index: number;
          label: string;
          emoji: string;
          created_at: string;
        };
      };
      votes: {
        Row: {
          id: string;
          poll_id: string;
          user_id: string;
          poll_option_id: string;
          option_index: number;
          user_state: string;
          created_at: string;
        };
      };
      states: {
        Row: {
          id: string;
          name: string;
          display_order: number;
          created_at: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          state_id: string;
          location: string | null;
          branch: string | null;
          type: 'construction' | 'machinery';
          status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
          start_date: string;
          end_date: string | null;
          budget: number;
          disbursed: number;
          contractor: string;
          officer: string | null;
          description: string;
          progress: number;
          planned_progress: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          state_id: string;
          location?: string | null;
          branch?: string | null;
          type: 'construction' | 'machinery';
          status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
          start_date: string;
          end_date?: string | null;
          budget: number;
          disbursed?: number;
          contractor: string;
          officer?: string | null;
          description: string;
          progress: number;
          planned_progress: number;
          created_by: string;
        };
        Update: {
          name?: string;
          state_id?: string;
          location?: string | null;
          branch?: string | null;
          type?: 'construction' | 'machinery';
          status?: 'planning' | 'in-progress' | 'completed' | 'on-hold';
          start_date?: string;
          end_date?: string | null;
          budget?: number;
          disbursed?: number;
          contractor?: string;
          officer?: string | null;
          description?: string;
          progress?: number;
          planned_progress?: number;
          created_by?: string;
        };
      };
    };
  };
}

// Type aliases for projects for easier reference
export type ProjectRow = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

// Project type and status constants for validation
export type ProjectType = 'construction' | 'machinery';
export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold';

