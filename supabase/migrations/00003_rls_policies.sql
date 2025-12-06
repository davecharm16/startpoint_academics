-- Migration: 00003_rls_policies.sql
-- Description: Row Level Security policies for all tables
-- Author: BMAD Dev Agent
-- Date: 2025-12-01

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- Admin can manage all profiles
CREATE POLICY "Admin can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update profiles"
  ON profiles FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin can delete profiles"
  ON profiles FOR DELETE
  USING (is_admin());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================
-- PACKAGES POLICIES
-- ============================================

-- Anyone can view active packages (public access)
CREATE POLICY "Anyone can view active packages"
  ON packages FOR SELECT
  USING (is_active = true);

-- Admin can view all packages (including inactive)
CREATE POLICY "Admin can view all packages"
  ON packages FOR SELECT
  USING (is_admin());

-- Admin can manage packages
CREATE POLICY "Admin can insert packages"
  ON packages FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update packages"
  ON packages FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin can delete packages"
  ON packages FOR DELETE
  USING (is_admin());

-- ============================================
-- PROJECTS POLICIES
-- ============================================

-- Admin has full access to all projects
CREATE POLICY "Admin full access to projects"
  ON projects FOR ALL
  USING (is_admin());

-- Writers can view their assigned projects
CREATE POLICY "Writers can view assigned projects"
  ON projects FOR SELECT
  USING (writer_id = auth.uid());

-- Writers can update their assigned projects (status, notes, etc.)
CREATE POLICY "Writers can update assigned projects"
  ON projects FOR UPDATE
  USING (writer_id = auth.uid())
  WITH CHECK (writer_id = auth.uid());

-- Public can insert new projects (client submissions)
CREATE POLICY "Public can submit projects"
  ON projects FOR INSERT
  WITH CHECK (true);

-- Public can view project by tracking token (for client tracking page)
-- Note: This requires setting the tracking token in a session variable
-- In practice, we'll handle this via a server function or API route
CREATE POLICY "Public can view by tracking token"
  ON projects FOR SELECT
  USING (
    tracking_token::text = COALESCE(
      current_setting('app.tracking_token', true),
      ''
    )
  );

-- ============================================
-- PAYMENT PROOFS POLICIES
-- ============================================

-- Admin can manage all payment proofs
CREATE POLICY "Admin can manage payment proofs"
  ON payment_proofs FOR ALL
  USING (is_admin());

-- Writers can view payment proofs for their assigned projects
CREATE POLICY "Writers can view payment proofs for assigned projects"
  ON payment_proofs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = payment_proofs.project_id
        AND projects.writer_id = auth.uid()
    )
  );

-- Public can insert payment proofs (with project submission)
CREATE POLICY "Public can submit payment proofs"
  ON payment_proofs FOR INSERT
  WITH CHECK (true);

-- ============================================
-- PROJECT HISTORY POLICIES
-- ============================================

-- Admin can view all project history
CREATE POLICY "Admin can view all project history"
  ON project_history FOR SELECT
  USING (is_admin());

-- Writers can view history for their assigned projects
CREATE POLICY "Writers can view history for assigned projects"
  ON project_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_history.project_id
        AND projects.writer_id = auth.uid()
    )
  );

-- System inserts history (via triggers with SECURITY DEFINER)
-- No direct insert policy needed for users

-- ============================================
-- PAYMENT SETTINGS POLICIES
-- ============================================

-- Anyone can view payment settings (needed for intake form)
CREATE POLICY "Public can view payment settings"
  ON payment_settings FOR SELECT
  USING (true);

-- Admin can manage payment settings
CREATE POLICY "Admin can manage payment settings"
  ON payment_settings FOR ALL
  USING (is_admin());

-- ============================================
-- PAYMENT METHODS POLICIES
-- ============================================

-- Anyone can view enabled payment methods (for intake form)
CREATE POLICY "Public can view enabled payment methods"
  ON payment_methods FOR SELECT
  USING (is_enabled = true);

-- Admin can view all payment methods
CREATE POLICY "Admin can view all payment methods"
  ON payment_methods FOR SELECT
  USING (is_admin());

-- Admin can manage payment methods
CREATE POLICY "Admin can insert payment methods"
  ON payment_methods FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update payment methods"
  ON payment_methods FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin can delete payment methods"
  ON payment_methods FOR DELETE
  USING (is_admin());
