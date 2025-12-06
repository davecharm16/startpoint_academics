# Architecture

## Executive Summary

Startpoint Academics is a transparency-first academic writing services platform built on a modern, simplified stack. The architecture prioritizes **operational visibility**, **automated workflows**, and **risk mitigation** while maintaining simplicity through Supabase's all-in-one backend services.

**Core Philosophy:** Single Next.js application with role-based routing, powered by Supabase (PostgreSQL + Auth + Storage + Realtime). No over-engineering - every architectural decision was validated through First Principles analysis.

## Project Initialization

First implementation story should execute:
```bash
# Create Next.js app (use v14 for stability, or @latest for Next.js 15+)
npx create-next-app@14 startpoint-academics --typescript --tailwind --app --src-dir --import-alias "@/*"
```

Then initialize Supabase:
```bash
npx supabase init
npx supabase start
```

Install core dependencies:
```bash
# Supabase client (verified: v2.86.0 as of Nov 2024)
npm install @supabase/supabase-js @supabase/ssr

# shadcn/ui (note: CLI changed from shadcn-ui to shadcn)
npx shadcn@latest init

# Additional dependencies
npm install react-hook-form @hookform/resolvers zod
npm install date-fns
npm install @tanstack/react-query
npm install lucide-react
npm install use-debounce
```

## Decision Summary

| Category | Decision | Version | Affects | Rationale |
|----------|----------|---------|---------|-----------|
| Framework | Next.js (App Router) | 14.x | All | SSR for public pages, CSR for dashboards |
| UI Library | shadcn/ui + Tailwind | Latest | All | From UX spec, accessible, customizable |
| Backend | Supabase | Latest | All | All-in-one: DB + Auth + Storage + Realtime |
| Database | PostgreSQL (Supabase) | 15.x | All | Managed, RLS built-in |
| Auth | Supabase Auth | Latest | Admin, Writer | Email/password (Google OAuth post-MVP) |
| File Storage | Supabase Storage | Latest | Client, Admin | Payment screenshots, deliverables |
| Email | Resend | Latest | System | Transactional + digest notifications |
| Hosting | Vercel + Supabase | Latest | All | Optimized for Next.js |
| Form Library | React Hook Form + Zod | 7.x + 3.x | Client, Admin | Validation + auto-save support |
| State | TanStack Query | 5.x | All | Server state caching + background refetch |
| Date Handling | date-fns | 3.x | All | Tree-shakeable, immutable, TypeScript |
| Icons | Lucide React | Latest | All | shadcn/ui default, tree-shakeable |
| Scheduled Jobs | pg_cron + Edge Functions | N/A | System | Deadline warnings, digest emails |

## Project Structure

