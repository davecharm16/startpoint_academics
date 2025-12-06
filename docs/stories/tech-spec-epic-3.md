# Epic 3: Admin Operations Core - Technical Specification

**Epic:** Admin Operations Core
**Points:** 43 (11 stories)
**Dependencies:** Epic 1 (Foundation), Epic 2 (Client Submission)

---

## Overview

This epic implements the complete admin dashboard and operations capabilities, including authentication, project management, writer assignment, package management, payment validation, and settings configuration.

---

## Technical Architecture

### File Structure

```
src/
├── app/
│   ├── auth/
│   │   └── login/
│   │       └── page.tsx            # Login page (shared)
│   └── (auth)/
│       └── admin/
│           ├── layout.tsx          # Admin layout with sidebar
│           ├── page.tsx            # Dashboard home
│           ├── projects/
│           │   ├── page.tsx        # Projects list
│           │   └── [id]/
│           │       └── page.tsx    # Project detail
│           ├── writers/
│           │   └── page.tsx        # Writer roster
│           ├── packages/
│           │   └── page.tsx        # Package management
│           ├── payments/
│           │   └── page.tsx        # Payment tracker
│           └── settings/
│               └── page.tsx        # Payment settings
├── components/
│   ├── layout/
│   │   └── admin-sidebar.tsx
│   ├── dashboard/
│   │   ├── stats-cards.tsx
│   │   ├── recent-projects.tsx
│   │   └── at-risk-alerts.tsx
│   ├── admin/
│   │   ├── project-table.tsx
│   │   ├── project-detail.tsx
│   │   ├── writer-assignment-dialog.tsx
│   │   ├── payment-validation.tsx
│   │   ├── writer-table.tsx
│   │   └── package-form.tsx
│   └── forms/
│       └── settings-form.tsx
├── lib/
│   └── auth/
│       └── require-admin.ts
└── middleware.ts                    # Route protection
```

### Database Tables Used

- `profiles` - Admin/writer user data
- `projects` - Project records
- `project_history` - Audit trail
- `payment_proofs` - Payment validation
- `packages` - Package management
- `payment_settings` - Payment configuration
- `payment_methods` - Payment options
- `writer_workload` (view) - Writer availability

---

## Story Implementation Details

### Story 3.1: Admin Authentication (3 pts)

**Files to Create:**
- `src/app/auth/login/page.tsx`
- `src/middleware.ts`
- `src/lib/auth/require-admin.ts`

**Implementation:**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = await createMiddlewareClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) return redirect('/auth/login');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') return redirect('/unauthorized');
  }
}
```

**Acceptance Verification:**
- [ ] Login page renders with email/password form
- [ ] Successful login redirects to /admin
- [ ] Unauthenticated /admin access redirects to login
- [ ] Non-admin users see unauthorized error

---

### Story 3.2: Admin Dashboard Layout (3 pts)

**Files to Create:**
- `src/app/(auth)/admin/layout.tsx`
- `src/components/layout/admin-sidebar.tsx`

**Sidebar Navigation:**
```typescript
const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/projects', label: 'Projects', icon: FileText },
  { href: '/admin/writers', label: 'Writers', icon: Users },
  { href: '/admin/packages', label: 'Packages', icon: Package },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];
