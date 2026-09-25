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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      health_reports: {
        Row: {
          generated_at: string
          id: string
          period_end: string
          period_start: string
          storage_path: string
          user_id: string
        }
        Insert: {
          generated_at?: string
          id?: string
          period_end: string
          period_start: string
          storage_path: string
          user_id: string
        }
        Update: {
          generated_at?: string
          id?: string
          period_end?: string
          period_start?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      insight_reads: {
        Row: {
          id: string
          insight_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          insight_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          insight_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insight_reads_insight_id_fkey"
            columns: ["insight_id"]
            isOneToOne: false
            referencedRelation: "insights"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          body: string
          category: Database["public"]["Enums"]["symptom_category"]
          id: string
          order_index: number
          slug: string
          title: string
        }
        Insert: {
          body: string
          category: Database["public"]["Enums"]["symptom_category"]
          id?: string
          order_index: number
          slug: string
          title: string
        }
        Update: {
          body?: string
          category?: Database["public"]["Enums"]["symptom_category"]
          id?: string
          order_index?: number
          slug?: string
          title?: string
        }
        Relationships: []
      }
      medication_doses: {
        Row: {
          id: string
          medication_id: string
          taken_at: string
          taken_on: string
          user_id: string
        }
        Insert: {
          id?: string
          medication_id: string
          taken_at?: string
          taken_on: string
          user_id: string
        }
        Update: {
          id?: string
          medication_id?: string
          taken_at?: string
          taken_on?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_doses_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          active: boolean
          created_at: string
          dose: string | null
          frequency: string | null
          id: string
          name: string
          reminder_hour: number | null
          rotation_notes: string | null
          type: Database["public"]["Enums"]["medication_type"]
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          dose?: string | null
          frequency?: string | null
          id?: string
          name: string
          reminder_hour?: number | null
          rotation_notes?: string | null
          type: Database["public"]["Enums"]["medication_type"]
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          dose?: string | null
          frequency?: string | null
          id?: string
          name?: string
          reminder_hour?: number | null
          rotation_notes?: string | null
          type?: Database["public"]["Enums"]["medication_type"]
          user_id?: string
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          id: string
          segment: string
          send_at: string
          sent_at: string | null
          template_key: string
          user_id: string
        }
        Insert: {
          id?: string
          segment: string
          send_at: string
          sent_at?: string | null
          template_key: string
          user_id: string
        }
        Update: {
          id?: string
          segment?: string
          send_at?: string
          sent_at?: string | null
          template_key?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_answers: {
        Row: {
          answer: Json
          answered_at: string
          id: string
          question_key: string
          user_id: string
        }
        Insert: {
          answer: Json
          answered_at?: string
          id?: string
          question_key: string
          user_id: string
        }
        Update: {
          answer?: Json
          answered_at?: string
          id?: string
          question_key?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          onboarding_completed_at: string | null
          push_token: string | null
          reminder_hour: number | null
          stage: Database["public"]["Enums"]["perimenopause_stage"] | null
          timezone: string
        }
        Insert: {
          created_at?: string
          id: string
          onboarding_completed_at?: string | null
          push_token?: string | null
          reminder_hour?: number | null
          stage?: Database["public"]["Enums"]["perimenopause_stage"] | null
          timezone?: string
        }
        Update: {
          created_at?: string
          id?: string
          onboarding_completed_at?: string | null
          push_token?: string | null
          reminder_hour?: number | null
          stage?: Database["public"]["Enums"]["perimenopause_stage"] | null
          timezone?: string
        }
        Relationships: []
      }
      symptom_logs: {
        Row: {
          created_at: string
          id: string
          logged_on: string
          severity: number
          symptom_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          logged_on: string
          severity: number
          symptom_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          logged_on?: string
          severity?: number
          symptom_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "symptom_logs_symptom_id_fkey"
            columns: ["symptom_id"]
            isOneToOne: false
            referencedRelation: "symptoms"
            referencedColumns: ["id"]
          },
        ]
      }
      symptoms: {
        Row: {
          category: Database["public"]["Enums"]["symptom_category"]
          icon: string
          id: string
          label: string
          slug: string
          sort_order: number
        }
        Insert: {
          category: Database["public"]["Enums"]["symptom_category"]
          icon: string
          id?: string
          label: string
          slug: string
          sort_order?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["symptom_category"]
          icon?: string
          id?: string
          label?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      validation_stats: {
        Row: {
          stat_copy: string
          symptom_id: string
        }
        Insert: {
          stat_copy: string
          symptom_id: string
        }
        Update: {
          stat_copy?: string
          symptom_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "validation_stats_symptom_id_fkey"
            columns: ["symptom_id"]
            isOneToOne: true
            referencedRelation: "symptoms"
            referencedColumns: ["id"]
          },
        ]
      }
      word_templates: {
        Row: {
          id: string
          is_fallback: boolean
          order_index: number
          role: Database["public"]["Enums"]["word_template_role"]
          sentence_template: string
          symptom_slugs: string[]
        }
        Insert: {
          id?: string
          is_fallback?: boolean
          order_index: number
          role?: Database["public"]["Enums"]["word_template_role"]
          sentence_template: string
          symptom_slugs: string[]
        }
        Update: {
          id?: string
          is_fallback?: boolean
          order_index?: number
          role?: Database["public"]["Enums"]["word_template_role"]
          sentence_template?: string
          symptom_slugs?: string[]
        }
        Relationships: []
      }
      words_copies: {
        Row: {
          copied_at: string
          id: string
          user_id: string
        }
        Insert: {
          copied_at?: string
          id?: string
          user_id?: string
        }
        Update: {
          copied_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_my_account: { Args: never; Returns: undefined }
    }
    Enums: {
      medication_type: "gel" | "patch" | "pill" | "spray" | "other"
      perimenopause_stage: "early" | "mid" | "late" | "post"
      word_template_role: "opening" | "detail" | "ask"
      symptom_category:
        | "temperature"
        | "mood"
        | "cognitive"
        | "sleep"
        | "physical"
        | "cycle"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      medication_type: ["gel", "patch", "pill", "spray", "other"],
      perimenopause_stage: ["early", "mid", "late", "post"],
      symptom_category: [
        "temperature",
        "mood",
        "cognitive",
        "sleep",
        "physical",
        "cycle",
      ],
      word_template_role: ["opening", "detail", "ask"],
    },
  },
} as const