```
startpoint-academics/
├── src/
│   ├── app/
│   │   ├── (public)/                    # Public routes (no auth)
│   │   │   ├── page.tsx                 # Landing page
│   │   │   ├── packages/
│   │   │   │   └── [slug]/page.tsx      # Package detail
│   │   │   ├── submit/
│   │   │   │   └── [package]/page.tsx   # Intake form
│   │   │   └── track/
│   │   │       └── [token]/page.tsx     # Client tracking
│   │   │
│   │   ├── (auth)/                      # Auth-required routes
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx             # Admin dashboard
│   │   │   │   ├── projects/
│   │   │   │   │   └── [id]/page.tsx    # Project detail
│   │   │   │   ├── writers/page.tsx     # Writer management
│   │   │   │   ├── packages/page.tsx    # Package management
│   │   │   │   ├── payments/page.tsx    # Payment tracker
│   │   │   │   └── settings/page.tsx    # Payment config
│   │   │   │
│   │   │   └── writer/
│   │   │       ├── page.tsx             # Writer dashboard
│   │   │       └── projects/
│   │   │           └── [id]/page.tsx    # Assignment detail
│   │   │
│   │   ├── api/                         # API routes (if needed)
│   │   │   └── webhooks/
│   │   │       └── resend/route.ts      # Email webhooks
│   │   │
│   │   ├── auth/
│   │   │   ├── login/page.tsx           # Admin/Writer login
│   │   │   ├── callback/route.ts        # OAuth callback
│   │   │   └── verify/page.tsx          # Client verification
│   │   │
│   │   ├── layout.tsx                   # Root layout
│   │   └── globals.css                  # Global styles
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn/ui components
│   │   ├── forms/
│   │   │   ├── intake-form.tsx          # Client intake
│   │   │   └── package-form.tsx         # Admin package editor
│   │   ├── dashboard/
│   │   │   ├── stats-cards.tsx          # Metric cards
│   │   │   ├── project-table.tsx        # Projects list
│   │   │   └── at-risk-alerts.tsx       # Warning highlights
│   │   ├── tracking/
│   │   │   ├── status-stepper.tsx       # Progress indicator
│   │   │   └── timeline.tsx             # Event history
│   │   └── layout/
│   │       ├── admin-sidebar.tsx        # Admin navigation
│   │       ├── writer-nav.tsx           # Writer navigation
│   │       └── public-header.tsx        # Public header
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                # Browser client
│   │   │   ├── server.ts                # Server client
│   │   │   ├── middleware.ts            # Auth middleware
│   │   │   └── types.ts                 # Generated types
│   │   ├── email/
│   │   │   ├── resend.ts                # Resend client
│   │   │   └── templates/               # Email templates
│   │   ├── utils/
│   │   │   ├── reference-code.ts        # Generate SA-XXXX codes
│   │   │   ├── split-calculator.ts      # 60/40 calculation
│   │   │   └── date-utils.ts            # Date formatting
│   │   └── constants.ts                 # App constants
│   │
│   ├── hooks/
│   │   ├── use-projects.ts              # Project queries
│   │   ├── use-auto-save.ts             # Form draft saving
│   │   └── use-realtime.ts              # Supabase subscriptions
│   │
│   └── types/
│       ├── database.ts                  # Supabase generated
│       └── index.ts                     # App types
│
├── supabase/
│   ├── migrations/                      # Database migrations
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00002_rls_policies.sql
│   │   └── 00003_functions.sql
│   ├── seed.sql                         # Seed data
│   └── tests/                           # pgTAP RLS tests
│       ├── rls_projects.sql
│       └── rls_writers.sql
│
├── public/
│   └── images/                          # Static assets
│
├── .env.local                           # Environment variables
├── middleware.ts                        # Next.js middleware
└── package.json
```

## FR Category to Architecture Mapping

| FR Category | Routes | Components | Database Tables |
|-------------|--------|------------|-----------------|
| Client Intake (FR1-4, FR39, FR44, FR49) | `/packages/*`, `/submit/*` | intake-form, package-card | projects, packages, payment_proofs |
| Client Tracking (FR5-7, FR48) | `/track/*`, `/auth/verify` | status-stepper, timeline | projects, project_history |
| Writer Dashboard (FR9-15, FR50) | `/writer/*` | project-table, brief-view | projects, profiles |
| Admin Dashboard (FR16-28, FR35-38, FR46) | `/admin/*` | stats-cards, project-table, at-risk-alerts | projects, profiles, packages, payment_settings |
| Payment Validation (FR40-42, FR43, FR45) | `/admin/payments` | payment-validator | projects, payment_proofs, payment_methods |
| Notifications (FR8, FR15, FR30, FR47) | API routes | - | project_history (triggers) |
| System (FR29, FR31-34) | - | - | Database functions, RLS |

## Technology Stack Details

### Core Technologies

#### Next.js 14 (App Router)
- **Server Components** for public pages (landing, packages, tracking)
- **Client Components** for interactive dashboards
- **Route Groups** for organizing auth vs public routes
- **Middleware** for auth protection

#### Supabase
- **PostgreSQL** with Row Level Security
- **Auth** with email/password + Google OAuth
- **Storage** for payment screenshots and deliverables
- **Realtime** subscriptions for tracking page (MVP - delivers on transparency promise)
- **Edge Functions** for complex operations (optional)

#### shadcn/ui
- Pre-built accessible components
- Academic Trust theme customization
- Components: Button, Card, Input, Table, Dialog, Toast, Badge, Progress

### Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                         NEXT.JS APP                             │
│                    (Vercel Deployment)                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │  Supabase │   │  Resend   │   │  Google   │
    │           │   │           │   │   OAuth   │
    │ • DB      │   │ • Email   │   │           │
    │ • Auth    │   │ • Digest  │   │ • Client  │
    │ • Storage │   │           │   │   verify  │
    │ • Realtime│   │           │   │           │
    └───────────┘   └───────────┘   └───────────┘
