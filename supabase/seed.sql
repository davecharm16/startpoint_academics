-- Seed Data for Startpoint Academics
-- Run with: npx supabase db reset (applies migrations + seed)

-- ============================================
-- PACKAGES
-- Sample service offerings
-- ============================================

INSERT INTO packages (slug, name, description, price, features, required_fields, display_order, is_active) VALUES

-- Package 1: Essay Writing (Basic tier)
(
  'essay-writing',
  'Essay Writing',
  'Professional essay writing service for any subject. Perfect for assignments, coursework, and academic papers.',
  1500.00,
  '["Original, plagiarism-free content", "Proper formatting and citations", "24-48 hour delivery", "One free revision", "Direct communication with writer"]'::jsonb,
  '[
    {"name": "word_count", "label": "Word Count", "type": "number", "required": true},
    {"name": "academic_level", "label": "Academic Level", "type": "select", "required": true, "options": ["High School", "Undergraduate", "Graduate"]},
    {"name": "subject", "label": "Subject Area", "type": "text", "required": true},
    {"name": "citation_style", "label": "Citation Style", "type": "select", "required": false, "options": ["None", "APA", "MLA", "Chicago", "Harvard"]}
  ]'::jsonb,
  1,
  true
),

-- Package 2: Research Paper (Mid tier)
(
  'research-paper',
  'Research Paper',
  'Comprehensive research papers with in-depth analysis, proper citations, and academic rigor. Ideal for major course requirements.',
  3000.00,
  '["Thorough research from credible sources", "Proper academic structure", "Full bibliography included", "3-5 day delivery", "Two free revisions", "Source materials provided"]'::jsonb,
  '[
    {"name": "page_count", "label": "Number of Pages", "type": "number", "required": true},
    {"name": "academic_level", "label": "Academic Level", "type": "select", "required": true, "options": ["Undergraduate", "Graduate", "PhD"]},
    {"name": "subject", "label": "Subject Area", "type": "text", "required": true},
    {"name": "citation_style", "label": "Citation Style", "type": "select", "required": true, "options": ["APA", "MLA", "Chicago", "Harvard", "IEEE"]},
    {"name": "sources_count", "label": "Minimum Sources Required", "type": "number", "required": false}
  ]'::jsonb,
  2,
  true
),

-- Package 3: Thesis Assistance (Premium tier)
(
  'thesis-assistance',
  'Thesis Assistance',
  'Complete thesis writing and editing support. From proposal to final defense, we guide you through every step of your thesis journey.',
  10000.00,
  '["Chapter-by-chapter development", "Research methodology support", "Statistical analysis assistance", "Unlimited revisions", "Direct mentor communication", "Defense preparation support", "Plagiarism check included"]'::jsonb,
  '[
    {"name": "chapter_count", "label": "Number of Chapters", "type": "number", "required": true},
    {"name": "degree_type", "label": "Degree Type", "type": "select", "required": true, "options": ["Masters", "PhD"]},
    {"name": "field_of_study", "label": "Field of Study", "type": "text", "required": true},
    {"name": "institution", "label": "University/Institution", "type": "text", "required": true},
    {"name": "has_proposal", "label": "Proposal Status", "type": "select", "required": true, "options": ["Not Started", "In Progress", "Approved"]}
  ]'::jsonb,
  3,
  true
),

-- Package 4: Editing & Proofreading (Add-on service)
(
  'editing-proofreading',
  'Editing & Proofreading',
  'Professional editing and proofreading service to polish your existing work. Perfect for self-written papers that need refinement.',
  800.00,
  '["Grammar and spelling correction", "Style and clarity improvements", "Formatting check", "24-hour turnaround", "Track changes document"]'::jsonb,
  '[
    {"name": "word_count", "label": "Word Count", "type": "number", "required": true},
    {"name": "document_type", "label": "Document Type", "type": "select", "required": true, "options": ["Essay", "Research Paper", "Thesis Chapter", "Dissertation", "Other"]},
    {"name": "editing_level", "label": "Editing Level", "type": "select", "required": true, "options": ["Basic (Grammar/Spelling)", "Standard (+ Style/Clarity)", "Comprehensive (+ Structure)"]}
  ]'::jsonb,
  4,
  true
);

-- ============================================
-- PAYMENT SETTINGS
-- Default payment configuration
-- ============================================

INSERT INTO payment_settings (
  downpayment_type,
  downpayment_value,
  minimum_downpayment,
  screenshot_required,
  reference_required,
  accepted_file_types
) VALUES (
  'percentage',
  50.00,  -- 50% downpayment required
  500.00, -- Minimum ₱500 downpayment
  true,   -- Screenshot required
  true,   -- Reference number required
  ARRAY['jpg', 'jpeg', 'png', 'pdf']
);

-- ============================================
-- PAYMENT METHODS
-- Available payment options
-- ============================================

INSERT INTO payment_methods (name, account_number, account_name, additional_instructions, display_order, is_enabled) VALUES
(
  'GCash',
  '09XX-XXX-XXXX',
  'Startpoint Academics',
  'Please include your name and project reference code in the message field.',
  1,
  true
),
(
  'Bank Transfer (BDO)',
  'XXXX-XXXX-XXXX',
  'Startpoint Academics Inc.',
  'Please upload your deposit slip or transfer confirmation.',
  2,
  true
),
(
  'Bank Transfer (BPI)',
  'XXXX-XXXX-XXXX',
  'Startpoint Academics Inc.',
  'Please upload your deposit slip or transfer confirmation.',
  3,
  true
),
(
  'PayMaya',
  '09XX-XXX-XXXX',
  'Startpoint Academics',
  'Please include your name in the payment notes.',
  4,
  true
);

-- ============================================
-- TEST USERS (Local Development Only)
-- Password for all users: password123
-- ============================================

-- Create test users in auth.users (local dev only)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
) VALUES
-- Admin User
(
  'a1111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'admin@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin User", "role": "admin"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
),
-- Writer 1
(
  'b1111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'writer@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "John Writer", "role": "writer"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
),
-- Writer 2
(
  'c2222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'writer2@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Jane Writer", "role": "writer"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
);

-- Create identities for the users (required for email login)
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
(
  'a1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  '{"sub": "a1111111-1111-1111-1111-111111111111", "email": "admin@test.com"}',
  'email',
  'admin@test.com',
  NOW(),
  NOW(),
  NOW()
),
(
  'b1111111-1111-1111-1111-111111111111',
  'b1111111-1111-1111-1111-111111111111',
  '{"sub": "b1111111-1111-1111-1111-111111111111", "email": "writer@test.com"}',
  'email',
  'writer@test.com',
  NOW(),
  NOW(),
  NOW()
),
(
  'c2222222-2222-2222-2222-222222222222',
  'c2222222-2222-2222-2222-222222222222',
  '{"sub": "c2222222-2222-2222-2222-222222222222", "email": "writer2@test.com"}',
  'email',
  'writer2@test.com',
  NOW(),
  NOW(),
  NOW()
);

-- ============================================
-- PROFILES (linked to auth users)
-- ============================================

INSERT INTO profiles (id, email, full_name, role, is_active, max_concurrent_projects) VALUES
('a1111111-1111-1111-1111-111111111111', 'admin@test.com', 'Admin User', 'admin', true, 0),
('b1111111-1111-1111-1111-111111111111', 'writer@test.com', 'John Writer', 'writer', true, 5),
('c2222222-2222-2222-2222-222222222222', 'writer2@test.com', 'Jane Writer', 'writer', true, 3);

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'writer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