```

**Acceptance Verification:**
- [ ] Sidebar shows navigation links
- [ ] Mobile view collapses to hamburger menu
- [ ] User name/avatar displayed
- [ ] Logout functionality works

---

### Story 3.3: Admin Dashboard Home (5 pts)

**Files to Create:**
- `src/app/(auth)/admin/page.tsx`
- `src/components/dashboard/stats-cards.tsx`
- `src/components/dashboard/recent-projects.tsx`
- `src/components/dashboard/at-risk-alerts.tsx`

**Stats Cards:**
- Total Projects (all time)
- In Progress (current)
- Pending Validation (waiting payment)
- This Month Revenue (sum of agreed_price)

**At-Risk Logic:**
```typescript
// Projects at risk: no updates + deadline within 48h
const atRiskProjects = projects.filter(p => {
  const hoursTillDeadline = differenceInHours(
    new Date(p.deadline),
    new Date()
  );
  return hoursTillDeadline <= 48 &&
    !['complete', 'paid', 'cancelled'].includes(p.status);
});
```

**Acceptance Verification:**
- [ ] Stats cards show correct counts
- [ ] Recent projects list displays
- [ ] At-risk projects highlighted

---

### Story 3.4: Projects List View (5 pts)

**Files to Create:**
- `src/app/(auth)/admin/projects/page.tsx`
- `src/components/admin/project-table.tsx`

**Table Columns:**
| Column | Field | Format |
|--------|-------|--------|
| Reference | reference_code | Link |
| Client | client_name | Text |
| Package | package.name | Text |
| Status | status | Badge |
| Writer | profile.full_name | Text/Empty |
| Deadline | deadline | Date |
| Amount | agreed_price | Currency |

**Filters:**
- Status dropdown
- Writer dropdown
- Package dropdown
- Date range picker

**Acceptance Verification:**
- [ ] Table displays all projects
- [ ] Filters work correctly
- [ ] Click navigates to detail page
- [ ] Status badges styled per UX spec

---

### Story 3.5: Project Detail & Audit History (3 pts)

**Files to Create:**
- `src/app/(auth)/admin/projects/[id]/page.tsx`

**Sections:**
1. Project Header (reference, status badge, actions)
2. Client Information
3. Project Details (topic, deadline, requirements)
4. Payment Information
5. Timeline (project_history)

**Acceptance Verification:**
- [ ] All project fields displayed
- [ ] Payment proof visible with validation buttons
- [ ] Timeline shows all history entries

---

### Story 3.6: Writer Assignment (3 pts)

**Files to Create:**
- `src/components/admin/writer-assignment-dialog.tsx`

**Implementation:**
- Dialog with writer list
- Show workload (current/max projects)
- Highlight available writers
- Create audit log entry on assign

**Acceptance Verification:**
- [ ] Dialog opens from project detail
- [ ] Writers show with workload
- [ ] Assignment updates project
- [ ] Reassignment works

---

### Story 3.7: Package Management (5 pts)

**Files to Create:**
- `src/app/(auth)/admin/packages/page.tsx`
- `src/components/admin/package-form.tsx`

**Package Form Fields:**
- name (required)
- slug (auto-generated, unique)
- description
- price (PHP number)
- features (JSONB array)
- required_fields (JSONB array)
- is_active (toggle)
- display_order (number)

**Acceptance Verification:**
- [ ] Package list displays
- [ ] Create new package works
- [ ] Edit package works
- [ ] Price changes don't affect existing projects

---

### Story 3.8: Payment Validation Workflow (5 pts)

**Files to Create:**
- `src/components/admin/payment-validation.tsx`

**Workflow:**
1. Display screenshot from storage
2. Show claimed amount
3. Validate or Reject buttons
4. Reject requires reason

**Status Changes:**
- Validate: `payment_proofs.validated = true`, `project.status = 'validated'`
- Reject: `payment_proofs.rejection_reason = reason`, `project.status = 'rejected'`

**Acceptance Verification:**
- [ ] Screenshot displays correctly
- [ ] Validate updates status
- [ ] Reject requires reason
- [ ] Audit log updated

---

### Story 3.9: Payment Settings Configuration (3 pts)

**Files to Create:**
- `src/app/(auth)/admin/settings/page.tsx`

**Settings:**
- downpayment_type: "percentage" | "fixed"
- downpayment_value: number
- screenshot_required: boolean
- reference_required: boolean

**Acceptance Verification:**
- [ ] Settings form displays current values
- [ ] Changes save successfully
- [ ] New submissions use new settings

---

### Story 3.10: Payment Methods Management (3 pts)

**Implementation in settings page:**
- List of payment methods
- Add/edit/toggle methods
- Account details per method

**Fields:**
- name
- account_name
- account_number
- is_enabled
- display_order

**Acceptance Verification:**
- [ ] Methods list displays
- [ ] Add new method works
- [ ] Toggle enable/disable works
- [ ] Order affects display

---

### Story 3.11: Writer Roster Management (5 pts)

**Files to Create:**
- `src/app/(auth)/admin/writers/page.tsx`
- `src/components/admin/writer-table.tsx`

**Writer Display:**
- Name, email, phone
- Current projects / max_concurrent_projects
- is_active status
- Actions: Edit, Deactivate

**Add Writer:**
- Uses Supabase Auth admin API
- Creates profile with role='writer'

**Acceptance Verification:**
- [ ] Writer list displays with workload
- [ ] Add new writer works
- [ ] Edit settings works
- [ ] Deactivate sets is_active = false

---

## Shared Components

### Status Badge Colors

```typescript
const STATUS_COLORS = {
  submitted: 'bg-gray-100 text-gray-800',
  validated: 'bg-blue-100 text-blue-800',
  assigned: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  review: 'bg-orange-100 text-orange-800',
  complete: 'bg-green-100 text-green-800',
  paid: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
};
```

---

## Testing Checklist

- [ ] Admin login flow
- [ ] Route protection for /admin/*
- [ ] Dashboard stats accuracy
- [ ] Project filtering
- [ ] Writer assignment
- [ ] Payment validation
- [ ] Package CRUD
- [ ] Settings persistence