```

## Data Architecture

### Core Tables

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('admin', 'writer')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  -- Writer workload management (from Stakeholder Mapping)
  max_concurrent_projects INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- View for writer workload (from Stakeholder Mapping - Admin need)
CREATE VIEW writer_workload AS
SELECT
  p.id,
  p.full_name,
  p.max_concurrent_projects,
  COUNT(pr.id) FILTER (WHERE pr.status IN ('assigned', 'in_progress', 'review')) AS current_projects,
  p.max_concurrent_projects - COUNT(pr.id) FILTER (WHERE pr.status IN ('assigned', 'in_progress', 'review')) AS available_slots
FROM profiles p
LEFT JOIN projects pr ON p.id = pr.writer_id
WHERE p.role = 'writer' AND p.is_active = true
GROUP BY p.id, p.full_name, p.max_concurrent_projects;

-- Service Packages
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  features JSONB DEFAULT '[]',
  required_fields JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (core entity)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT UNIQUE NOT NULL,  -- SA-2024-00001
  tracking_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),

  -- Client info (no auth required)
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  client_google_id TEXT,  -- For verified access

  -- Project details
  package_id UUID REFERENCES packages(id),
  agreed_price DECIMAL(10,2) NOT NULL,  -- Immutable snapshot
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
  -- Calculated shares (based on final amount after discounts/additions)
  -- final_amount = agreed_price - discount_amount + additional_charges
  writer_share DECIMAL(10,2) GENERATED ALWAYS AS ((agreed_price - COALESCE(discount_amount, 0) + COALESCE(additional_charges, 0)) * 0.6) STORED,
  admin_share DECIMAL(10,2) GENERATED ALWAYS AS ((agreed_price - COALESCE(discount_amount, 0) + COALESCE(additional_charges, 0)) * 0.4) STORED,

  -- Activity tracking (for abandonment detection)
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),

  -- Edge cases (from Devil's Advocate analysis)
  discount_amount DECIMAL(10,2) DEFAULT 0,
  additional_charges DECIMAL(10,2) DEFAULT 0,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,

  -- Estimated completion (from Stakeholder Mapping - Client need)
  estimated_completion_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Proofs (screenshots)
CREATE TABLE payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
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

-- Project History (audit log)
CREATE TABLE project_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  notes TEXT,
  performed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Settings (admin config)
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

-- Payment Methods
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
```

### Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to check writer role
CREATE OR REPLACE FUNCTION is_writer()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'writer'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admin can manage profiles" ON profiles
  FOR ALL USING (is_admin());

-- PROJECTS
CREATE POLICY "Admin full access to projects" ON projects
  FOR ALL USING (is_admin());

CREATE POLICY "Writers see assigned projects" ON projects
  FOR SELECT USING (writer_id = auth.uid());

CREATE POLICY "Writers update assigned projects" ON projects
  FOR UPDATE USING (writer_id = auth.uid())
  WITH CHECK (writer_id = auth.uid());

CREATE POLICY "Public tracking access" ON projects
  FOR SELECT USING (
    tracking_token::text = current_setting('app.tracking_token', true)
  );

CREATE POLICY "Public insert for submissions" ON projects
  FOR INSERT WITH CHECK (true);

-- PACKAGES (public read)
CREATE POLICY "Anyone can view active packages" ON packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manages packages" ON packages
  FOR ALL USING (is_admin());

-- PAYMENT PROOFS
CREATE POLICY "Admin manages payment proofs" ON payment_proofs
  FOR ALL USING (is_admin());

CREATE POLICY "Writers view proofs for their projects" ON payment_proofs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = payment_proofs.project_id
      AND projects.writer_id = auth.uid()
    )
  );

-- PAYMENT SETTINGS & METHODS (public read for form, admin write)
CREATE POLICY "Public read payment settings" ON payment_settings
  FOR SELECT USING (true);

CREATE POLICY "Admin manages payment settings" ON payment_settings
  FOR ALL USING (is_admin());

CREATE POLICY "Public read enabled payment methods" ON payment_methods
  FOR SELECT USING (is_enabled = true);

CREATE POLICY "Admin manages payment methods" ON payment_methods
  FOR ALL USING (is_admin());
