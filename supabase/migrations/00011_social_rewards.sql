-- Epic 8: Social Rewards System
-- Stories 8-17, 8-18, 8-19, 8-20, 8-21

-- =====================================================
-- Step 1: Create social_reward_settings table
-- =====================================================

CREATE TABLE IF NOT EXISTS social_reward_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL UNIQUE CHECK (action_type IN ('like_page', 'follow_page', 'share_post')),
  is_enabled BOOLEAN DEFAULT true,
  discount_amount DECIMAL(10,2) DEFAULT 50 CHECK (discount_amount >= 0 AND discount_amount <= 500),
  instruction_text TEXT DEFAULT '',
  social_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings for each action type
INSERT INTO social_reward_settings (action_type, is_enabled, discount_amount, instruction_text)
VALUES
  ('like_page', true, 50, 'Like our Facebook page and take a screenshot'),
  ('follow_page', true, 50, 'Follow our social media page and take a screenshot'),
  ('share_post', true, 100, 'Share our latest post and take a screenshot')
ON CONFLICT (action_type) DO NOTHING;

-- =====================================================
-- Step 2: Create social_claims table
-- =====================================================

CREATE TABLE IF NOT EXISTS social_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('like_page', 'follow_page', 'share_post')),
  social_username TEXT,
  screenshot_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  discount_amount DECIMAL(10,2),
  rejection_reason TEXT,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, action_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_claims_user_id ON social_claims (user_id);
CREATE INDEX IF NOT EXISTS idx_social_claims_status ON social_claims (status);

-- =====================================================
-- Step 3: RLS Policies
-- =====================================================

ALTER TABLE social_reward_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_claims ENABLE ROW LEVEL SECURITY;

-- Social reward settings: public read, admin write
CREATE POLICY "Anyone can read social settings" ON social_reward_settings
  FOR SELECT USING (true);

CREATE POLICY "Admin manages social settings" ON social_reward_settings
  FOR ALL USING (is_admin());

-- Social claims: clients see own, admins manage all
CREATE POLICY "Clients view own claims" ON social_claims
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System creates claims" ON social_claims
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manages all claims" ON social_claims
  FOR ALL USING (is_admin());

-- Clients can update own rejected claims (for resubmission)
CREATE POLICY "Clients update own rejected claims" ON social_claims
  FOR UPDATE USING (user_id = auth.uid() AND status = 'rejected');

-- =====================================================
-- Step 4: Create social-proofs storage bucket
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('social-proofs', 'social-proofs', false)
ON CONFLICT DO NOTHING;

-- Storage policies for social-proofs bucket
CREATE POLICY "Clients upload own social proofs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'social-proofs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Clients read own social proofs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'social-proofs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admin reads all social proofs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'social-proofs' AND
    is_admin()
  );
