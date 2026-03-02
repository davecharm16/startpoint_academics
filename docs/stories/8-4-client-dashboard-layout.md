# Story 8.4: Client Dashboard Layout

Status: review

## Story

As a **logged-in client**,
I want **a dashboard with clear navigation**,
so that **I can easily access my projects, referrals, social rewards, and profile**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Client dashboard at `/client` shows navigation with links: My Projects, Referrals, Social Rewards, Profile | Visual |
| 2 | Header displays client's full name and email | Visual |
| 3 | Header includes a Sign Out button that logs out and redirects to `/auth/login` | E2E |
| 4 | Navigation highlights the currently active section | Visual |
| 5 | On mobile (< 768px), navigation is accessible via hamburger menu | Visual |
| 6 | Referral code is prominently displayed with a "Copy" button in the header or sidebar | Visual |
| 7 | Dashboard home page shows summary cards: Total Projects, Reward Balance, Active Referrals | Visual |
| 8 | All client pages use consistent layout wrapper from `client/layout.tsx` | Code review |

## Tasks / Subtasks

- [ ] **Task 1: Create Client Navigation Component** (AC: 1, 4, 5)
  - [ ] 1.1 Create `apps/web/src/components/layout/client-nav.tsx`
  - [ ] 1.2 Navigation items: My Projects (`/client/projects`), Referrals (`/client/referrals`), Social Rewards (`/client/social-rewards`), Profile (`/client/profile`)
  - [ ] 1.3 Active state highlighting based on current pathname
  - [ ] 1.4 Mobile responsive: hamburger menu using shadcn Sheet component
  - [ ] 1.5 Style consistent with existing writer-nav.tsx pattern

- [ ] **Task 2: Create Client Layout** (AC: 2, 3, 8)
  - [ ] 2.1 Create `apps/web/src/app/(auth)/client/layout.tsx`
  - [ ] 2.2 Auth guard: verify user is authenticated with `role='client'`
  - [ ] 2.3 Redirect non-client roles to their respective dashboards
  - [ ] 2.4 Include ClientNav component
  - [ ] 2.5 Display user name and email in header
  - [ ] 2.6 Add Sign Out form/button with server action

- [ ] **Task 3: Update Dashboard Home Page** (AC: 6, 7)
  - [ ] 3.1 Rewrite `apps/web/src/app/(auth)/client/page.tsx` (replace placeholder)
  - [ ] 3.2 Add summary cards: Total Projects count, Reward Balance (₱), Active Referrals count
  - [ ] 3.3 Display referral code prominently with copy-to-clipboard button
  - [ ] 3.4 Query data server-side from Supabase
  - [ ] 3.5 Remove "Coming Soon" banner

- [ ] **Task 4: Testing** (All ACs)
  - [ ] 4.1 Unit test: ClientNav renders all navigation items
  - [ ] 4.2 Unit test: active state highlighting logic
  - [ ] 4.3 Integration test: auth guard redirects unauthenticated users
  - [ ] 4.4 Integration test: sign out clears session
  - [ ] 4.5 Visual test: mobile hamburger menu opens/closes

## Dev Notes

### Architecture Alignment
- **Pattern**: Follow writer-nav.tsx and admin-sidebar.tsx patterns
- **Auth Guard**: Same pattern as `apps/web/src/app/(auth)/writer/layout.tsx`
- **Routing**: Under `(auth)/client/` route group

### Key Technical Decisions
- Use top-nav pattern (like writer) not sidebar (like admin) — fewer pages, simpler UX
- Referral code copy uses `navigator.clipboard.writeText()` with fallback
- Server-side data fetching for summary cards (no client-side queries on dashboard home)

### Existing Code to Replace
```
apps/web/src/app/(auth)/client/page.tsx    # Replace placeholder with full dashboard
```

### New Files
```
apps/web/src/components/layout/client-nav.tsx  # Client navigation component
apps/web/src/app/(auth)/client/layout.tsx      # Client layout with auth guard
```

### Prerequisites
- Story 8.2 (Client Login) — login flow to reach dashboard

### References
- [Source: docs/stories/tech-spec-epic-8.md#Role-Based-Routing]
- [Source: docs/ux-design-specification.md] — Academic Trust theme
- Pattern reference: `apps/web/src/components/layout/writer-nav.tsx`

**Story Points:** 3

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted with proper BMAD ACs | SM Agent (Party Mode) |
