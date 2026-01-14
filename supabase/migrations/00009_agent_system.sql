-- Migration: Writer Agent System
-- Description: Add tables for AI writing assistant with sessions, messages, drafts, and usage tracking

-- ============================================================================
-- AGENT USAGE LIMITS (Admin configurable)
-- ============================================================================
CREATE TABLE agent_usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  daily_token_limit INT NOT NULL DEFAULT 100000,
  weekly_token_limit INT NOT NULL DEFAULT 500000,
  session_token_limit INT NOT NULL DEFAULT 50000,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default limits
INSERT INTO agent_usage_limits (name, description, daily_token_limit, weekly_token_limit, session_token_limit, is_default)
VALUES ('default', 'Default usage limits for writers', 100000, 500000, 50000, TRUE);

-- ============================================================================
-- WRITER AGENT SESSIONS
-- ============================================================================
CREATE TABLE writer_agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  writer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  total_input_tokens INT NOT NULL DEFAULT 0,
  total_output_tokens INT NOT NULL DEFAULT 0,
  message_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Index for quick lookups
CREATE INDEX idx_agent_sessions_writer ON writer_agent_sessions(writer_id);
CREATE INDEX idx_agent_sessions_project ON writer_agent_sessions(project_id);
CREATE INDEX idx_agent_sessions_status ON writer_agent_sessions(status);

-- ============================================================================
-- AGENT MESSAGES (Chat history)
-- ============================================================================
CREATE TABLE agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES writer_agent_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT,
  tool_name TEXT,
  tool_input JSONB,
  tool_result JSONB,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for message retrieval
CREATE INDEX idx_agent_messages_session ON agent_messages(session_id);
CREATE INDEX idx_agent_messages_created ON agent_messages(created_at);

-- ============================================================================
-- AGENT DRAFTS (TipTap document storage)
-- ============================================================================
CREATE TABLE agent_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES writer_agent_sessions(id) ON DELETE SET NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  writer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Draft',
  content JSONB NOT NULL DEFAULT '{"type": "doc", "content": []}',
  plain_text TEXT,
  word_count INT NOT NULL DEFAULT 0,
  is_exported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for draft lookups
CREATE INDEX idx_agent_drafts_project ON agent_drafts(project_id);
CREATE INDEX idx_agent_drafts_writer ON agent_drafts(writer_id);
CREATE INDEX idx_agent_drafts_session ON agent_drafts(session_id);

-- ============================================================================
-- WRITER DAILY USAGE TRACKING
-- ============================================================================
CREATE TABLE writer_usage_daily (
  writer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_tokens INT NOT NULL DEFAULT 0,
  input_tokens INT NOT NULL DEFAULT 0,
  output_tokens INT NOT NULL DEFAULT 0,
  session_count INT NOT NULL DEFAULT 0,
  message_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (writer_id, date)
);

-- Index for usage queries
CREATE INDEX idx_usage_daily_date ON writer_usage_daily(date);

