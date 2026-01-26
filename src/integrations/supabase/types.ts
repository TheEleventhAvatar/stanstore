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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          booking_type_id: string
          created_at: string
          customer_id: string | null
          duration: number
          id: string
          meeting_url: string | null
          notes: string | null
          order_id: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["booking_status"]
          store_id: string
          updated_at: string
        }
        Insert: {
          booking_type_id: string
          created_at?: string
          customer_id?: string | null
          duration: number
          id?: string
          meeting_url?: string | null
          notes?: string | null
          order_id?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          store_id: string
          updated_at?: string
        }
        Update: {
          booking_type_id?: string
          created_at?: string
          customer_id?: string | null
          duration?: number
          id?: string
          meeting_url?: string | null
          notes?: string | null
          order_id?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_booking_type_id_fkey"
            columns: ["booking_type_id"]
            isOneToOne: false
            referencedRelation: "booking_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      booking_types: {
        Row: {
          buffer_after: number | null
          buffer_before: number | null
          cover_image_url: string | null
          created_at: string
          currency: string
          description: string | null
          duration: number
          id: string
          is_active: boolean | null
          name: string
          price: number
          store_id: string
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          buffer_after?: number | null
          buffer_before?: number | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          store_id: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          buffer_after?: number | null
          buffer_before?: number | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          store_id?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_types_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          stripe_customer_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      links: {
        Row: {
          click_count: number | null
          created_at: string
          icon: string | null
          id: string
          is_active: boolean | null
          position: number
          store_id: string
          title: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          click_count?: number | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          position?: number
          store_id: string
          title: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          click_count?: number | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          position?: number
          store_id?: string
          title?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          benefits: string[] | null
          cover_image_url: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          interval: string
          is_active: boolean | null
          member_count: number | null
          name: string
          price: number
          store_id: string
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          benefits?: string[] | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          interval?: string
          is_active?: boolean | null
          member_count?: number | null
          name: string
          price: number
          store_id: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          benefits?: string[] | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          interval?: string
          is_active?: boolean | null
          member_count?: number | null
          name?: string
          price?: number
          store_id?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          booking_type_id: string | null
          created_at: string
          currency: string
          customer_id: string | null
          id: string
          membership_id: string | null
          platform_fee: number
          product_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          store_id: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_type_id?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          id?: string
          membership_id?: string | null
          platform_fee?: number
          product_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          store_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_type_id?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          id?: string
          membership_id?: string | null
          platform_fee?: number
          product_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          store_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_booking_type_id_fkey"
            columns: ["booking_type_id"]
            isOneToOne: false
            referencedRelation: "booking_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string
          id: string
          platform_fee_percentage: number
          stripe_webhook_secret: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform_fee_percentage?: number
          stripe_webhook_secret?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          platform_fee_percentage?: number
          stripe_webhook_secret?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          cover_image_url: string | null
          created_at: string
          currency: string
          description: string | null
          download_limit: number | null
          file_name: string | null
          file_url: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          sales_count: number | null
          store_id: string
          stripe_price_id: string | null
          stripe_product_id: string | null
          type: Database["public"]["Enums"]["product_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          download_limit?: number | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number
          sales_count?: number | null
          store_id: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          download_limit?: number | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          sales_count?: number | null
          store_id?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          instagram_url: string | null
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean | null
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          website: string | null
          youtube_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          youtube_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      stores: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_published: boolean | null
          logo_url: string | null
          primary_color: string | null
          profile_id: string
          secondary_color: string | null
          subdomain: string
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_published?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          profile_id: string
          secondary_color?: string | null
          subdomain: string
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_published?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          profile_id?: string
          secondary_color?: string | null
          subdomain?: string
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          customer_id: string
          id: string
          membership_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          store_id: string
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id: string
          id?: string
          membership_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          store_id: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id?: string
          id?: string
          membership_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          store_id?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_store_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "completed" | "cancelled"
      order_status: "pending" | "completed" | "refunded" | "failed"
      product_type: "digital" | "membership" | "booking"
      subscription_status: "active" | "cancelled" | "past_due" | "trialing"
      user_role: "creator" | "customer" | "admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      booking_status: ["pending", "confirmed", "completed", "cancelled"],
      order_status: ["pending", "completed", "refunded", "failed"],
      product_type: ["digital", "membership", "booking"],
      subscription_status: ["active", "cancelled", "past_due", "trialing"],
      user_role: ["creator", "customer", "admin"],
    },
  },
} as const
