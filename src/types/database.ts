export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          is_team: boolean
          team_members: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          is_team?: boolean
          team_members?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          is_team?: boolean
          team_members?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          title: string
          image_url: string | null
          is_active: boolean
          questions: Json | null
          participants_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          image_url?: string | null
          is_active?: boolean
          questions?: Json | null
          participants_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          image_url?: string | null
          is_active?: boolean
          questions?: Json | null
          participants_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      scores: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          score: number
          answers: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quiz_id: string
          score?: number
          answers?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quiz_id?: string
          score?: number
          answers?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      platform_settings: {
        Row: {
          id: number
          logo: string | null
          logo_height: number
          platform_name: string | null
          welcome_title: string | null
          welcome_subtitle: string | null
          home_icon: string | null
          home_icon_height: number
          correct_answer_score: number
          incorrect_answer_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: number
          logo?: string | null
          logo_height?: number
          platform_name?: string | null
          welcome_title?: string | null
          welcome_subtitle?: string | null
          home_icon?: string | null
          home_icon_height?: number
          correct_answer_score?: number
          incorrect_answer_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          logo?: string | null
          logo_height?: number
          platform_name?: string | null
          welcome_title?: string | null
          welcome_subtitle?: string | null
          home_icon?: string | null
          home_icon_height?: number
          correct_answer_score?: number
          incorrect_answer_score?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      get_global_leaderboard: {
        Args: Record<string, never>
        Returns: {
          name: string
          is_team: boolean
          team_members: string | null
          total_score: number
          quizzes_played: number
        }[]
      }
      get_player_stats: {
        Args: { player_name_param: string }
        Returns: {
          name: string
          is_team: boolean
          team_members: string | null
          total_score: number
          quizzes_played: number
          quiz_scores: Json
        }[]
      }
      clear_quiz_scores: {
        Args: { quiz_id_param: string }
        Returns: void
      }
    }
  }
}