```

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents:

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Database tables | snake_case, plural | `payment_methods`, `project_history` |
| Database columns | snake_case | `client_email`, `created_at` |
| TypeScript interfaces | PascalCase | `Project`, `PaymentMethod` |
| React components | PascalCase | `StatusStepper`, `IntakeForm` |
| Component files | kebab-case | `status-stepper.tsx`, `intake-form.tsx` |
| Utility functions | camelCase | `generateReferenceCode`, `calculateSplit` |
| API routes | kebab-case | `/api/webhooks/resend` |
| URL slugs | kebab-case | `/packages/essay-writing` |
| Environment variables | SCREAMING_SNAKE_CASE | `NEXT_PUBLIC_SUPABASE_URL` |

### API Response Format

```typescript
// Success response
{
  data: T,
  error: null
}

// Error response
{
  data: null,
  error: {
    message: string,
    code: string,
    details?: any
  }
}
```

### Error Handling

```typescript
// Use try-catch with specific error types
try {
  const { data, error } = await supabase.from('projects').insert(project);
  if (error) throw error;
  return { data, error: null };
} catch (error) {
  console.error('Failed to create project:', error);
  return {
    data: null,
    error: {
      message: 'Failed to create project',
      code: 'PROJECT_CREATE_FAILED'
    }
  };
}
```

### Date/Time Handling

- Store all dates as `TIMESTAMPTZ` in PostgreSQL
- Use ISO 8601 format in JSON: `2024-01-15T10:30:00Z`
- Display in user's local timezone using `date-fns` or `Intl.DateTimeFormat`
- Deadlines displayed as: "Jan 15, 2024 at 10:30 AM"

### Status Transitions

```typescript
const STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  submitted: ['pending_payment_validation'],
  pending_payment_validation: ['validated', 'rejected'],
  validated: ['assigned'],
  rejected: ['pending_payment_validation'], // Allow resubmission
  assigned: ['in_progress'],
  in_progress: ['review'],
  review: ['complete', 'in_progress'], // Allow revisions
  complete: ['paid'],
  paid: [], // Terminal state
};

function canTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}
```

### Form Auto-Save Pattern

```typescript
// hooks/use-auto-save.ts
const AUTOSAVE_CONFIG = {
  // Fields to NEVER save (privacy/security)
  excludeFields: ['payment_screenshot', 'client_phone', 'client_email'],
  // Drafts expire after 24 hours
  maxAge: 24 * 60 * 60 * 1000,
  // Prompt user before restoring
  promptRestore: true,
};

interface DraftData<T> {
  data: T;
  savedAt: number;
  packageSlug: string;
}

export function useAutoSave<T>(packageSlug: string, data: T, delay = 2000) {
  const key = `startpoint.intake.${packageSlug}`;

  const debouncedSave = useDebouncedCallback((value: T) => {
    // Filter out sensitive fields
    const safeData = Object.fromEntries(
      Object.entries(value as object).filter(
        ([k]) => !AUTOSAVE_CONFIG.excludeFields.includes(k)
      )
    );

    const draft: DraftData<T> = {
      data: safeData as T,
      savedAt: Date.now(),
      packageSlug,
    };
    localStorage.setItem(key, JSON.stringify(draft));
  }, delay);

  useEffect(() => {
    debouncedSave(data);
  }, [data, debouncedSave]);

  const clearDraft = () => localStorage.removeItem(key);

  const loadDraft = (): T | null => {
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    const draft: DraftData<T> = JSON.parse(saved);

    // Check if draft is expired
    if (Date.now() - draft.savedAt > AUTOSAVE_CONFIG.maxAge) {
      clearDraft();
      return null;
    }

    return draft.data;
  };

  const getDraftAge = (): string | null => {
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    const draft: DraftData<T> = JSON.parse(saved);
    return new Date(draft.savedAt).toLocaleString();
  };

  return { clearDraft, loadDraft, getDraftAge };
}
```

### Realtime Status Updates (Tracking Page)

```typescript
// hooks/use-realtime-project.ts
export function useRealtimeProject(trackingToken: string) {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchProject = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('tracking_token', trackingToken)
        .single();
      setProject(data);
    };
    fetchProject();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`project-${trackingToken}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: `tracking_token=eq.${trackingToken}`,
        },
        (payload) => {
          setProject(payload.new as Project);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trackingToken]);

  return project;
}
```

### Reference Code Generation

