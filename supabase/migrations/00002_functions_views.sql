-- Migration: 00002_functions_views.sql
-- Description: Helper functions and views for Startpoint Academics
-- Author: BMAD Dev Agent
-- Date: 2025-12-01

-- ============================================
-- HELPER FUNCTIONS
-- Used in RLS policies for role checking
-- ============================================

-- Check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if current user is a writer
CREATE OR REPLACE FUNCTION is_writer()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'writer'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================
-- VIEWS
-- Pre-calculated data for common queries
-- ============================================

-- Writer workload view (for admin assignment decisions)
CREATE OR REPLACE VIEW writer_workload AS
SELECT
  p.id,
  p.full_name,
  p.email,
  p.max_concurrent_projects,
  COUNT(pr.id) FILTER (
    WHERE pr.status IN ('assigned', 'in_progress', 'review')
  ) AS current_projects,
  p.max_concurrent_projects - COUNT(pr.id) FILTER (
    WHERE pr.status IN ('assigned', 'in_progress', 'review')
  ) AS available_slots
FROM profiles p
LEFT JOIN projects pr ON p.id = pr.writer_id
WHERE p.role = 'writer' AND p.is_active = true
GROUP BY p.id, p.full_name, p.email, p.max_concurrent_projects;

-- Profit summary view (weekly and monthly aggregations)
CREATE OR REPLACE VIEW profit_summary AS
SELECT
  DATE_TRUNC('week', created_at) AS period,
  'weekly' AS period_type,
  COUNT(*) AS total_projects,
  COUNT(*) FILTER (WHERE status = 'paid') AS paid_projects,
  SUM(agreed_price - COALESCE(discount_amount, 0) + COALESCE(additional_charges, 0))
    FILTER (WHERE status = 'paid') AS total_revenue,
  SUM(writer_share) FILTER (WHERE status = 'paid') AS total_writer_payments,
  SUM(admin_share) FILTER (WHERE status = 'paid') AS total_profit
FROM projects
WHERE created_at >= NOW() - INTERVAL '1 year'
GROUP BY DATE_TRUNC('week', created_at)

UNION ALL

SELECT
  DATE_TRUNC('month', created_at) AS period,
  'monthly' AS period_type,
  COUNT(*) AS total_projects,
  COUNT(*) FILTER (WHERE status = 'paid') AS paid_projects,
  SUM(agreed_price - COALESCE(discount_amount, 0) + COALESCE(additional_charges, 0))
    FILTER (WHERE status = 'paid') AS total_revenue,
  SUM(writer_share) FILTER (WHERE status = 'paid') AS total_writer_payments,
  SUM(admin_share) FILTER (WHERE status = 'paid') AS total_profit
FROM projects
WHERE created_at >= NOW() - INTERVAL '1 year'
GROUP BY DATE_TRUNC('month', created_at)

ORDER BY period DESC;

-- ============================================
-- UTILITY FUNCTIONS
-- Reference code generation, etc.
-- ============================================

-- Generate reference code (SA-YYYY-NNNNN format)
CREATE OR REPLACE FUNCTION generate_reference_code()
RETURNS TEXT AS $$
DECLARE
  current_year INTEGER;
  next_number INTEGER;
  ref_code TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW());

  -- Get count of projects this year + 1
  SELECT COUNT(*) + 1 INTO next_number
  FROM projects
  WHERE EXTRACT(YEAR FROM created_at) = current_year;

  -- Format as SA-YYYY-NNNNN
  ref_code := 'SA-' || current_year || '-' || LPAD(next_number::TEXT, 5, '0');

  RETURN ref_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate reference code on insert
CREATE OR REPLACE FUNCTION set_reference_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_code IS NULL OR NEW.reference_code = '' THEN
    NEW.reference_code := generate_reference_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_reference_code
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION set_reference_code();

-- ============================================
-- PROJECT HISTORY TRIGGER
-- Auto-log status changes
-- ============================================

CREATE OR REPLACE FUNCTION log_project_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO project_history (project_id, action, old_status, new_status, performed_by)
    VALUES (
      NEW.id,
      'status_change',
      OLD.status,
      NEW.status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_status_change
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION log_project_status_change();

-- Log project creation
CREATE OR REPLACE FUNCTION log_project_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_history (project_id, action, new_status, notes)
  VALUES (
    NEW.id,
    'created',
    NEW.status,
    'Project submitted by client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_project_creation
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION log_project_creation();
