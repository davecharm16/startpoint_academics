# Startpoint Academics - Epic Breakdown

**Author:** Dave
**Date:** 2024-11-30
**Project Level:** MVP
**Target Scale:** 50-200 concurrent users, 100-500 active projects

---

## Overview

This document provides the complete epic and story breakdown for Startpoint Academics, decomposing the requirements from the [PRD](./prd.md) into implementable stories.

**Context Incorporated:**
- ✅ PRD (55 functional requirements)
- ✅ UX Design (shadcn/ui, Academic Trust theme, component patterns)
- ✅ Architecture (Next.js 14 + Supabase + React Hook Form + TanStack Query)

---

## Functional Requirements Inventory

### Client-Facing Capabilities
| FR | Description | Source |
|----|-------------|--------|
| FR1 | Visitors can view landing page with services, packages, pricing without registration | PRD |
| FR2 | Visitors can access individual package detail pages via shareable URLs | PRD |
| FR3 | Visitors can select a package and proceed to intake form | PRD |
| FR4 | Clients can complete dynamic intake form (topic, deadline, outputs, instructions, contact, package fields) | PRD |
| FR5 | Clients receive confirmation with unique project tracking link after submission | PRD |
| FR6 | Clients can view project status (Submitted → Assigned → In Progress → Review → Complete) via tracking link | PRD |
| FR7 | Clients can access delivered files through tracking page | PRD |
| FR8 | Clients receive email notifications at key status changes | PRD |
| FR39 | Clients must upload payment screenshot as part of intake submission | Journey Mapping |
| FR44 | Client enters "amount paid" field alongside screenshot | Pre-mortem |
| FR48 | Tracking page shows minimal info (public); full details require PIN verification | Pre-mortem |
| FR49 | Form auto-saves draft to localStorage (excludes sensitive fields, 24h expiry) | Pre-mortem |

### Writer Capabilities
| FR | Description | Source |
|----|-------------|--------|
| FR9 | Writers can log in to secure writer dashboard | PRD |
| FR10 | Writers can view all projects assigned to them with status indicators | PRD |
| FR11 | Writers can view complete client briefs including all intake form responses | PRD |
| FR12 | Writers can update project status (In Progress, Review, Complete) | PRD |
| FR13 | Writers can add notes/updates to projects visible to admin | PRD |
| FR14 | Writers can see project deadlines and sort/filter by urgency | PRD |
| FR15 | Writers receive notifications when new projects are assigned | PRD |
| FR50 | Writer dashboard shows earnings breakdown per project | Pre-mortem |
| FR51 | Projects have optional estimated_completion_at field set by writer | Stakeholder |

### Admin Capabilities
| FR | Description | Source |
|----|-------------|--------|
| FR16 | Admin can log in to secure admin dashboard | PRD |
| FR17 | Admin can view all projects across all statuses in unified view | PRD |
| FR18 | Admin can view and manage writer roster | PRD |
| FR19 | Admin can assign projects to writers manually | PRD |
| FR20 | Admin can reassign projects between writers | PRD |
| FR21 | Admin can view individual project details and full audit history | PRD |
| FR22 | Admin can create and manage package definitions | PRD |
| FR23 | Admin can update package pricing without developer intervention | PRD |
| FR24 | Admin can view payment tracker (project, price, writer 60%, admin 40%) | PRD |
| FR25 | Admin can mark projects as paid/settled | PRD |
| FR26 | Admin can view weekly/monthly profit summaries | PRD |
| FR27 | Admin can filter projects by date range, status, writer, package | PRD |
| FR28 | Admin can export project and payment data (CSV) | PRD |
| FR35 | Admin can configure downpayment structure (percentage or fixed) | Journey Mapping |
| FR36 | Admin can manage payment methods (GCash, bank) with account details | Journey Mapping |
| FR37 | Admin can toggle required fields for payment (screenshot, reference) | Journey Mapping |
| FR40 | Admin receives notification when new submission awaits payment validation | Journey Mapping |
| FR41 | Admin can validate or reject payment screenshots | Journey Mapping |
| FR46 | Dashboard highlights "at risk" projects (no updates + deadline approaching) | Pre-mortem |
| FR52 | Writer profiles have max_concurrent_projects setting | Stakeholder |
| FR53 | Admin dashboard shows writer workload (current/max projects) | Stakeholder |
| FR54 | Admin can view weekly/monthly profit summary report | Stakeholder |

### System Capabilities
| FR | Description | Source |
|----|-------------|--------|
| FR29 | System generates unique, non-guessable URLs for client tracking links | PRD |
| FR30 | System sends email notifications at configurable trigger points | PRD |
| FR31 | System calculates 60/40 split automatically when project marked complete | PRD |
| FR32 | System maintains audit log of all status changes with timestamps | PRD |
| FR33 | System validates intake form submissions for completeness before accepting | PRD |
| FR34 | System displays package information from database (not hardcoded) | PRD |
| FR38 | Client intake form dynamically displays payment settings from admin config | Journey Mapping |
| FR42 | Rejected payments notify client with reason and allow resubmission | Journey Mapping |
| FR43 | System generates unique reference code per submission for payment matching | Pre-mortem |
| FR45 | Store agreed_price immutably at project creation | Pre-mortem |
| FR47 | Automated email alert 48h before deadline if project not "In Progress" | Pre-mortem |
| FR55 | System sends 7 transactional email types (confirmation, validation, assignment, warning, completion, rejection, digest) | Stakeholder |

**Total: 55 Functional Requirements**

---

## FR Coverage Map

