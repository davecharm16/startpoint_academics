-- Migration: Add writer onboarding fields
-- Story 3.12: Admin Writer Account Creation

-- Add must_change_password flag to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;

-- Add created_by to track who created the writer account
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- Add invited_at timestamp for tracking when writer was invited
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;

-- Comment on new columns
COMMENT ON COLUMN profiles.must_change_password IS 'Flag to force password change on first login';
COMMENT ON COLUMN profiles.created_by IS 'Admin who created this writer account';
COMMENT ON COLUMN profiles.invited_at IS 'Timestamp when writer was invited';

-- Index for querying writers by creation date
CREATE INDEX IF NOT EXISTS idx_profiles_role_invited
ON profiles(role, invited_at DESC) WHERE role = 'writer';

-- Update RLS policy for admin to create writer profiles
-- Drop existing insert policy if exists
DROP POLICY IF EXISTS "Admins can insert writer profiles" ON profiles;

-- Create policy allowing admins to insert writer profiles
CREATE POLICY "Admins can insert writer profiles"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if the inserting user is an admin
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
  -- And the new profile is for a writer
  AND role = 'writer'
);

-- Allow admins to update writer profiles (for must_change_password flag)
DROP POLICY IF EXISTS "Admins can update writer profiles" ON profiles;

CREATE POLICY "Admins can update writer profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  -- Admin can update any writer profile
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
  AND role = 'writer'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
  AND role = 'writer'
);

-- Allow users to update their own must_change_password flag
DROP POLICY IF EXISTS "Users can update own password flag" ON profiles;

CREATE POLICY "Users can update own password flag"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
