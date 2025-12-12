-- Epic 8: Client Accounts & Referral System Migration
-- Story 8.1: Client Registration

-- =====================================================
-- Step 1: Extend profiles table for client role
-- =====================================================

-- Add 'client' to the role check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'writer', 'client'));

-- Add client-specific columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS referral_discount_used BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reward_balance DECIMAL(10,2) DEFAULT 0;

-- Create index for referral code lookups (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code
  ON profiles (UPPER(referral_code));

-- =====================================================
-- Step 2: Add client_user_id to projects table
-- =====================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS client_user_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS referral_discount_applied DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reward_balance_applied DECIMAL(10,2) DEFAULT 0;

-- Index for client project lookups
CREATE INDEX IF NOT EXISTS idx_projects_client_user_id
  ON projects (client_user_id);

-- =====================================================
-- Step 3: Create referrals table
-- =====================================================

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id),
  referred_id UUID REFERENCES profiles(id),
  referred_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'signed_up' CHECK (status IN ('signed_up', 'converted')),
  reward_amount DECIMAL(10,2),
  reward_status TEXT DEFAULT 'pending' CHECK (reward_status IN ('pending', 'available', 'redeemed', 'paid')),
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for referral queries
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals (referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals (referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_email ON referrals (referred_email);

-- =====================================================
-- Step 4: Create reward_transactions table
-- =====================================================

CREATE TABLE IF NOT EXISTS reward_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('referral_reward', 'social_reward', 'redemption', 'payout', 'adjustment')),
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reward_transactions_user_id
  ON reward_transactions (user_id);

-- =====================================================
-- Step 5: Create referral_settings table
-- =====================================================

CREATE TABLE IF NOT EXISTS referral_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_enabled BOOLEAN DEFAULT true,
  new_client_discount_type TEXT DEFAULT 'percentage' CHECK (new_client_discount_type IN ('percentage', 'fixed')),
  new_client_discount_value DECIMAL(10,2) DEFAULT 10,
  referrer_reward_type TEXT DEFAULT 'fixed' CHECK (referrer_reward_type IN ('percentage', 'fixed')),
  referrer_reward_value DECIMAL(10,2) DEFAULT 100,
  minimum_payout DECIMAL(10,2) DEFAULT 500,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO referral_settings (program_enabled, new_client_discount_value, referrer_reward_value, minimum_payout)
VALUES (true, 10, 100, 500)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Step 6: Create is_client() helper function
-- =====================================================

CREATE OR REPLACE FUNCTION is_client()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'client'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- =====================================================
-- Step 7: RLS Policies
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_settings ENABLE ROW LEVEL SECURITY;

-- REFERRALS policies
CREATE POLICY "Clients view own referrals" ON referrals
  FOR SELECT USING (referrer_id = auth.uid());

CREATE POLICY "System creates referrals on registration" ON referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manages all referrals" ON referrals
  FOR ALL USING (is_admin());

-- REWARD_TRANSACTIONS policies
CREATE POLICY "Users view own transactions" ON reward_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System creates transactions" ON reward_transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manages all transactions" ON reward_transactions
  FOR ALL USING (is_admin());

-- REFERRAL_SETTINGS policies (public read, admin write)
CREATE POLICY "Anyone can read referral settings" ON referral_settings
  FOR SELECT USING (true);

CREATE POLICY "Admin manages referral settings" ON referral_settings
  FOR ALL USING (is_admin());

-- PROFILES: Allow clients to read their own profile
CREATE POLICY "Clients read own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- PROFILES: Allow system to insert client profiles (during registration)
CREATE POLICY "Service role inserts profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- PROFILES: Allow clients to update their own profile
CREATE POLICY "Clients update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- PROJECTS: Allow clients to view their own projects
CREATE POLICY "Clients view own projects" ON projects
  FOR SELECT USING (client_user_id = auth.uid());

-- =====================================================
-- Step 8: Create referral leaderboard view
-- =====================================================

CREATE OR REPLACE VIEW referral_leaderboard AS
SELECT
  p.id,
  p.full_name,
  p.referral_code,
  COUNT(r.id) AS total_referrals,
  COUNT(r.id) FILTER (WHERE r.status = 'converted') AS conversions,
  COALESCE(SUM(r.reward_amount) FILTER (WHERE r.reward_status IN ('available', 'redeemed', 'paid')), 0) AS total_earned,
  COALESCE(SUM(r.reward_amount) FILTER (WHERE r.reward_status = 'available'), 0) AS available_balance
FROM profiles p
LEFT JOIN referrals r ON p.id = r.referrer_id
WHERE p.role = 'client'
GROUP BY p.id, p.full_name, p.referral_code
ORDER BY conversions DESC, total_referrals DESC;

-- Grant access to the view
GRANT SELECT ON referral_leaderboard TO authenticated;

-- =====================================================
-- Step 9: Function to link existing projects on registration
-- =====================================================

CREATE OR REPLACE FUNCTION link_projects_to_client(client_id UUID, client_email_param TEXT)
RETURNS INTEGER AS $$
DECLARE
  linked_count INTEGER;
BEGIN
  UPDATE projects
  SET client_user_id = client_id
  WHERE client_email = client_email_param
    AND client_user_id IS NULL;

  GET DIAGNOSTICS linked_count = ROW_COUNT;
  RETURN linked_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
