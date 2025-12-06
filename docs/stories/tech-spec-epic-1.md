# Epic Technical Specification: Foundation & Public Pages

Date: 2025-11-30
Author: Dave
Epic ID: epic-1
Status: Draft

---

## Overview

Epic 1 establishes the foundational infrastructure for Startpoint Academics and delivers the public-facing pages that allow visitors to browse services and packages without registration. This is a greenfield epic that creates the project from scratch, implementing the core technology stack (Next.js 14 + Supabase + shadcn/ui) and building the first user-visible features.

**Business Value:** Enables the platform to present its services publicly, supporting the transparency-first value proposition where clients can view pricing and package details via shareable links without registration barriers.

**FRs Covered:** FR1 (Landing page), FR2 (Package detail pages), FR3 (Package selection), FR34 (Dynamic packages from database)

**Stories in this Epic:**
1. Story 1.1: Project Infrastructure Setup (3 pts)
2. Story 1.2: Database Schema & Initial Migrations (5 pts)
3. Story 1.3: Supabase Client & Type Generation (2 pts)
4. Story 1.4: Layout Components & Navigation (3 pts)
5. Story 1.5: Landing Page (5 pts)
6. Story 1.6: Package Detail Pages (3 pts)

**Total Points:** 21

## Objectives and Scope

### In Scope

- Initialize Next.js 14 project with App Router, TypeScript, and Tailwind CSS
- Set up Supabase local development environment
- Create complete database schema with all tables, RLS policies, and views
- Generate TypeScript types from database schema
- Build shadcn/ui component foundation with Academic Trust theme
- Implement public header/navigation components
- Create landing page with hero, package cards, and trust signals
- Create dynamic package detail pages with shareable URLs
- Apply ISR (Incremental Static Regeneration) for public pages

### Out of Scope

- Client intake forms (Epic 2)
- Authentication flows (Epic 3/4)
- Admin/Writer dashboards (Epic 3/4)
- Email notifications (Epic 7)
- Payment validation workflows (Epic 3)

### Dependencies

- None (this is the foundation epic)

### Outputs

| Output | Location |
|--------|----------|
| Next.js project | `startpoint-academics/` root |
| Database migrations | `supabase/migrations/` |
| TypeScript types | `src/types/database.ts` |
| Supabase clients | `src/lib/supabase/` |
| UI components | `src/components/` |
| Public pages | `src/app/(public)/` |

## System Architecture Alignment

### Technology Stack (per Architecture Document)

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | Framework with App Router |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | Latest | UI component library |
| Supabase | Latest | Database + Auth + Storage |
| TanStack Query | 5.x | Server state management |
| React Hook Form | 7.x | Form handling (setup only) |
| Zod | 3.x | Schema validation (setup only) |
| date-fns | 3.x | Date utilities |
| Lucide React | Latest | Icons |

### Project Structure (per Architecture Document)

```
startpoint-academics/
├── src/
│   ├── app/
│   │   ├── (public)/                    # Public routes (Epic 1 focus)
│   │   │   ├── page.tsx                 # Landing page
│   │   │   └── packages/
│   │   │       └── [slug]/page.tsx      # Package detail
│   │   ├── layout.tsx                   # Root layout
│   │   └── globals.css                  # Global styles
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn/ui components
│   │   ├── marketing/                   # Landing page components
│   │   │   ├── hero-section.tsx
│   │   │   ├── package-card.tsx
│   │   │   └── trust-signals.tsx
│   │   └── layout/
│   │       └── public-header.tsx        # Public navigation
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                # Browser client
│   │   │   ├── server.ts                # Server client
│   │   │   └── middleware.ts            # Auth middleware (stub)
│   │   └── utils/
│   │       └── cn.ts                    # Class name utility
│   │
│   └── types/
│       ├── database.ts                  # Supabase generated
│       └── index.ts                     # App types
│
├── supabase/
│   ├── migrations/
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00002_rls_policies.sql
│   │   └── 00003_functions_views.sql
│   └── seed.sql                         # Sample packages
│
├── public/
│   └── images/                          # Static assets
│
├── .env.local.example                   # Environment template
└── middleware.ts                        # Next.js middleware (stub)
```

### Architecture Decisions Applied

| ADR | Decision | Implementation in Epic 1 |
|-----|----------|--------------------------|
| ADR-001 | Single Next.js App | Initialize with route groups |
| ADR-002 | Supabase for backend | Set up local Supabase instance |
| ADR-014 | React Hook Form + Zod | Install and configure (forms in Epic 2) |
| ADR-015 | date-fns | Install for date utilities |
| ADR-016 | TanStack Query | Set up QueryClientProvider |

## Detailed Design

### Services and Modules

#### 1. Supabase Client Module (`src/lib/supabase/`)

**Browser Client (`client.ts`):**
```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Server Client (`server.ts`):**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )
}
```

#### 2. Marketing Components (`src/components/marketing/`)

**HeroSection:** Full-width hero with navy gradient background, centered headline, and gold CTA button.

