-- Migration: Project Files Storage
-- Adds support for file uploads/deliverables on projects

-- Create project_files table to track uploaded files
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  is_deliverable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 52428800) -- Max 50MB
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_uploaded_by ON project_files(uploaded_by);

-- Enable RLS
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- Writers can upload files to their assigned projects
CREATE POLICY "Writers can upload files to assigned projects"
  ON project_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id
      AND p.writer_id = auth.uid()
    )
  );

-- Writers can view files on their assigned projects
CREATE POLICY "Writers can view files on assigned projects"
  ON project_files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id
      AND p.writer_id = auth.uid()
    )
  );

-- Writers can delete their own uploads
CREATE POLICY "Writers can delete own uploads"
  ON project_files
  FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Admins can do everything
CREATE POLICY "Admins have full access to project files"
  ON project_files
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create the storage bucket for project deliverables
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-files',
  'project-files',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for the bucket
-- Writers can upload to their project folders
CREATE POLICY "Writers can upload project files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project-files'
    AND EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id::text = (storage.foldername(name))[1]
      AND p.writer_id = auth.uid()
    )
  );

-- Writers can view files in their project folders
CREATE POLICY "Writers can view project files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'project-files'
    AND EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id::text = (storage.foldername(name))[1]
      AND p.writer_id = auth.uid()
    )
  );

-- Writers can delete their own uploaded files
CREATE POLICY "Writers can delete own project files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'project-files'
    AND owner = auth.uid()
  );

-- Admins have full access to all project files
CREATE POLICY "Admins have full storage access"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'project-files'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Public access for clients via signed URLs (handled by service role, not direct policy)
-- Clients will access files through API endpoints that generate signed URLs