| Epic | Title | FRs Covered | User Value |
|------|-------|-------------|------------|
| **Epic 1** | Foundation & Public Pages | FR1, FR2, FR3, FR34 | Visitors can browse services and packages |
| **Epic 2** | Client Submission Flow | FR4, FR5, FR29, FR33, FR38, FR39, FR43, FR44, FR45, FR49 | Clients can submit projects with payment |
| **Epic 3** | Admin Operations Core | FR16, FR17, FR19, FR20, FR21, FR22, FR23, FR27, FR32, FR35, FR36, FR37, FR40, FR41, FR42, FR46, FR52, FR53 | Admin can manage all operations |
| **Epic 4** | Writer Workspace | FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR50, FR51 | Writers can manage assignments |
| **Epic 5** | Client Tracking & Delivery | FR6, FR7, FR8, FR48 | Clients can track and receive work |
| **Epic 6** | Payments & Reporting | FR18, FR24, FR25, FR26, FR28, FR31, FR54 | Admin can track finances |
| **Epic 7** | Notifications & Automation | FR30, FR47, FR55 | System sends timely alerts |

**Epic Sequencing Rationale:**
1. **Foundation** - Must come first (greenfield setup)
2. **Client Submission** - Core intake flow (business can start accepting projects)
3. **Admin Operations** - Admin can manage incoming projects
4. **Writer Workspace** - Writers can work on assigned projects
5. **Client Tracking** - Clients can see progress (completes the loop)
6. **Payments & Reporting** - Financial tracking and settlements
7. **Notifications** - Automated communications (enhancement)

---

## Epic 1: Foundation & Public Pages

**Goal:** Establish the project infrastructure and create public-facing pages that allow visitors to browse services and packages without registration.

**FRs Covered:** FR1, FR2, FR3, FR34

**Dependencies:** None (greenfield)