```typescript
// lib/utils/reference-code.ts
export async function generateReferenceCode(): Promise<string> {
  const year = new Date().getFullYear();

  // Get current count from database
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01`);

  const nextNumber = (count ?? 0) + 1;
  return `SA-${year}-${String(nextNumber).padStart(5, '0')}`;
}
// Output: SA-2024-00001, SA-2024-00002, etc.
```

## Security Architecture

### Authentication Flow

```
Admin/Writer Login:
Email + Password → Supabase Auth → Session Cookie → Protected Routes

Client Tracking (Level 1 - Public):
UUID Token in URL → RLS Policy → Limited Data Access
(Status, deadline, package only)

Client Tracking (Level 2 - Verified via PIN):
UUID Token + Last 4 digits of phone → Full Data Access
(Full brief, timeline, file downloads)

Future Enhancement (Post-MVP):
Google OAuth → Link to Project → Full Data Access + Client Portal
```

### Email Templates (from Stakeholder Mapping - FR55)

| Template | Trigger | Recipient | Content |
|----------|---------|-----------|---------|
| `submission-confirmation` | Project created | Client | Reference code, tracking link, payment instructions |
| `payment-validated` | Admin validates payment | Client | Confirmation, next steps, tracking link |
| `payment-rejected` | Admin rejects payment | Client | Reason, how to resubmit |
| `writer-assignment` | Project assigned | Writer | Project brief, deadline, accept link |
| `deadline-warning` | 48h before deadline | Writer + Admin | Project details, current status |
| `project-complete` | Writer marks complete | Client | Download link, final payment instructions |
| `admin-digest` | Daily (if enabled) | Admin | Summary of new submissions, pending validations, at-risk projects |

```typescript
// lib/email/templates/index.ts
export const EMAIL_TEMPLATES = {
  SUBMISSION_CONFIRMATION: 'submission-confirmation',
  PAYMENT_VALIDATED: 'payment-validated',
  PAYMENT_REJECTED: 'payment-rejected',
  WRITER_ASSIGNMENT: 'writer-assignment',
  DEADLINE_WARNING: 'deadline-warning',
  PROJECT_COMPLETE: 'project-complete',
  ADMIN_DIGEST: 'admin-digest',
} as const;
```

### Security Measures

| Measure | Implementation |
|---------|----------------|
| Auth tokens | Supabase handles JWT, httpOnly cookies |
| Password hashing | Supabase Auth (bcrypt) |
| SQL injection | Supabase client uses parameterized queries |
| XSS prevention | React's default escaping + CSP headers |
| CSRF protection | SameSite cookies |
| Rate limiting | Vercel Edge + Supabase built-in |
| File upload validation | Type checking, size limits, virus scan (future) |
| RLS | Database-level access control |

### RLS Testing Strategy

```sql
-- supabase/tests/rls_projects.sql
BEGIN;
SELECT plan(5);

-- Test 1: Writers can only see their assigned projects
SELECT tests.create_supabase_user('writer1');
SELECT tests.create_supabase_user('writer2');

-- Insert test projects
INSERT INTO projects (id, writer_id, ...) VALUES
  ('project-1', tests.get_supabase_uid('writer1'), ...),
  ('project-2', tests.get_supabase_uid('writer2'), ...);

-- Authenticate as writer1
SELECT tests.authenticate_as('writer1');

-- Should only see project-1
SELECT results_eq(
  'SELECT id FROM projects',
  ARRAY['project-1']::uuid[],
  'Writer can only see assigned projects'
);

SELECT * FROM finish();
ROLLBACK;
```

## Performance Considerations

### Database Indexing

```sql
-- Frequently queried columns
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_writer_id ON projects(writer_id);
CREATE INDEX idx_projects_deadline ON projects(deadline);
CREATE INDEX idx_projects_tracking_token ON projects(tracking_token);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_project_history_project_id ON project_history(project_id);

-- Composite indexes for common queries
CREATE INDEX idx_projects_writer_status ON projects(writer_id, status);
CREATE INDEX idx_projects_status_deadline ON projects(status, deadline);