**PackageCard:** Card component displaying package name, price, description, features list, and "Get Started" CTA.

**TrustSignals:** Section with testimonial quotes, guarantee badges, and credibility indicators.

#### 3. Layout Components (`src/components/layout/`)

**PublicHeader:** Responsive header with logo, navigation links (Services, Packages, About), and mobile hamburger menu using shadcn/ui Sheet component.

### Data Models and Contracts

#### Database Tables (Epic 1 Focus)

**packages** (primary table for this epic):
```sql
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,           -- URL-friendly identifier
  name TEXT NOT NULL,                  -- Display name
  description TEXT,                    -- Short description
  price DECIMAL(10,2) NOT NULL,        -- Base price
  features JSONB DEFAULT '[]',         -- Feature list array
  required_fields JSONB DEFAULT '[]',  -- Dynamic form fields
  is_active BOOLEAN DEFAULT true,      -- Visibility toggle
  display_order INTEGER DEFAULT 0,     -- Sort order
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Full Schema:** All tables from architecture doc will be created (profiles, projects, payment_proofs, project_history, payment_settings, payment_methods) to establish complete foundation, even though most are used in later epics.

#### TypeScript Types

```typescript
// From generated database.ts
export interface Package {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  features: string[]
  required_fields: RequiredField[]
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

interface RequiredField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'select'
  required: boolean
  options?: string[]
}
```

### APIs and Interfaces

#### Package Fetching (Server Components)

**Landing Page - Fetch All Active Packages:**
```typescript
// In src/app/(public)/page.tsx
export default async function LandingPage() {
  const supabase = await createClient()

  const { data: packages } = await supabase
    .from('packages')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return <LandingContent packages={packages ?? []} />
}
```

**Package Detail - Fetch Single Package:**
```typescript
// In src/app/(public)/packages/[slug]/page.tsx
export default async function PackageDetailPage({
  params
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()

  const { data: pkg, error } = await supabase
    .from('packages')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (error || !pkg) {
    notFound()
  }

  return <PackageDetail package={pkg} />
}
```

#### Static Generation

```typescript
// Generate static params for known packages
export async function generateStaticParams() {
  const supabase = await createClient()
  const { data: packages } = await supabase
    .from('packages')
    .select('slug')
    .eq('is_active', true)

  return packages?.map((pkg) => ({ slug: pkg.slug })) ?? []
}

// Metadata for SEO/sharing
export async function generateMetadata({
  params
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const supabase = await createClient()
  const { data: pkg } = await supabase
    .from('packages')
    .select('name, description')
    .eq('slug', params.slug)
    .single()

  return {
    title: pkg?.name ?? 'Package Not Found',
    description: pkg?.description ?? 'Academic writing services',
  }
}
```

### Workflows and Sequencing

#### Story Implementation Order

```
Story 1.1: Project Infrastructure Setup
    ↓
Story 1.2: Database Schema & Initial Migrations
    ↓
Story 1.3: Supabase Client & Type Generation
    ↓
Story 1.4: Layout Components & Navigation
    ↓
Story 1.5: Landing Page
    ↓
Story 1.6: Package Detail Pages
```

**Critical Path:** Stories must be completed in order as each depends on the previous.

#### Development Workflow per Story

1. Create/update files per story requirements
2. Run local tests (`npm run dev`, visual check)
3. Run type checking (`npm run typecheck`)
4. Run linting (`npm run lint`)
5. Commit with conventional commit message

## Non-Functional Requirements

### Performance

| Metric | Target | Implementation |
|--------|--------|----------------|
| Landing page load | < 2 seconds | SSG with ISR (revalidate: 3600) |
| Package page load | < 1.5 seconds | SSG with generateStaticParams |
| Time to Interactive | < 3 seconds | Minimal client JS, Server Components |
| Core Web Vitals LCP | < 2.5 seconds | Optimize hero image, font loading |

**Caching Strategy:**
- Landing page: ISR with 1-hour revalidation
- Package pages: Static generation with on-demand revalidation
- Package data: React Query with 5-minute stale time (for admin updates)

### Security

| Measure | Implementation |
|---------|----------------|
| Environment variables | .env.local for secrets, never committed |
| Supabase RLS | Packages table: public read for active only |
| Input sanitization | Not applicable (no user input in Epic 1) |
| HTTPS | Enforced by Vercel deployment |

### Reliability/Availability

| Requirement | Implementation |
|-------------|----------------|
| Error boundaries | Wrap page components |
| 404 handling | Custom not-found.tsx for package pages |
| Graceful degradation | Show fallback if packages fail to load |
| Loading states | Skeleton components during data fetch |

### Observability

| Aspect | Implementation |
|--------|----------------|
| Error logging | Console.error for development |
| Build errors | Next.js build output |
| Type errors | TypeScript strict mode |

## Dependencies and Integrations

### NPM Packages

```json
{
  "dependencies": {
    "next": "14.x",
    "@supabase/supabase-js": "^2.86.0",
    "@supabase/ssr": "latest",
    "@tanstack/react-query": "^5.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "zod": "^3.x",
    "date-fns": "^3.x",
    "lucide-react": "latest",
    "use-debounce": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "supabase": "latest"
  }
}
```

### External Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| Supabase | Database, Auth (future), Storage (future) | Local dev via Docker |
| Vercel | Hosting (future deployment) | Not configured in Epic 1 |

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Acceptance Criteria (Authoritative)

### Story 1.1: Project Infrastructure Setup

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | `npm install && npm run dev` starts app on localhost:3000 | Manual |
| 2 | Supabase local instance accessible via `npx supabase status` | CLI |
| 3 | All required dependencies installed per package.json | `npm ls` |
| 4 | shadcn/ui initialized with Academic Trust colors | Visual |
| 5 | Project structure matches architecture doc | File system |

### Story 1.2: Database Schema & Initial Migrations

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | All 7 tables created: profiles, packages, projects, payment_proofs, project_history, payment_settings, payment_methods | `\dt` in psql |
| 2 | CHECK constraints, FKs, and indexes created | Schema inspection |
| 3 | Helper functions is_admin(), is_writer() exist | Function listing |
| 4 | Views writer_workload, profit_summary created | View listing |
| 5 | Seed data includes 3+ sample packages | Query packages |

### Story 1.3: Supabase Client & Type Generation

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | `src/types/database.ts` generated and matches schema | File exists |
| 2 | Browser client in `src/lib/supabase/client.ts` | Import test |
| 3 | Server client in `src/lib/supabase/server.ts` | Import test |
| 4 | TypeScript autocomplete works for queries | IDE check |

### Story 1.4: Layout Components & Navigation

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Public header displays logo and navigation | Visual |
| 2 | Mobile hamburger menu works | Responsive test |
| 3 | "Get Started" navigates to packages section | Click test |
| 4 | Academic Trust colors applied (Navy #1e3a5f, Gold #d4a853) | Visual |

### Story 1.5: Landing Page

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Hero section with headline and CTA displays | Visual |
| 2 | Package cards render from database | Data check |
| 3 | Packages sorted by display_order | Order check |
| 4 | Trust signals section present | Visual |
| 5 | "Get Started" buttons navigate to /packages/[slug] | Click test |

### Story 1.6: Package Detail Pages

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | /packages/[slug] displays package details | Visual |
| 2 | Invalid slug shows 404 page | Navigate to invalid |
| 3 | URL is shareable (no auth required) | Incognito test |
| 4 | Meta tags generated for SEO | View source |
| 5 | "Get Started" CTA links to intake form (stub) | Click test |

## Traceability Mapping

| FR | Description | Story | Component/File |
|----|-------------|-------|----------------|
| FR1 | Landing page without registration | 1.5 | `src/app/(public)/page.tsx` |
| FR2 | Package detail via shareable URLs | 1.6 | `src/app/(public)/packages/[slug]/page.tsx` |
| FR3 | Package selection to intake | 1.6 | "Get Started" CTA button |
| FR34 | Packages from database | 1.2, 1.5 | packages table, Server Component fetch |

## Risks, Assumptions, Open Questions

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase local Docker issues | High | Document setup steps, test on clean machine |
| shadcn/ui version incompatibility | Medium | Pin versions, test before upgrading |
| Next.js 14 vs 15 breaking changes | Low | Stick with 14.x for stability |

### Assumptions

1. Developer has Node.js 18+ and Docker installed
2. Developer has basic familiarity with Next.js and Supabase
3. No production deployment in Epic 1 (local dev only)
4. Sample package data sufficient for testing

### Open Questions

| Question | Status | Resolution |
|----------|--------|------------|
| Logo asset for header | Pending | Use text "Startpoint Academics" until logo provided |
| Testimonial content | Pending | Use placeholder content for trust signals |
| Package pricing details | Pending | Use realistic placeholder prices in seed data |

## Test Strategy Summary

### Manual Testing

| Test Type | Scope | Approach |
|-----------|-------|----------|
| Visual regression | All UI components | Compare against UX spec |
| Responsive testing | All pages | Chrome DevTools at Mobile/Tablet/Desktop |
| Navigation testing | All links and CTAs | Click-through all flows |
| Database integration | Package fetching | Verify data displays correctly |

### Automated Testing (Future)

| Test Type | Scope | Status |
|-----------|-------|--------|
| Unit tests | Utility functions | Deferred to Epic 2+ |
| Component tests | UI components | Deferred to Epic 2+ |
| E2E tests | Critical paths | Deferred to Epic 2+ |

### Accessibility Testing

| Tool | Purpose |
|------|---------|
| axe DevTools | Automated a11y scanning |
| Keyboard navigation | Manual tab-through testing |
| Screen reader | VoiceOver/NVDA spot checks |

---

_Generated by BMAD Epic Tech Context Workflow_
_Date: 2025-11-30_