**Acceptance Criteria:**
- Project runs locally with Next.js 14 + Supabase
- Landing page displays dynamic packages from database
- Package detail pages accessible via shareable URLs
- Academic Trust theme (Navy #1e3a5f + Gold #d4a853) applied

---

### Story 1.1: Project Infrastructure Setup

**As a** developer
**I want** the project initialized with all required dependencies
**So that** development can begin with consistent tooling

**Acceptance Criteria:**
```gherkin
Given I clone the repository
When I run npm install && npm run dev
Then the application starts on localhost:3000
And Supabase local instance is accessible

Given the project is initialized
When I check the dependencies
Then Next.js 14, Supabase clients, shadcn/ui, React Hook Form, Zod, TanStack Query, date-fns, and Lucide React are installed

Given shadcn/ui is initialized
When I check the theme configuration
Then Academic Trust colors are configured (Navy #1e3a5f, Gold #d4a853)
```

**Technical Notes:**
- Use `npx create-next-app@14 startpoint-academics --typescript --tailwind --app --src-dir --import-alias "@/*"`
- Initialize Supabase with `npx supabase init && npx supabase start`
- Install: @supabase/supabase-js, @supabase/ssr, react-hook-form, @hookform/resolvers, zod, @tanstack/react-query, date-fns, lucide-react, use-debounce
- Initialize shadcn/ui with `npx shadcn@latest init`
- Configure tailwind.config.js with Academic Trust theme colors
- Create project structure per architecture doc

**Story Points:** 3

---

### Story 1.2: Database Schema & Initial Migrations

**As a** developer
**I want** the core database schema created
**So that** the application has data persistence

**Acceptance Criteria:**
```gherkin
Given Supabase is running
When I run database migrations
Then profiles, packages, projects, payment_proofs, project_history, payment_settings, payment_methods tables exist

Given the schema is applied
When I check table constraints
Then all CHECK constraints, foreign keys, and indexes are properly created

Given RLS is enabled
When I query packages as anonymous user
Then only active packages are visible
```

**Technical Notes:**
- Create migration: `supabase/migrations/00001_initial_schema.sql`
- Include all tables from architecture doc
- Create helper functions: is_admin(), is_writer()
- Create views: writer_workload, profit_summary
- Add indexes for frequently queried columns
- Create seed data with sample packages

**Story Points:** 5

---

### Story 1.3: Supabase Client & Type Generation

**As a** developer
**I want** typed Supabase clients for browser and server
**So that** database operations are type-safe

**Acceptance Criteria:**
```gherkin
Given the schema is deployed
When I run type generation
Then src/types/database.ts contains accurate TypeScript types

Given I import the Supabase client
When I make a database query
Then I get full TypeScript autocomplete and type checking
```

**Technical Notes:**
- Create `src/lib/supabase/client.ts` (browser client)
- Create `src/lib/supabase/server.ts` (server client)
- Create `src/lib/supabase/middleware.ts` (auth middleware)
- Run `npx supabase gen types typescript --local > src/types/database.ts`
- Create utility types in `src/types/index.ts`

**Story Points:** 2

---

### Story 1.4: Layout Components & Navigation

**As a** visitor
**I want** consistent navigation across public pages
**So that** I can easily explore the site

**Acceptance Criteria:**
```gherkin
Given I visit any public page
When the page loads
Then I see a header with logo and navigation links

Given I am on mobile
When I view the header
Then navigation collapses to a hamburger menu

Given I click "Get Started"
When the button is pressed
Then I am navigated to the packages section
```

**Technical Notes:**
- Create `src/components/layout/public-header.tsx`
- Create `src/app/layout.tsx` with providers (QueryClient, etc.)
- Create `src/app/(public)/layout.tsx` for public routes
- Use shadcn/ui Button, Sheet components
- Apply Academic Trust colors to header

**Story Points:** 3

---

### Story 1.5: Landing Page

**As a** visitor
**I want** to view the landing page with services and pricing
**So that** I can understand what Startpoint Academics offers

**Acceptance Criteria:**
```gherkin
Given I visit the homepage
When the page loads
Then I see a hero section with headline and CTA
And I see package cards with pricing
And I see trust signals (testimonials/guarantees)

Given packages exist in the database
When the landing page loads
Then packages are fetched dynamically (not hardcoded)
And packages are sorted by display_order

Given I click a package "Get Started" button
When the button is pressed
Then I am navigated to /packages/[slug]
```

**Technical Notes:**
- Create `src/app/(public)/page.tsx`
- Create `src/components/marketing/hero-section.tsx`
- Create `src/components/marketing/package-card.tsx`
- Create `src/components/marketing/trust-signals.tsx`
- Use Server Components for initial data fetch
- Apply ISR with revalidate: 3600

**Story Points:** 5

---

### Story 1.6: Package Detail Pages

**As a** visitor
**I want** to view detailed package information via shareable URLs
**So that** I can make an informed decision and share with others

**Acceptance Criteria:**
```gherkin
Given I visit /packages/[slug]
When the package exists
Then I see package name, description, price, and features
And I see a prominent "Get Started" CTA

Given I visit /packages/[slug]
When the package does not exist
Then I see a 404 page with helpful navigation

Given I copy the package URL
When I share it with someone
Then they can view the same package without registration
```

**Technical Notes:**
- Create `src/app/(public)/packages/[slug]/page.tsx`
- Generate static params for known packages
- Use generateMetadata for SEO/sharing
- Create package detail component with feature list
- Add "Get Started" button linking to intake form

**Story Points:** 3

---

## Epic 2: Client Submission Flow

**Goal:** Enable clients to submit projects with complete briefs, payment information, and receive tracking links.

**FRs Covered:** FR4, FR5, FR29, FR33, FR38, FR39, FR43, FR44, FR45, FR49

**Dependencies:** Epic 1 (Foundation)

**Acceptance Criteria:**
- Dynamic intake form captures all required information
- Payment screenshot upload with amount field
- Reference code generated on submission
- Tracking link provided to client
- Form auto-saves with privacy protections

---

### Story 2.1: Intake Form Foundation

**As a** client
**I want** to fill out a project intake form
**So that** I can submit my academic writing request

**Acceptance Criteria:**
```gherkin
Given I select a package and click "Get Started"
When I land on /submit/[package]
Then I see a multi-step intake form
And the form shows the selected package details

Given I start filling the form
When I enter topic, deadline, and requirements
Then the form validates input in real-time
And required fields are clearly marked
```

**Technical Notes:**
- Create `src/app/(public)/submit/[package]/page.tsx`
- Create `src/components/forms/intake-form.tsx`
- Use React Hook Form with Zod schema
- Implement multi-step form with progress indicator
- Steps: Project Details → Instructions → Contact → Payment

**Story Points:** 5

---

### Story 2.2: Dynamic Package Fields

**As a** client
**I want** the intake form to show package-specific fields
**So that** I provide all information needed for my chosen package

**Acceptance Criteria:**
```gherkin
Given a package has required_fields configured
When I view the intake form for that package
Then I see those additional fields in the form

Given a package requires "page_count"
When I fill the form
Then page count is required for submission
```

**Technical Notes:**
- Read package.required_fields from database
- Dynamically render additional form fields
- Add Zod validation for dynamic fields
- Store responses in project.requirements as structured JSON

**Story Points:** 3

---

### Story 2.3: Payment Information Collection

**As a** client
**I want** to see payment instructions and upload proof
**So that** my project can be validated and started

**Acceptance Criteria:**
```gherkin
Given payment_settings are configured by admin
When I reach the payment step
Then I see downpayment amount calculated correctly
And I see enabled payment methods with account details

Given screenshot_required is true
When I try to submit without a screenshot
Then form validation prevents submission

Given I upload a payment screenshot
When I enter the amount paid
Then both are captured for admin validation
```

**Technical Notes:**
- Create payment step in intake form
- Fetch payment_settings and payment_methods
- Calculate downpayment (percentage or fixed)
- Create file upload component for screenshots
- Store in Supabase Storage (payment-proofs bucket)
- Save to payment_proofs table

**Story Points:** 5

---

### Story 2.4: Form Auto-Save

**As a** client
**I want** my form progress to be saved automatically
**So that** I don't lose my work if I navigate away

**Acceptance Criteria:**
```gherkin
Given I am filling the intake form
When I pause typing for 2 seconds
Then non-sensitive fields are saved to localStorage

Given I have a saved draft
When I return to the form within 24 hours
Then I am prompted to restore my draft

Given my draft is older than 24 hours
When I return to the form
Then the expired draft is deleted
And I start fresh
```

**Technical Notes:**
- Create `src/hooks/use-auto-save.ts` per architecture pattern
- Exclude: payment_screenshot, client_phone, client_email
- Use use-debounce for 2-second delay
- Store with package slug as key
- Prompt user before restoring

**Story Points:** 3

---

### Story 2.5: Project Submission & Reference Code

**As a** client
**I want** to receive a confirmation with tracking link
**So that** I can track my project status

**Acceptance Criteria:**
```gherkin
Given I complete and submit the intake form
When submission succeeds
Then a unique reference code is generated (SA-YYYY-NNNNN)
And a tracking_token UUID is generated
And agreed_price is immutably stored

Given submission succeeds
When I see the confirmation page
Then I see my reference code
And I see my tracking link
And I receive a confirmation email
```

**Technical Notes:**
- Create `src/lib/utils/reference-code.ts`
- Insert project with status 'submitted'
- Create payment_proofs record if screenshot uploaded
- Create project_history entry
- Show success page with tracking link
- Clear localStorage draft on success

**Story Points:** 5

---

### Story 2.6: Submission Validation

**As a** system
**I want** to validate all required fields before accepting
**So that** writers receive complete briefs

**Acceptance Criteria:**
```gherkin
Given I attempt to submit an incomplete form
When required fields are missing
Then I see inline validation errors
And submission is blocked

Given the deadline is in the past
When I try to submit
Then I see an error about invalid deadline

Given all validations pass
When I submit
Then the project is created successfully
```

**Technical Notes:**
- Create comprehensive Zod schema
- Validate deadline is future date
- Validate email format
- Validate phone format (Philippine mobile)
- Validate file types for screenshot
- Server-side validation as backup

**Story Points:** 2

---

## Epic 3: Admin Operations Core

**Goal:** Enable admin to manage all operations including projects, writers, packages, and payment validation.

**FRs Covered:** FR16, FR17, FR19, FR20, FR21, FR22, FR23, FR27, FR32, FR35, FR36, FR37, FR40, FR41, FR42, FR46, FR52, FR53

**Dependencies:** Epic 1 (Foundation), Epic 2 (Client Submission)

**Acceptance Criteria:**
- Secure admin login
- Dashboard with all projects and key metrics
- Writer assignment and reassignment
- Package management (CRUD)
- Payment validation workflow
- Payment settings configuration
- At-risk project highlighting

---

### Story 3.1: Admin Authentication

**As an** admin
**I want** to log in securely
**So that** I can access the admin dashboard

**Acceptance Criteria:**
```gherkin
Given I visit /auth/login
When I enter valid admin credentials
Then I am redirected to /admin
And a secure session is created

Given I am not logged in
When I try to access /admin/*
Then I am redirected to /auth/login

Given I am logged in as non-admin
When I try to access /admin/*
Then I see an unauthorized error
```

**Technical Notes:**
- Create `src/app/auth/login/page.tsx`
- Create `src/middleware.ts` for route protection
- Use Supabase Auth with email/password
- Check profile.role === 'admin' for access
- Create admin user in seed data

**Story Points:** 3

---

### Story 3.2: Admin Dashboard Layout

**As an** admin
**I want** a persistent sidebar navigation
**So that** I can quickly access all admin sections

**Acceptance Criteria:**
```gherkin
Given I am logged in as admin
When I view the dashboard
Then I see a left sidebar with navigation links
And I see my name/avatar in the sidebar

Given I am on mobile
When I view the dashboard
Then the sidebar collapses to a hamburger menu
```

**Technical Notes:**
- Create `src/app/(auth)/admin/layout.tsx`
- Create `src/components/layout/admin-sidebar.tsx`
- Sections: Dashboard, Projects, Writers, Packages, Payments, Settings
- Use shadcn/ui Sheet for mobile
- Apply Academic Trust colors

**Story Points:** 3

---

### Story 3.3: Admin Dashboard Home

**As an** admin
**I want** to see business health at a glance
**So that** I can quickly assess operations

**Acceptance Criteria:**
```gherkin
Given I visit /admin
When the dashboard loads
Then I see stat cards: Total Projects, In Progress, Pending Validation, This Month Revenue

Given projects exist
When I view the dashboard
Then I see a recent projects list
And I see at-risk projects highlighted
```

**Technical Notes:**
- Create `src/app/(auth)/admin/page.tsx`
- Create `src/components/dashboard/stats-cards.tsx`
- Create `src/components/dashboard/recent-projects.tsx`
- Create `src/components/dashboard/at-risk-alerts.tsx`
- At-risk: no updates + deadline approaching (48h)
- Use TanStack Query for data fetching

**Story Points:** 5

---

### Story 3.4: Projects List View

**As an** admin
**I want** to view all projects with filters
**So that** I can manage operations efficiently

**Acceptance Criteria:**
```gherkin
Given I visit /admin/projects
When the page loads
Then I see a table of all projects with key columns

Given projects exist
When I filter by status, writer, package, or date range
Then the table updates to show matching projects

Given I click a project row
When the click registers
Then I navigate to /admin/projects/[id]
```

**Technical Notes:**
- Create `src/app/(auth)/admin/projects/page.tsx`
- Create `src/components/dashboard/project-table.tsx`
- Columns: Reference, Client, Package, Status, Writer, Deadline, Amount
- Use TanStack Query with filters
- Status badges with colors per UX spec

**Story Points:** 5

---

### Story 3.5: Project Detail & Audit History

**As an** admin
**I want** to view complete project details and history
**So that** I can make informed decisions

**Acceptance Criteria:**
```gherkin
Given I visit /admin/projects/[id]
When the project exists
Then I see complete project details including client brief
And I see full audit history timeline

Given status changes have occurred
When I view the timeline
Then I see who made each change and when
```

**Technical Notes:**
- Create `src/app/(auth)/admin/projects/[id]/page.tsx`
- Create `src/components/tracking/timeline.tsx`
- Show all project fields
- Show payment_proofs with validation status
- Show project_history in timeline format
- Add action buttons for assignment/status

**Story Points:** 3

---

### Story 3.6: Writer Assignment

**As an** admin
**I want** to assign and reassign projects to writers
**So that** work is distributed appropriately

**Acceptance Criteria:**
```gherkin
Given a project is validated and unassigned
When I click "Assign Writer"
Then I see a list of available writers with workload info

Given I select a writer and confirm
When assignment succeeds
Then project status changes to 'assigned'
And writer receives notification
And audit log is updated

Given a project is already assigned
When I click "Reassign"
Then I can select a different writer
```

**Technical Notes:**
- Create assignment dialog component
- Query writer_workload view for availability
- Update project.writer_id and status
- Create project_history entry
- Trigger notification (Epic 7)

**Story Points:** 3

---

### Story 3.7: Package Management

**As an** admin
**I want** to create and manage packages
**So that** I can update offerings without developer help

**Acceptance Criteria:**
```gherkin
Given I visit /admin/packages
When the page loads
Then I see a list of all packages with edit/delete actions

Given I click "New Package"
When I fill the form with name, slug, price, description, features
Then a new package is created and visible on the landing page

Given I edit an existing package price
When I save changes
Then the new price shows on public pages
And existing projects keep their agreed_price
```

**Technical Notes:**
- Create `src/app/(auth)/admin/packages/page.tsx`
- Create `src/components/forms/package-form.tsx`
- CRUD operations on packages table
- Features stored as JSONB array
- required_fields as JSONB array
- Validate slug uniqueness

**Story Points:** 5

---

### Story 3.8: Payment Validation Workflow

**As an** admin
**I want** to validate or reject payment screenshots
**So that** projects can proceed or clients can resubmit

**Acceptance Criteria:**
```gherkin
Given a project has pending payment validation
When I view the project
Then I see the payment screenshot and claimed amount
And I see "Validate" and "Reject" buttons

Given I click "Validate"
When I confirm
Then payment_proofs.validated = true
And project status changes to 'validated'
And client receives confirmation email

Given I click "Reject"
When I enter a reason
Then payment_proofs.rejection_reason is saved
And project status changes to 'rejected'
And client receives rejection email with reason
```

**Technical Notes:**
- Create payment validation component
- Display screenshot from Supabase Storage
- Validate: update payment_proofs, project status
- Reject: require reason, notify client
- Create audit log entries

**Story Points:** 5

---

### Story 3.9: Payment Settings Configuration

**As an** admin
**I want** to configure payment requirements
**So that** I can adjust business rules without code changes

**Acceptance Criteria:**
```gherkin
Given I visit /admin/settings
When I view payment settings
Then I see current downpayment type (percentage/fixed) and value
And I see screenshot and reference requirements

Given I change downpayment to 30%
When I save
Then new submissions use 30% downpayment calculation

Given I toggle screenshot_required off
When I save
Then the intake form no longer requires screenshot upload
```

**Technical Notes:**
- Create `src/app/(auth)/admin/settings/page.tsx`
- Create payment settings form
- Update payment_settings table (singleton)
- Changes affect new submissions only

**Story Points:** 3

---

### Story 3.10: Payment Methods Management

**As an** admin
**I want** to manage payment methods and account details
**So that** clients see accurate payment instructions

**Acceptance Criteria:**
```gherkin
Given I visit /admin/settings
When I view payment methods
Then I see enabled methods with account details

Given I add a new payment method "GCash"
When I enter account number and name
Then it appears in the intake form payment step

Given I disable a payment method
When I toggle it off
Then it no longer shows in the intake form
```

**Technical Notes:**
- Create payment methods management UI
- CRUD on payment_methods table
- Display order for method ordering
- Enabled/disabled toggle

**Story Points:** 3

---

### Story 3.11: Writer Roster Management

**As an** admin
**I want** to manage the writer roster
**So that** I can add, edit, and deactivate writers

**Acceptance Criteria:**
```gherkin
Given I visit /admin/writers
When the page loads
Then I see all writers with their workload stats

Given I click "Add Writer"
When I enter name, email, and password
Then a new writer account is created

Given I edit a writer's max_concurrent_projects
When I save
Then the new limit is enforced in assignment
```

**Technical Notes:**
- Create `src/app/(auth)/admin/writers/page.tsx`
- Use Supabase Auth admin API for user creation
- Create profile with role='writer'
- Show current_projects / max_concurrent_projects
- Deactivate sets is_active = false

**Story Points:** 5

---

## Epic 4: Writer Workspace

**Goal:** Enable writers to view assignments, access complete briefs, update status, and track earnings.

**FRs Covered:** FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR50, FR51

**Dependencies:** Epic 1 (Foundation), Epic 3 (Admin assigns projects)

**Acceptance Criteria:**
- Secure writer login
- Dashboard showing assigned projects
- Complete brief access
- Status update capability
- Notes/updates for admin
- Deadline sorting and filtering
- Earnings breakdown view

---

### Story 4.1: Writer Authentication

**As a** writer
**I want** to log in to my dashboard
**So that** I can view and work on assignments

**Acceptance Criteria:**
```gherkin
Given I visit /auth/login
When I enter valid writer credentials
Then I am redirected to /writer

Given I am not logged in
When I try to access /writer/*
Then I am redirected to /auth/login

Given I am logged in as admin
When I try to access /writer/*
Then I am redirected to /admin
```

**Technical Notes:**
- Reuse login page from Story 3.1
- Check profile.role === 'writer' for access
- Redirect based on role after login

**Story Points:** 2

---

### Story 4.2: Writer Dashboard Layout

**As a** writer
**I want** a clean navigation bar
**So that** I can access my work areas

**Acceptance Criteria:**
```gherkin
Given I am logged in as writer
When I view the dashboard
Then I see a top navigation with My Projects and Earnings links

Given I am on any writer page
When I look at the header
Then I see my name and a logout option
```

**Technical Notes:**
- Create `src/app/(auth)/writer/layout.tsx`
- Create `src/components/layout/writer-nav.tsx`
- Simpler than admin (fewer sections)
- Apply Academic Trust colors

**Story Points:** 2

---

### Story 4.3: Writer Projects List

**As a** writer
**I want** to see all projects assigned to me
**So that** I can manage my workload

**Acceptance Criteria:**
```gherkin
Given I visit /writer
When the page loads
Then I see project cards for my assigned projects
And I see status badges on each card

Given I have multiple projects
When I view the list
Then projects are sorted by deadline (urgent first)

Given I want to filter
When I select a status filter
Then only matching projects are shown
```

**Technical Notes:**
- Create `src/app/(auth)/writer/page.tsx`
- Create project card variant for writers
- Show: reference, topic, package, deadline, status
- Default sort: deadline ASC
- Filter by status

**Story Points:** 3

---

### Story 4.4: Project Brief View

**As a** writer
**I want** to view complete client briefs
**So that** I have all information needed to work

**Acceptance Criteria:**
```gherkin
Given I click on a project card
When the project detail loads
Then I see all client-provided information
And I see the deadline prominently displayed
And I see the package name and requirements

Given special_instructions exist
When I view the brief
Then I see them in a highlighted section
```

**Technical Notes:**
- Create `src/app/(auth)/writer/projects/[id]/page.tsx`
- Display all project fields
- Exclude sensitive payment info
- Show deadline with countdown if within 48h

**Story Points:** 3

---

### Story 4.5: Status Updates

**As a** writer
**I want** to update project status
**So that** clients and admin know progress

**Acceptance Criteria:**
```gherkin
Given a project is 'assigned'
When I click "Start Working"
Then status changes to 'in_progress'
And audit log is updated

Given a project is 'in_progress'
When I click "Submit for Review"
Then status changes to 'review'

Given a project is 'review'
When admin requests revisions
Then I can mark it 'in_progress' again
```

**Technical Notes:**
- Create status update buttons
- Follow STATUS_TRANSITIONS rules
- Create project_history entry for each change
- Update last_activity_at timestamp

**Story Points:** 3

---

### Story 4.6: Writer Notes

**As a** writer
**I want** to add notes to projects
**So that** I can communicate with admin

**Acceptance Criteria:**
```gherkin
Given I am viewing a project
When I type a note and submit
Then the note is saved to project_history
And it shows in the timeline

Given notes exist
When admin views the project
Then they see my notes in the timeline
```

**Technical Notes:**
- Add notes input in project detail
- Create project_history entry with action='note'
- Display in timeline component

**Story Points:** 2

---

### Story 4.7: Estimated Completion Date

**As a** writer
**I want** to set an estimated completion date
**So that** clients have expectations beyond just deadline

**Acceptance Criteria:**
```gherkin
Given I am viewing a project
When I set estimated_completion_at
Then the date is saved

Given estimated completion is set
When client views tracking page
Then they see the estimated completion date
```

**Technical Notes:**
- Add date picker for estimated_completion_at
- Optional field (not required)
- Validate: must be before deadline
- Display on tracking page (Epic 5)

**Story Points:** 2

---

### Story 4.8: Earnings Breakdown

**As a** writer
**I want** to see my earnings per project
**So that** I know what I've earned

**Acceptance Criteria:**
```gherkin
Given I visit my earnings page
When the page loads
Then I see a list of completed projects with my 60% share

Given I have completed projects
When I sum the earnings
Then the total matches my expected earnings
```

**Technical Notes:**
- Create `/writer/earnings` page (or section)
- Query projects where writer_id = me and status IN ('complete', 'paid')
- Show writer_share for each
- Calculate totals

**Story Points:** 3

---

## Epic 5: Client Tracking & Delivery

**Goal:** Enable clients to track project status in real-time and access delivered files.

**FRs Covered:** FR6, FR7, FR8, FR48

**Dependencies:** Epic 1 (Foundation), Epic 2 (Tracking token created)

**Acceptance Criteria:**
- Tracking page accessible via unique token URL
- Real-time status updates via Supabase Realtime
- Tiered access (minimal public, full with PIN)
- File delivery access when complete
- Status stepper + timeline components

---

### Story 5.1: Public Tracking Page

**As a** client
**I want** to check my project status via tracking link
**So that** I always know where my project stands

**Acceptance Criteria:**
```gherkin
Given I visit /track/[token]
When the token is valid
Then I see a status stepper showing current progress
And I see project reference code and package name

Given I visit /track/[token]
When the token is invalid
Then I see a friendly 404 page
```

**Technical Notes:**
- Create `src/app/(public)/track/[token]/page.tsx`
- Create `src/components/tracking/status-stepper.tsx`
- Public view shows: status, reference, package, deadline
- Hides: full brief, client contact, payment details

**Story Points:** 5

---

### Story 5.2: PIN Verification for Full Details

**As a** client
**I want** to verify my identity with a PIN
**So that** I can see full project details securely

**Acceptance Criteria:**
```gherkin
Given I am on the tracking page
When I click "View Full Details"
Then I see a PIN entry form

Given I enter the last 4 digits of my phone
When the PIN matches
Then I see full project details including brief and timeline

Given I enter an incorrect PIN
When I submit
Then I see an error message
```

**Technical Notes:**
- Store last 4 digits of client_phone as verification
- Session-based or cookie-based verification state
- Full view shows: complete brief, timeline, files
- Limit PIN attempts (3 per hour)

**Story Points:** 3

---

### Story 5.3: Real-time Status Updates

**As a** client
**I want** the tracking page to update in real-time
**So that** I see changes immediately without refreshing

**Acceptance Criteria:**
```gherkin
Given I am viewing the tracking page
When the project status changes
Then the stepper updates automatically
And I see a notification of the change

Given the page has been open for a while
When I return to it
Then it still shows current status via subscription
```

**Technical Notes:**
- Create `src/hooks/use-realtime-project.ts` per architecture
- Subscribe to postgres_changes on projects table
- Filter by tracking_token
- Update UI optimistically

**Story Points:** 3

---

### Story 5.4: Timeline Event History

**As a** client
**I want** to see the history of my project
**So that** I understand what has happened

**Acceptance Criteria:**
```gherkin
Given I am viewing full details (PIN verified)
When I scroll to the timeline section
Then I see all status changes with timestamps
And I see who performed each action (anonymized)

Given the writer added an estimated completion date
When I view the timeline
Then I see when this was set
```

**Technical Notes:**
- Create `src/components/tracking/timeline.tsx`
- Query project_history for the project
- Display chronologically (newest first)
- Anonymize writer name ("Your assigned writer")

**Story Points:** 3

---

### Story 5.5: File Delivery Access

**As a** client
**I want** to access delivered files
**So that** I can receive my completed work

**Acceptance Criteria:**
```gherkin
Given my project status is 'complete'
When I view the tracking page (PIN verified)
Then I see a download section with file links

Given files are stored in Supabase Storage
When I click download
Then the file downloads correctly
```

**Technical Notes:**
- Create file delivery section
- For MVP: store Google Drive links in project
- Future: Supabase Storage direct files
- Only visible when status = 'complete' or 'paid'

**Story Points:** 3

---

## Epic 6: Payments & Reporting

**Goal:** Enable admin to track payments, settlements, and view business reports.

**FRs Covered:** FR18, FR24, FR25, FR26, FR28, FR31, FR54

**Dependencies:** Epic 3 (Admin dashboard), Epic 4 (Projects complete)

**Acceptance Criteria:**
- Payment tracker showing 60/40 splits
- Mark projects as paid/settled
- Weekly/monthly profit summaries
- CSV export functionality
- Automatic split calculation

---

### Story 6.1: Payment Tracker Dashboard

**As an** admin
**I want** to view payment status for all projects
**So that** I can track finances

**Acceptance Criteria:**
```gherkin
Given I visit /admin/payments
When the page loads
Then I see a list of projects with payment info
And I see columns: Reference, Amount, Writer Share (60%), Admin Share (40%), Status

Given projects exist with different payment statuses
When I filter by status (pending/paid)
Then the list updates accordingly
```

**Technical Notes:**
- Create `src/app/(auth)/admin/payments/page.tsx`
- Query projects with calculated shares
- Filter by payment status
- Show discount/additional_charges if non-zero

**Story Points:** 3

---

### Story 6.2: Mark Projects as Paid

**As an** admin
**I want** to mark projects as paid
**So that** I track which writers have been settled

**Acceptance Criteria:**
```gherkin
Given a project is 'complete'
When I click "Mark as Paid"
Then status changes to 'paid'
And audit log shows payment action

Given a project is 'paid'
When I view it
Then I see when it was marked paid
```

**Technical Notes:**
- Add "Mark Paid" action to payment table
- Update project.status to 'paid'
- Create project_history entry
- Show paid_at timestamp (use updated_at)

**Story Points:** 2

---

### Story 6.3: Profit Summary Reports

**As an** admin
**I want** to view weekly and monthly profit summaries
**So that** I understand business performance

**Acceptance Criteria:**
```gherkin
Given I view the payments page
When I look at the summary section
Then I see this week's and this month's totals
And I see total revenue, writer payments, and profit

Given I switch to "This Month" view
When the view loads
Then I see monthly breakdown by week
```

**Technical Notes:**
- Query profit_summary view
- Create summary cards component
- Show: total_revenue, total_writer_payments, total_profit
- Allow weekly/monthly toggle

**Story Points:** 3

---

### Story 6.4: CSV Export

**As an** admin
**I want** to export project and payment data
**So that** I can analyze in spreadsheets

**Acceptance Criteria:**
```gherkin
Given I am on the payments page
When I click "Export CSV"
Then a CSV file downloads with project and payment data

Given I apply date range filters
When I export
Then only filtered data is included
```

**Technical Notes:**
- Create CSV generation utility
- Include: reference, client, package, amount, writer_share, admin_share, status, dates
- Apply current filters to export
- Use browser download API

**Story Points:** 3

---

### Story 6.5: Discount & Additional Charges

**As an** admin
**I want** to apply discounts or additional charges
**So that** the 60/40 split calculates correctly

**Acceptance Criteria:**
```gherkin
Given I view a project detail
When I set a discount_amount
Then the writer_share and admin_share recalculate

Given I add additional_charges
When I save
Then the split reflects the new total
```

**Technical Notes:**
- Add discount/additional_charges inputs to project detail
- Calculated fields update automatically (GENERATED ALWAYS)
- Create audit log for changes

**Story Points:** 2

---

## Epic 7: Notifications & Automation

**Goal:** Implement email notifications and automated alerts for all stakeholders.

**FRs Covered:** FR30, FR47, FR55

**Dependencies:** Epic 2-6 (all flows that trigger notifications)

**Acceptance Criteria:**
- 7 transactional email types working
- 48h deadline warnings automated
- Priority-based notification delivery
- Email templates with consistent branding

---

### Story 7.1: Email Service Integration

**As a** system
**I want** email sending capability
**So that** notifications can be delivered

**Acceptance Criteria:**
```gherkin
Given Resend is configured
When I call the email service
Then emails are sent successfully

Given email sending fails
When I check logs
Then I see the error details
```

**Technical Notes:**
- Create `src/lib/email/resend.ts`
- Configure Resend API key
- Create base email sending function
- Add error handling and logging

**Story Points:** 2

---

### Story 7.2: Email Templates

**As a** system
**I want** branded email templates
**So that** all emails look professional

**Acceptance Criteria:**
```gherkin
Given a template is defined
When an email is sent
Then it uses Academic Trust branding
And it includes the correct dynamic content

Given all 7 templates exist
When I review them
Then each has appropriate content for its trigger
```

**Technical Notes:**
- Create `src/lib/email/templates/` folder
- Templates: submission-confirmation, payment-validated, payment-rejected, writer-assignment, deadline-warning, project-complete, admin-digest
- Use React Email or HTML templates
- Include logo, colors, consistent footer

**Story Points:** 5

---

### Story 7.3: Submission Confirmation Email

**As a** client
**I want** to receive confirmation after submitting
**So that** I have my reference code and tracking link

**Acceptance Criteria:**
```gherkin
Given I submit a project
When submission succeeds
Then I receive an email with reference code
And the email contains my tracking link
And I see payment instructions if pending validation
```

**Technical Notes:**
- Trigger on project insert
- Include: reference_code, tracking_link, package name, deadline
- Include payment status if pending validation

**Story Points:** 2

---

### Story 7.4: Payment Validation Emails

**As a** client
**I want** to be notified when payment is validated or rejected
**So that** I know the status of my submission

**Acceptance Criteria:**
```gherkin
Given admin validates my payment
When validation succeeds
Then I receive a "Payment Confirmed" email

Given admin rejects my payment
When rejection is saved
Then I receive an email with the rejection reason
And I see instructions to resubmit
```

**Technical Notes:**
- Trigger on payment_proofs.validated change
- Validated: confirmation + next steps
- Rejected: reason + resubmission link

**Story Points:** 2

---

### Story 7.5: Writer Assignment Notification

**As a** writer
**I want** to be notified when assigned a project
**So that** I can start working promptly

**Acceptance Criteria:**
```gherkin
Given I am assigned a project
When assignment is saved
Then I receive an email notification
And the email contains project brief summary
And I see a link to my dashboard
```

**Technical Notes:**
- Trigger on project.writer_id set
- Include: reference, topic, deadline, link to dashboard
- Brief summary (not full content)

**Story Points:** 2

---

### Story 7.6: Deadline Warning System

**As a** system
**I want** to send 48h deadline warnings
**So that** at-risk projects get attention

**Acceptance Criteria:**
```gherkin
Given a project deadline is 48h away
When the project is not 'in_progress' or later
Then a warning email is sent to writer and admin

Given a warning was already sent
When the scheduled job runs again
Then no duplicate warning is sent
```

**Technical Notes:**
- Create pg_cron job per architecture
- Call Supabase Edge Function
- Check: deadline in 48h AND status NOT IN ('in_progress', 'review', 'complete', 'paid')
- Track sent warnings in project_history
- Email both writer and admin

**Story Points:** 5

---

### Story 7.7: Project Completion Email

**As a** client
**I want** to be notified when my project is complete
**So that** I can download my files and pay final balance

**Acceptance Criteria:**
```gherkin
Given my project status changes to 'complete'
When the change is saved
Then I receive a completion email
And the email contains a link to download files
And I see final payment instructions
```

**Technical Notes:**
- Trigger on status change to 'complete'
- Include: tracking link, download instructions
- Include remaining balance if applicable

**Story Points:** 2

---

### Story 7.8: Admin Daily Digest (Optional)

**As an** admin
**I want** to receive a daily summary
**So that** I can batch-review routine updates

**Acceptance Criteria:**
```gherkin
Given digest notifications are enabled
When the daily digest job runs
Then I receive one email with: new submissions, pending validations, at-risk projects

Given nothing notable happened
When the digest runs
Then no email is sent (skip empty digests)
```

**Technical Notes:**
- Create optional daily digest job
- Aggregate: new submissions, pending validations, approaching deadlines
- Skip if all counts are zero
- Allow admin to enable/disable in settings

**Story Points:** 3

---

## Story Summary

| Epic | Stories | Total Points |
|------|---------|--------------|
| Epic 1: Foundation & Public Pages | 6 | 21 |
| Epic 2: Client Submission Flow | 6 | 23 |
| Epic 3: Admin Operations Core | 11 | 43 |
| Epic 4: Writer Workspace | 8 | 20 |
| Epic 5: Client Tracking & Delivery | 5 | 17 |
| Epic 6: Payments & Reporting | 5 | 13 |
| Epic 7: Notifications & Automation | 8 | 23 |
| **TOTAL** | **49 stories** | **160 points** |

---

## Implementation Order

**Recommended Sprint Sequence:**

1. **Sprint 1:** Epic 1 (Foundation) - All 6 stories
2. **Sprint 2:** Epic 2 (Submission) - All 6 stories
3. **Sprint 3:** Epic 3.1-3.5 (Admin Core) - Auth, layout, dashboard, projects
4. **Sprint 4:** Epic 3.6-3.11 (Admin Operations) - Assignment, packages, payments
5. **Sprint 5:** Epic 4 (Writer Workspace) - All 8 stories
6. **Sprint 6:** Epic 5 (Tracking) - All 5 stories
7. **Sprint 7:** Epic 6 (Payments & Reporting) - All 5 stories
8. **Sprint 8:** Epic 7 (Notifications) - All 8 stories

**MVP Critical Path:** Epics 1-5 enable end-to-end flow from submission to delivery.

**Post-MVP:** Epic 6 and Epic 7 enhance operations but aren't blocking for first users.