-- Scheduled job for deadline warnings (pg_cron)
-- Runs every hour, finds projects due in 48h without "in_progress" status
SELECT cron.schedule(
  'deadline-warning-check',
  '0 * * * *', -- Every hour
  $$
    SELECT net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/deadline-warning',
      headers := '{"Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb,
      body := jsonb_build_object(
        'projects', (
          SELECT jsonb_agg(jsonb_build_object('id', id, 'reference_code', reference_code, 'deadline', deadline))
          FROM projects
          WHERE deadline BETWEEN NOW() AND NOW() + INTERVAL '48 hours'
          AND status NOT IN ('complete', 'paid', 'cancelled')
          AND NOT EXISTS (
            SELECT 1 FROM project_history
            WHERE project_id = projects.id AND action = 'deadline_warning_sent'
          )
        )
      )
    );
  $$
);

-- Profit summary view (from Stakeholder Mapping - Admin FR54)
CREATE VIEW profit_summary AS
SELECT
  DATE_TRUNC('week', created_at) AS period,
  'weekly' AS period_type,
  COUNT(*) AS total_projects,
  COUNT(*) FILTER (WHERE status = 'paid') AS paid_projects,
  SUM(agreed_price - COALESCE(discount_amount, 0) + COALESCE(additional_charges, 0)) FILTER (WHERE status = 'paid') AS total_revenue,
  SUM(writer_share) FILTER (WHERE status = 'paid') AS total_writer_payments,
  SUM(admin_share) FILTER (WHERE status = 'paid') AS total_profit
FROM projects
GROUP BY DATE_TRUNC('week', created_at)
UNION ALL
SELECT
  DATE_TRUNC('month', created_at) AS period,
  'monthly' AS period_type,
  COUNT(*) AS total_projects,
  COUNT(*) FILTER (WHERE status = 'paid') AS paid_projects,
  SUM(agreed_price - COALESCE(discount_amount, 0) + COALESCE(additional_charges, 0)) FILTER (WHERE status = 'paid') AS total_revenue,
  SUM(writer_share) FILTER (WHERE status = 'paid') AS total_writer_payments,
  SUM(admin_share) FILTER (WHERE status = 'paid') AS total_profit
FROM projects
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY period DESC;
```

### Caching Strategy

- **Static pages**: ISR for landing and package pages (revalidate: 3600)
- **Dashboard data**: React Query with 30s stale time
- **Package list**: Cache in React Query, invalidate on admin update
- **Tracking page**: No cache (always fresh status)

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         VERCEL                              │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Edge      │  │  Serverless │  │   Static    │        │
│  │  Middleware │  │  Functions  │  │   Assets    │        │
│  │             │  │             │  │             │        │
│  │  • Auth     │  │  • API      │  │  • Images   │        │
│  │  • Redirect │  │    Routes   │  │  • CSS/JS   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        SUPABASE                             │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  PostgreSQL │  │    Auth     │  │   Storage   │        │
│  │             │  │             │  │             │        │
│  │  • Tables   │  │  • Users    │  │  • Payment  │        │
│  │  • RLS      │  │  • Sessions │  │    Proofs   │        │
│  │  • Functions│  │  • OAuth    │  │  • Files    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Development Environment

### Prerequisites

- Node.js 18+
- npm or pnpm
- Docker (for local Supabase)
- Supabase CLI

### Setup Commands

```bash
# Clone and install
git clone <repo>
cd startpoint-academics
npm install

# Start local Supabase
npx supabase start

# Run migrations
npx supabase db reset

# Generate types
npx supabase gen types typescript --local > src/types/database.ts

