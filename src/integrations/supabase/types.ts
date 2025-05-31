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
      app_users: {
        Row: {
          created_at: string
          id: string
          name: string | null
          role: string
          status: string
          team_id: number | null
        }
        Insert: {
          created_at?: string
          id: string
          name?: string | null
          role?: string
          status?: string
          team_id?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          role?: string
          status?: string
          team_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "app_users_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      cells: {
        Row: {
          address: string
          capacity: number | null
          created_at: string
          current_members: number | null
          description: string | null
          id: string
          is_active: boolean | null
          lat: number
          leader_email: string | null
          leader_name: string
          leader_phone: string | null
          lng: number
          meeting_day: string
          meeting_time: string
          name: string
          updated_at: string
        }
        Insert: {
          address: string
          capacity?: number | null
          created_at?: string
          current_members?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          lat: number
          leader_email?: string | null
          leader_name: string
          leader_phone?: string | null
          lng: number
          meeting_day: string
          meeting_time: string
          name: string
          updated_at?: string
        }
        Update: {
          address?: string
          capacity?: number | null
          created_at?: string
          current_members?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number
          leader_email?: string | null
          leader_name?: string
          leader_phone?: string | null
          lng?: number
          meeting_day?: string
          meeting_time?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_fields_config: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: number
          label: string
          name: string
          required: boolean | null
          type: string
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: number
          label: string
          name: string
          required?: boolean | null
          type: string
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: number
          label?: string
          name?: string
          required?: boolean | null
          type?: string
        }
        Relationships: []
      }
      general_settings: {
        Row: {
          allowDuplicates: boolean | null
          autoSave: boolean | null
          id: number
          requireTerms: boolean | null
          sendConfirmationEmail: boolean | null
          showProgress: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowDuplicates?: boolean | null
          autoSave?: boolean | null
          id: number
          requireTerms?: boolean | null
          sendConfirmationEmail?: boolean | null
          showProgress?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowDuplicates?: boolean | null
          autoSave?: boolean | null
          id?: number
          requireTerms?: boolean | null
          sendConfirmationEmail?: boolean | null
          showProgress?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      visitors: {
        Row: {
          address: string
          created_at: string
          distance: number
          id: string
          is_new_visitor: boolean | null
          lat: number
          lng: number
          metadata: Json | null
          name: string
          status: string | null
          updated_at: string
          visit_count: number | null
        }
        Insert: {
          address: string
          created_at?: string
          distance: number
          id?: string
          is_new_visitor?: boolean | null
          lat: number
          lng: number
          metadata?: Json | null
          name: string
          status?: string | null
          updated_at?: string
          visit_count?: number | null
        }
        Update: {
          address?: string
          created_at?: string
          distance?: number
          id?: string
          is_new_visitor?: boolean | null
          lat?: number
          lng?: number
          metadata?: Json | null
          name?: string
          status?: string | null
          updated_at?: string
          visit_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lng1: number; lat2: number; lng2: number }
        Returns: number
      }
      create_visitors_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      find_nearby_cells: {
        Args: {
          visitor_lat: number
          visitor_lng: number
          max_distance_km?: number
        }
        Returns: {
          cell_id: string
          cell_name: string
          leader_name: string
          leader_phone: string
          address: string
          distance_km: number
        }[]
      }
    }
    Enums: {
      age_group_type: "adolescente" | "jovem" | "adulto" | "melhor_idade"
      gender_type: "masculino" | "feminino"
      generation_type:
        | "nao_possui"
        | "atos"
        | "efraim"
        | "israel"
        | "jose"
        | "josue"
        | "kairos"
        | "levi"
        | "moriah"
        | "rafah"
        | "samuel"
        | "zion"
        | "zoe"
      how_did_you_hear_type:
        | "instagram"
        | "facebook"
        | "amigo_fora"
        | "amigo_igreja"
        | "google"
        | "outro"
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
      age_group_type: ["adolescente", "jovem", "adulto", "melhor_idade"],
      gender_type: ["masculino", "feminino"],
      generation_type: [
        "nao_possui",
        "atos",
        "efraim",
        "israel",
        "jose",
        "josue",
        "kairos",
        "levi",
        "moriah",
        "rafah",
        "samuel",
        "zion",
        "zoe",
      ],
      how_did_you_hear_type: [
        "instagram",
        "facebook",
        "amigo_fora",
        "amigo_igreja",
        "google",
        "outro",
      ],
    },
  },
} as const
