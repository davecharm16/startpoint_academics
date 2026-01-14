/**
 * Database types generated from Supabase schema
 * This file will be regenerated after running migrations
 * Run: npx supabase gen types typescript --local > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      packages: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          price: number;
          features: Json;
          required_fields: Json;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          price: number;
          features?: Json;
          required_fields?: Json;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          price?: number;
          features?: Json;
          required_fields?: Json;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          role: "admin" | "writer" | "client";
          full_name: string;
          email: string;
          phone: string | null;
          is_active: boolean;
          max_concurrent_projects: number;
          must_change_password: boolean;
          created_by: string | null;
          invited_at: string | null;
          referral_code: string | null;
          referred_by: string | null;
          referral_discount_used: boolean;
          reward_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: "admin" | "writer" | "client";
          full_name: string;
          email: string;
          phone?: string | null;
          is_active?: boolean;
          max_concurrent_projects?: number;
          must_change_password?: boolean;
          created_by?: string | null;
          invited_at?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          referral_discount_used?: boolean;
          reward_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "admin" | "writer" | "client";
          full_name?: string;
          email?: string;
          phone?: string | null;
          is_active?: boolean;
          max_concurrent_projects?: number;
          must_change_password?: boolean;
          created_by?: string | null;
          invited_at?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          referral_discount_used?: boolean;
          reward_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_id: string | null;
          referred_email: string;
          status: "signed_up" | "converted";
          reward_amount: number | null;
          reward_status: "pending" | "available" | "redeemed" | "paid" | null;
          converted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_id?: string | null;
          referred_email: string;
          status?: "signed_up" | "converted";
          reward_amount?: number | null;
          reward_status?: "pending" | "available" | "redeemed" | "paid" | null;
          converted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          referrer_id?: string;
          referred_id?: string | null;
          referred_email?: string;
          status?: "signed_up" | "converted";
          reward_amount?: number | null;
          reward_status?: "pending" | "available" | "redeemed" | "paid" | null;
          converted_at?: string | null;
          created_at?: string;
        };
      };
      reward_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: "referral_reward" | "social_reward" | "redemption" | "payout" | "adjustment";
          amount: number;
          balance_after: number;
          reference_id: string | null;
          reference_type: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "referral_reward" | "social_reward" | "redemption" | "payout" | "adjustment";
          amount: number;
          balance_after: number;
          reference_id?: string | null;
          reference_type?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "referral_reward" | "social_reward" | "redemption" | "payout" | "adjustment";
          amount?: number;
          balance_after?: number;
          reference_id?: string | null;
          reference_type?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      referral_settings: {
        Row: {
          id: string;
          program_enabled: boolean;
          new_client_discount_type: "percentage" | "fixed";
          new_client_discount_value: number;
          referrer_reward_type: "percentage" | "fixed";
          referrer_reward_value: number;
          minimum_payout: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          program_enabled?: boolean;
          new_client_discount_type?: "percentage" | "fixed";
          new_client_discount_value?: number;
          referrer_reward_type?: "percentage" | "fixed";
          referrer_reward_value?: number;
          minimum_payout?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          program_enabled?: boolean;
          new_client_discount_type?: "percentage" | "fixed";
          new_client_discount_value?: number;
          referrer_reward_type?: "percentage" | "fixed";
          referrer_reward_value?: number;
          minimum_payout?: number;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          reference_code: string;
          tracking_token: string;
          client_name: string;
          client_email: string;
          client_phone: string | null;
          client_user_id: string | null;
          client_google_id: string | null;
          package_id: string | null;
          agreed_price: number;
          topic: string;
          requirements: string;
          deadline: string;
          special_instructions: string | null;
          writer_id: string | null;
          assigned_at: string | null;
          status: string;
          downpayment_amount: number | null;
          downpayment_validated: boolean;
          final_payment_validated: boolean;
          writer_share: number;
          admin_share: number;
          last_activity_at: string;
          discount_amount: number;
          additional_charges: number;
          cancellation_reason: string | null;
          cancelled_at: string | null;
          estimated_completion_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference_code: string;
          tracking_token?: string;
          client_name: string;
          client_email: string;
          client_phone?: string | null;
          client_user_id?: string | null;
          client_google_id?: string | null;
          package_id?: string | null;
          agreed_price: number;
          topic: string;
          requirements: string;
          deadline: string;
          special_instructions?: string | null;
          writer_id?: string | null;
          assigned_at?: string | null;
          status?: string;
          downpayment_amount?: number | null;
          downpayment_validated?: boolean;
          final_payment_validated?: boolean;
          last_activity_at?: string;
          discount_amount?: number;
          additional_charges?: number;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          estimated_completion_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reference_code?: string;
          tracking_token?: string;
          client_name?: string;
          client_email?: string;
          client_phone?: string | null;
          client_user_id?: string | null;
          client_google_id?: string | null;
          package_id?: string | null;
          agreed_price?: number;
          topic?: string;
          requirements?: string;
          deadline?: string;
          special_instructions?: string | null;
          writer_id?: string | null;
          assigned_at?: string | null;
          status?: string;
          downpayment_amount?: number | null;
          downpayment_validated?: boolean;
          final_payment_validated?: boolean;
          last_activity_at?: string;
          discount_amount?: number;
          additional_charges?: number;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          estimated_completion_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_proofs: {
        Row: {
          id: string;
          project_id: string;
          type: "downpayment" | "final";
          storage_path: string;
          amount_claimed: number;
          reference_number: string | null;
          validated: boolean;
          validated_by: string | null;
          validated_at: string | null;
          rejection_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          type: "downpayment" | "final";
          storage_path: string;
          amount_claimed: number;
          reference_number?: string | null;
          validated?: boolean;
          validated_by?: string | null;
          validated_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          type?: "downpayment" | "final";
          storage_path?: string;
          amount_claimed?: number;
          reference_number?: string | null;
          validated?: boolean;
          validated_by?: string | null;
          validated_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
        };
      };
      project_history: {
        Row: {
          id: string;
          project_id: string;
          action: string;
          old_status: string | null;
          new_status: string | null;
          notes: string | null;
          performed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          action: string;
          old_status?: string | null;
          new_status?: string | null;
          notes?: string | null;
          performed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          action?: string;
          old_status?: string | null;
          new_status?: string | null;
          notes?: string | null;
          performed_by?: string | null;
          created_at?: string;
        };
      };
      payment_settings: {
        Row: {
          id: string;
          downpayment_type: "percentage" | "fixed";
          downpayment_value: number;
          minimum_downpayment: number | null;
          screenshot_required: boolean;
          reference_required: boolean;
          accepted_file_types: string[];
          updated_at: string;
        };
        Insert: {
          id?: string;
          downpayment_type: "percentage" | "fixed";
          downpayment_value: number;
          minimum_downpayment?: number | null;
          screenshot_required?: boolean;
          reference_required?: boolean;
          accepted_file_types?: string[];
          updated_at?: string;
        };
        Update: {
          id?: string;
          downpayment_type?: "percentage" | "fixed";
          downpayment_value?: number;
          minimum_downpayment?: number | null;
          screenshot_required?: boolean;
          reference_required?: boolean;
          accepted_file_types?: string[];
          updated_at?: string;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          name: string;
          is_enabled: boolean;
          account_number: string | null;
          account_name: string | null;
          additional_instructions: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_enabled?: boolean;
          account_number?: string | null;
          account_name?: string | null;
          additional_instructions?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          is_enabled?: boolean;
          account_number?: string | null;
          account_name?: string | null;
          additional_instructions?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Agent System Tables
      agent_usage_limits: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          daily_token_limit: number;
          weekly_token_limit: number;
          session_token_limit: number;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          daily_token_limit?: number;
          weekly_token_limit?: number;
          session_token_limit?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          daily_token_limit?: number;
          weekly_token_limit?: number;
          session_token_limit?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      writer_agent_sessions: {
        Row: {
          id: string;
          writer_id: string;
          project_id: string;
          title: string | null;
          status: "active" | "closed" | "archived";
          total_input_tokens: number;
          total_output_tokens: number;
          message_count: number;
          created_at: string;
          updated_at: string;
          closed_at: string | null;
        };
        Insert: {
          id?: string;
          writer_id: string;
          project_id: string;
          title?: string | null;
          status?: "active" | "closed" | "archived";
          total_input_tokens?: number;
          total_output_tokens?: number;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
        };
        Update: {
          id?: string;
          writer_id?: string;
          project_id?: string;
          title?: string | null;
          status?: "active" | "closed" | "archived";
          total_input_tokens?: number;
          total_output_tokens?: number;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
        };
      };
      agent_messages: {
        Row: {
          id: string;
          session_id: string;
          role: "user" | "assistant" | "system" | "tool";
          content: string | null;
          tool_name: string | null;
          tool_input: Json | null;
          tool_result: Json | null;
          input_tokens: number;
          output_tokens: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: "user" | "assistant" | "system" | "tool";
          content?: string | null;
          tool_name?: string | null;
          tool_input?: Json | null;
          tool_result?: Json | null;
          input_tokens?: number;
          output_tokens?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: "user" | "assistant" | "system" | "tool";
          content?: string | null;
          tool_name?: string | null;
          tool_input?: Json | null;
          tool_result?: Json | null;
          input_tokens?: number;
          output_tokens?: number;
          created_at?: string;
        };
      };
      agent_drafts: {
        Row: {
          id: string;
          session_id: string | null;
          project_id: string;
          writer_id: string;
          title: string;
          content: Json;
          plain_text: string | null;
          word_count: number;
          is_exported: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          project_id: string;
          writer_id: string;
          title?: string;
          content?: Json;
          plain_text?: string | null;
          word_count?: number;
          is_exported?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          project_id?: string;
          writer_id?: string;
          title?: string;
          content?: Json;
          plain_text?: string | null;
          word_count?: number;
          is_exported?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      writer_usage_daily: {
        Row: {
          writer_id: string;
          date: string;
          total_tokens: number;
          input_tokens: number;
          output_tokens: number;
          session_count: number;
          message_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          writer_id: string;
          date: string;
          total_tokens?: number;
          input_tokens?: number;
          output_tokens?: number;
          session_count?: number;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          writer_id?: string;
          date?: string;
          total_tokens?: number;
          input_tokens?: number;
          output_tokens?: number;
          session_count?: number;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      agent_blocked_attempts: {
        Row: {
          id: string;
          writer_id: string | null;
          session_id: string | null;
          reason: string;
          category: "usage_limit" | "content_filter" | "project_invalid" | "other" | null;
          message_snippet: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          writer_id?: string | null;
          session_id?: string | null;
          reason: string;
          category?: "usage_limit" | "content_filter" | "project_invalid" | "other" | null;
          message_snippet?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          writer_id?: string | null;
          session_id?: string | null;
          reason?: string;
          category?: "usage_limit" | "content_filter" | "project_invalid" | "other" | null;
          message_snippet?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      agent_uploads: {
        Row: {
          id: string;
          session_id: string;
          writer_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          extracted_text: string | null;
          is_processed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          writer_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          extracted_text?: string | null;
          is_processed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          writer_id?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          storage_path?: string;
          extracted_text?: string | null;
          is_processed?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      writer_workload: {
        Row: {
          id: string;
          full_name: string;
          max_concurrent_projects: number;
          current_projects: number;
          available_slots: number;
        };
      };
      profit_summary: {
        Row: {
          period: string;
          period_type: string;
          total_projects: number;
          paid_projects: number;
          total_revenue: number;
          total_writer_payments: number;
          total_profit: number;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_writer: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_client: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      link_projects_to_client: {
        Args: { client_id: string; client_email_param: string };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience types
export type Package = Database["public"]["Tables"]["packages"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type PaymentProof = Database["public"]["Tables"]["payment_proofs"]["Row"];
export type ProjectHistory = Database["public"]["Tables"]["project_history"]["Row"];
export type PaymentSettings = Database["public"]["Tables"]["payment_settings"]["Row"];
export type PaymentMethod = Database["public"]["Tables"]["payment_methods"]["Row"];
export type Referral = Database["public"]["Tables"]["referrals"]["Row"];
export type RewardTransaction = Database["public"]["Tables"]["reward_transactions"]["Row"];
export type ReferralSettings = Database["public"]["Tables"]["referral_settings"]["Row"];

// Agent System Types
export type AgentUsageLimit = Database["public"]["Tables"]["agent_usage_limits"]["Row"];
export type WriterAgentSession = Database["public"]["Tables"]["writer_agent_sessions"]["Row"];
export type AgentMessage = Database["public"]["Tables"]["agent_messages"]["Row"];
export type AgentDraft = Database["public"]["Tables"]["agent_drafts"]["Row"];
export type WriterUsageDaily = Database["public"]["Tables"]["writer_usage_daily"]["Row"];
export type AgentBlockedAttempt = Database["public"]["Tables"]["agent_blocked_attempts"]["Row"];
export type AgentUpload = Database["public"]["Tables"]["agent_uploads"]["Row"];
