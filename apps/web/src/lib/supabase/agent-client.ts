/**
 * Typed Supabase client helpers for agent tables
 * These tables are defined in migration 00009 but may not be in generated types yet
 * This file provides typed access until types are regenerated
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Json } from "@startpoint/types/database";

// Agent table types (matching migration 00009)
export interface AgentSession {
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
}

export interface AgentMessage {
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
}

export interface AgentDraft {
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
}

export interface AgentUsageDaily {
  writer_id: string;
  date: string;
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  session_count: number;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface AgentBlockedAttempt {
  id: string;
  writer_id: string | null;
  session_id: string | null;
  reason: string;
  category: "usage_limit" | "content_filter" | "project_invalid" | "other" | null;
  message_snippet: string | null;
  metadata: Json | null;
  created_at: string;
}

export interface AgentUpload {
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
}

/**
 * Get typed access to agent tables
 * Uses `any` casting internally but provides proper types externally
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAgentTables(supabase: SupabaseClient<any>): {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sessions: () => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: () => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  drafts: () => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  usageDaily: () => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blockedAttempts: () => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uploads: () => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  usageLimits: () => any;
} {
  return {
    sessions: () => supabase.from("writer_agent_sessions"),
    messages: () => supabase.from("agent_messages"),
    drafts: () => supabase.from("agent_drafts"),
    usageDaily: () => supabase.from("writer_usage_daily"),
    blockedAttempts: () => supabase.from("agent_blocked_attempts"),
    uploads: () => supabase.from("agent_uploads"),
    usageLimits: () => supabase.from("agent_usage_limits"),
  };
}
