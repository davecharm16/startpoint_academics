-- Epic 8: Payout Requests Table
-- Stories 8-12 (Reward Redemption) and 8-15 (Admin Payout Processing)

-- =====================================================
-- Step 1: Create payout_requests table
-- =====================================================

CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('gcash', 'bank')),
  payment_details JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'rejected')),
  rejection_reason TEXT,
  processed_by UUID REFERENCES profiles(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_payout_requests_user_id ON payout_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests (status);

-- =====================================================
-- Step 2: RLS Policies
-- =====================================================

ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

-- Clients can view their own payout requests
CREATE POLICY "Clients view own payout requests" ON payout_requests
  FOR SELECT USING (user_id = auth.uid());

-- System can create payout requests (via server actions)
CREATE POLICY "System creates payout requests" ON payout_requests
  FOR INSERT WITH CHECK (true);

-- Admin manages all payout requests
CREATE POLICY "Admin manages all payout requests" ON payout_requests
  FOR ALL USING (is_admin());

-- =====================================================
-- Step 3: Add apply_rewards flag to profiles
-- =====================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS apply_rewards_to_next_order BOOLEAN DEFAULT false;