# Start development server
npm run dev
```

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

RESEND_API_KEY=<your-resend-key>
RESEND_FROM_EMAIL=noreply@startpointacademics.com

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Architecture Decision Records (ADRs)

### ADR-001: Single Next.js App vs Separate Deployments
**Decision:** Single Next.js application with role-based routing
**Rationale:** First Principles analysis showed separate deployments add complexity without benefit at MVP scale. Route groups (`(public)`, `(auth)`) provide clean separation.

### ADR-002: Supabase vs Custom Backend
**Decision:** Supabase for all backend services
**Rationale:** Provides PostgreSQL, Auth, Storage, and Realtime in one platform. Eliminates need for separate services, reduces DevOps overhead.

### ADR-003: Client Auth Strategy
**Decision:** UUID tokens for basic access, optional Google OAuth for verified access
**Rationale:** Pre-mortem analysis identified privacy risks with shareable links. Tiered access (public/verified) balances convenience with security.

### ADR-004: Payment Validation Flow
**Decision:** Manual screenshot validation with reference codes
**Rationale:** Fits Philippine market (GCash, bank transfers). Pre-mortem research showed screenshots alone are fraud-prone; reference codes + amount verification mitigate risk.

### ADR-005: Notification Strategy
**Decision:** Priority-based notifications with optional digest batching
**Rationale:** Pre-mortem identified admin burnout risk. Critical events (payment pending, deadline risk) are immediate; routine updates can be batched.

### ADR-006: Form Data Persistence
**Decision:** Debounced localStorage auto-save for intake form with safeguards
**Rationale:** Pre-mortem identified form abandonment risk. Auto-save prevents data loss. Devil's Advocate added: exclude sensitive fields, 24h expiry, prompt before restore.

### ADR-007: Client Verification Method (MVP)
**Decision:** PIN verification (last 4 digits of phone) instead of Google OAuth
**Rationale:** Devil's Advocate analysis showed Google OAuth adds complexity for edge case. PIN is simpler, works for all users, no OAuth setup needed. Google OAuth deferred to post-MVP for optional client portal.

### ADR-008: Realtime for Tracking Page
**Decision:** Use Supabase Realtime subscriptions for client tracking page
**Rationale:** Devil's Advocate pointed out that "always know where your project stands" (core value prop) requires real-time updates, not manual refresh. Supabase Realtime is free and simple to implement.

### ADR-009: Payment Edge Cases
**Decision:** Add discount_amount, additional_charges, cancellation columns to projects table
**Rationale:** Devil's Advocate identified missing edge cases: cancellations, discounts, revision charges. 60/40 split now calculated on final_amount (agreed_price - discount + additional_charges).

### ADR-010: Writer Workload Management
**Decision:** Add max_concurrent_projects to profiles, create writer_workload view
**Rationale:** Stakeholder Mapping identified Admin need to see writer availability before assignment. View calculates current vs max projects automatically.

### ADR-011: Estimated Completion Date
**Decision:** Add estimated_completion_at field to projects (optional, set by writer)
**Rationale:** Stakeholder Mapping revealed Clients want to know not just deadline but expected delivery. Writers can set estimate after reviewing brief.

### ADR-012: Profit Summary Reporting
**Decision:** Create profit_summary database view for weekly/monthly reports
**Rationale:** Stakeholder Mapping confirmed Admin need (FR26) for profit summaries. Database view ensures consistent calculations across UI.

### ADR-013: Email Template Strategy
**Decision:** Define 7 transactional email templates triggered by status changes
**Rationale:** Stakeholder Mapping identified all notification touchpoints. Templates ensure consistent communication across all stakeholders.

### ADR-014: Form Validation Stack
**Decision:** React Hook Form + Zod for all forms
**Rationale:** Best performance (uncontrolled components), type-safe schema validation, integrates well with shadcn/ui and auto-save pattern.

### ADR-015: Date/Time Library
**Decision:** date-fns for all date manipulation and formatting
**Rationale:** Tree-shakeable (small bundle), immutable, excellent TypeScript support, standard in React ecosystem.

### ADR-016: Server State Management
**Decision:** TanStack Query (React Query) for server state
**Rationale:** Handles caching, background refetching, optimistic updates. Works alongside Supabase Realtime subscriptions without conflict.

### ADR-017: Scheduled Jobs
**Decision:** pg_cron + Supabase Edge Functions for scheduled tasks
**Rationale:** No external service needed. pg_cron schedules checks, Edge Functions execute (e.g., deadline warnings, digest emails).

---

## Validation Summary

### Document Quality Score

- **Architecture Completeness:** Complete
- **Version Specificity:** All Verified (Nov 2024)
- **Pattern Clarity:** Crystal Clear
- **AI Agent Readiness:** Ready

### Critical Issues Found

N/A - All critical decisions made and documented.

### Recommended Actions Before Implementation

1. Run `implementation-readiness` workflow to validate PRD → Architecture alignment
2. Create epics and stories from PRD before starting development
3. Set up Supabase project and run initial migrations
4. Configure Resend account for transactional emails

---

_Generated by BMAD Decision Architecture Workflow v1.0_
_Date: 2024-11-30_
_For: Dave_
_Elicitation Methods Used: Journey Mapping, First Principles, Pre-mortem Analysis, Devil's Advocate, Stakeholder Mapping_