-- ============================================================================
-- AGENT BLOCKED ATTEMPTS (Audit log)
-- ============================================================================
CREATE TABLE agent_blocked_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  writer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id UUID REFERENCES writer_agent_sessions(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  category TEXT CHECK (category IN ('usage_limit', 'content_filter', 'project_invalid', 'other')),
  message_snippet TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for audit queries
CREATE INDEX idx_blocked_attempts_writer ON agent_blocked_attempts(writer_id);
CREATE INDEX idx_blocked_attempts_created ON agent_blocked_attempts(created_at);

-- ============================================================================
-- AGENT UPLOADED FILES (Reference materials)
-- ============================================================================
CREATE TABLE agent_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES writer_agent_sessions(id) ON DELETE CASCADE,
  writer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INT NOT NULL,
  storage_path TEXT NOT NULL,
  extracted_text TEXT,
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for file lookups
CREATE INDEX idx_agent_uploads_session ON agent_uploads(session_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update writer daily usage
CREATE OR REPLACE FUNCTION update_writer_daily_usage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO writer_usage_daily (writer_id, date, total_tokens, input_tokens, output_tokens, message_count)
  SELECT
    s.writer_id,
    CURRENT_DATE,
    COALESCE(NEW.input_tokens, 0) + COALESCE(NEW.output_tokens, 0),
    COALESCE(NEW.input_tokens, 0),
    COALESCE(NEW.output_tokens, 0),
    1
  FROM writer_agent_sessions s
  WHERE s.id = NEW.session_id
  ON CONFLICT (writer_id, date) DO UPDATE SET
    total_tokens = writer_usage_daily.total_tokens + COALESCE(NEW.input_tokens, 0) + COALESCE(NEW.output_tokens, 0),
    input_tokens = writer_usage_daily.input_tokens + COALESCE(NEW.input_tokens, 0),
    output_tokens = writer_usage_daily.output_tokens + COALESCE(NEW.output_tokens, 0),
    message_count = writer_usage_daily.message_count + 1,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update daily usage on message insert
CREATE TRIGGER trg_update_daily_usage
  AFTER INSERT ON agent_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_writer_daily_usage();

-- Function to update session token counts
CREATE OR REPLACE FUNCTION update_session_tokens()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE writer_agent_sessions
  SET
    total_input_tokens = total_input_tokens + COALESCE(NEW.input_tokens, 0),
    total_output_tokens = total_output_tokens + COALESCE(NEW.output_tokens, 0),
    message_count = message_count + 1,
    updated_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update session on message insert
CREATE TRIGGER trg_update_session_tokens
  AFTER INSERT ON agent_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_session_tokens();

-- Function to update draft word count
CREATE OR REPLACE FUNCTION update_draft_word_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract plain text and count words
  NEW.plain_text = regexp_replace(NEW.content::text, '<[^>]*>', '', 'g');
  NEW.word_count = array_length(regexp_split_to_array(COALESCE(NEW.plain_text, ''), '\s+'), 1);
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update word count on draft update
CREATE TRIGGER trg_update_draft_word_count
  BEFORE INSERT OR UPDATE OF content ON agent_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_draft_word_count();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE agent_usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE writer_agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE writer_usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_blocked_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_uploads ENABLE ROW LEVEL SECURITY;

-- Usage limits: Admins can manage, all authenticated users can read
CREATE POLICY "Admins can manage usage limits" ON agent_usage_limits
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can read usage limits" ON agent_usage_limits
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Sessions: Writers can manage their own sessions, admins can view all
CREATE POLICY "Writers can manage their own sessions" ON writer_agent_sessions
  FOR ALL
  USING (writer_id = auth.uid());

CREATE POLICY "Admins can view all sessions" ON writer_agent_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Messages: Writers can manage messages in their sessions
CREATE POLICY "Writers can manage messages in their sessions" ON agent_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM writer_agent_sessions
      WHERE writer_agent_sessions.id = agent_messages.session_id
      AND writer_agent_sessions.writer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all messages" ON agent_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Drafts: Writers can manage their own drafts
CREATE POLICY "Writers can manage their own drafts" ON agent_drafts
  FOR ALL
  USING (writer_id = auth.uid());

CREATE POLICY "Admins can view all drafts" ON agent_drafts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Daily usage: Writers can view their own, admins can view all
CREATE POLICY "Writers can view their own usage" ON writer_usage_daily
  FOR SELECT
  USING (writer_id = auth.uid());

CREATE POLICY "Admins can view all usage" ON writer_usage_daily
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- System can insert/update usage (via service role)
CREATE POLICY "System can manage usage" ON writer_usage_daily
  FOR ALL
  USING (auth.role() = 'service_role');

-- Blocked attempts: Admins only
CREATE POLICY "Admins can view blocked attempts" ON agent_blocked_attempts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert blocked attempts" ON agent_blocked_attempts
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Uploads: Writers can manage their own uploads
CREATE POLICY "Writers can manage their own uploads" ON agent_uploads
  FOR ALL
  USING (writer_id = auth.uid());

CREATE POLICY "Admins can view all uploads" ON agent_uploads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- STORAGE BUCKET FOR AGENT UPLOADS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'agent-uploads',
  'agent-uploads',
  FALSE,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for agent uploads
CREATE POLICY "Writers can upload to agent-uploads" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'agent-uploads'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Writers can view their own agent uploads" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'agent-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Writers can delete their own agent uploads" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'agent-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can view all agent uploads" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'agent-uploads'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
