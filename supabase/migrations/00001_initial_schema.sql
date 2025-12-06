-- Migration: 00001_initial_schema.sql
-- Description: Create all core tables for Startpoint Academics
-- Author: BMAD Dev Agent
-- Date: 2025-12-01

-- ============================================
-- PROFILES TABLE
-- Extends Supabase auth.users for app-specific data
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'writer')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  max_concurrent_projects INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PACKAGES TABLE
-- Service offerings with dynamic form configuration
-- ============================================
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  required_fields JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECTS TABLE
-- Core entity with status workflow and 60/40 split calculation
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT UNIQUE NOT NULL,
  tracking_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),

  -- Client information (no auth required)
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  client_google_id TEXT,

  -- Project details
  package_id UUID REFERENCES packages(id),
  agreed_price DECIMAL(10,2) NOT NULL,
  topic TEXT NOT NULL,
  requirements TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  special_instructions TEXT,

  -- Assignment
  writer_id UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ,

  -- Status workflow
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'submitted',
    'pending_payment_validation',
    'validated',
    'rejected',
    'assigned',
    'in_progress',
    'review',
    'complete',
    'paid'
  )),

  -- Payment tracking
  downpayment_amount DECIMAL(10,2),
  downpayment_validated BOOLEAN DEFAULT false,
  final_payment_validated BOOLEAN DEFAULT false,

  -- Edge cases: discounts, additional charges
  discount_amount DECIMAL(10,2) DEFAULT 0,
  additional_charges DECIMAL(10,2) DEFAULT 0,

  -- Calculated 60/40 split (based on final amount)
  writer_share DECIMAL(10,2) GENERATED ALWAYS AS (
    (agreed_price - COALESCE(discount_amount, 0) + COALESCE(additional_charges, 0)) * 0.6
  ) STORED,
  admin_share DECIMAL(10,2) GENERATED ALWAYS AS (
    (agreed_price - COALESCE(discount_amount, 0) + COALESCE(additional_charges, 0)) * 0.4
  ) STORED,

  -- Activity tracking (for abandonment detection)
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),

  -- Cancellation
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,

  -- Estimated completion (writer sets this)
  estimated_completion_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENT PROOFS TABLE
-- Screenshots of payment for validation
-- ============================================
CREATE TABLE payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('downpayment', 'final')),
  storage_path TEXT NOT NULL,
  amount_claimed DECIMAL(10,2) NOT NULL,
  reference_number TEXT,
  validated BOOLEAN DEFAULT false,
  validated_by UUID REFERENCES profiles(id),
  validated_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECT HISTORY TABLE
-- Audit log for all status changes
-- ============================================
CREATE TABLE project_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  notes TEXT,
  performed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENT SETTINGS TABLE
-- Admin configuration for payment requirements
-- ============================================
CREATE TABLE payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  downpayment_type TEXT NOT NULL CHECK (downpayment_type IN ('percentage', 'fixed')),
  downpayment_value DECIMAL(10,2) NOT NULL,
  minimum_downpayment DECIMAL(10,2),
  screenshot_required BOOLEAN DEFAULT true,
  reference_required BOOLEAN DEFAULT false,
  accepted_file_types TEXT[] DEFAULT ARRAY['jpg', 'jpeg', 'png', 'pdf'],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENT METHODS TABLE
-- Available payment methods for clients
-- ============================================
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  account_number TEXT,
  account_name TEXT,
  additional_instructions TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- Optimize frequently queried columns
-- ============================================

-- Projects indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_writer_id ON projects(writer_id);
CREATE INDEX idx_projects_deadline ON projects(deadline);
CREATE INDEX idx_projects_tracking_token ON projects(tracking_token);
CREATE INDEX idx_projects_reference_code ON projects(reference_code);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_client_email ON projects(client_email);

-- Composite indexes for common queries
CREATE INDEX idx_projects_writer_status ON projects(writer_id, status);
CREATE INDEX idx_projects_status_deadline ON projects(status, deadline);

-- Project history index
CREATE INDEX idx_project_history_project_id ON project_history(project_id);
CREATE INDEX idx_project_history_created_at ON project_history(created_at DESC);

-- Payment proofs index
CREATE INDEX idx_payment_proofs_project_id ON payment_proofs(project_id);

-- Packages index
CREATE INDEX idx_packages_slug ON packages(slug);
CREATE INDEX idx_packages_is_active ON packages(is_active);
CREATE INDEX idx_packages_display_order ON packages(display_order);

-- Profiles index
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- ============================================
-- TRIGGERS
-- Auto-update timestamps
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_settings_updated_at
  BEFORE UPDATE ON payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
