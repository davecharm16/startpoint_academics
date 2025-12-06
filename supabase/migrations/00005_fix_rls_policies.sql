-- Migration: 00005_fix_rls_policies.sql
-- Description: Add missing RLS policies for anonymous project submission
-- Date: 2025-12-03

-- Allow public to insert project history (for initial submission)
CREATE POLICY "Public can insert project history"
  ON project_history FOR INSERT
  WITH CHECK (true);

-- Allow admin to insert project history
CREATE POLICY "Admin can insert project history"
  ON project_history FOR INSERT
  WITH CHECK (is_admin());

-- Allow writers to insert project history for their projects
CREATE POLICY "Writers can insert project history"
  ON project_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_history.project_id
        AND projects.writer_id = auth.uid()
    )
  );
