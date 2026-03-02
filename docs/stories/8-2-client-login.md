# Story 8.2: Client Login

Status: review

## Story

As a **registered client**,
I want **to log in to my account with email and password**,
so that **I can access my dashboard and track my projects**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Login form displays email and password fields with "Sign In" button on `/auth/login` | Visual |
| 2 | Valid client credentials redirect to `/client` dashboard | E2E |
| 3 | Invalid credentials show "Invalid email or password" error without revealing which field is wrong | E2E |
| 4 | Already-authenticated client visiting `/auth/login` is redirected to `/client` | E2E |
| 5 | Already-authenticated admin/writer visiting `/client` is redirected to their respective dashboard | E2E |
| 6 | Client session persists across page refreshes until explicit logout | Manual |
| 7 | "Remember me" checkbox extends session duration | Manual |
| 8 | Login page shows link to `/auth/register` for new clients | Visual |
| 9 | Login page shows link to password reset flow | Visual |
| 10 | Successful login creates audit entry in client's session | Integration |

## Tasks / Subtasks

- [ ] **Task 1: Update Login Page for Client Role** (AC: 1, 8, 9)
  - [ ] 1.1 Review existing `apps/web/src/app/auth/login/page.tsx`
  - [ ] 1.2 Ensure "Create Account" link to `/auth/register` is visible
  - [ ] 1.3 Ensure "Forgot Password?" link is visible
  - [ ] 1.4 Add "Remember me" checkbox option

- [ ] **Task 2: Client Role Redirect Logic** (AC: 2, 4, 5)
  - [ ] 2.1 Review existing middleware at `apps/web/src/middleware.ts`
  - [ ] 2.2 Verify login redirects: admin → `/admin`, writer → `/writer`, client → `/client`
  - [ ] 2.3 Verify already-authenticated redirect from `/auth/login`
  - [ ] 2.4 Verify cross-role redirect protection (client can't access `/admin` or `/writer`)

- [ ] **Task 3: Client Layout** (AC: 2, 6)
  - [ ] 3.1 Create `apps/web/src/app/(auth)/client/layout.tsx` with auth guard
  - [ ] 3.2 Verify role check: only `role='client'` can access `/client/*` routes
  - [ ] 3.3 Redirect non-client roles to their respective dashboards

- [ ] **Task 4: Error Handling** (AC: 3)
  - [ ] 4.1 Ensure generic error message for invalid credentials (no email/password enumeration)
  - [ ] 4.2 Add rate limiting awareness (Supabase built-in)
  - [ ] 4.3 Handle network errors gracefully

- [ ] **Task 5: Testing** (All ACs)
  - [ ] 5.1 Unit test: login form validation (email format, password required)
  - [ ] 5.2 Unit test: role-based redirect logic
  - [ ] 5.3 Integration test: login → redirect to `/client`
  - [ ] 5.4 Integration test: invalid credentials → error message
  - [ ] 5.5 Integration test: cross-role access protection

## Dev Notes

### Architecture Alignment
- **Auth System**: Uses existing Supabase Auth from Story 3.1 (admin) and 4.1 (writer)
- **Middleware**: Already updated in Story 8.1 for client role handling
- **Login Page**: `apps/web/src/app/auth/login/page.tsx` already has client redirect (line 80-81)

### Key Technical Decisions
- Reuse existing login page — do NOT create a separate client login page
- Role-based redirect handled in login action, not client-side
- Session management via Supabase Auth cookies (already configured)

### Existing Code to Extend
```
apps/web/src/app/auth/login/page.tsx      # Add register link, forgot password link
apps/web/src/app/(auth)/client/layout.tsx  # Create - auth guard for client routes
apps/web/src/middleware.ts                 # Already has client handling - verify
```

### Prerequisites
- Story 8.1 (Client Registration) — provides client accounts to log into

### References
- [Source: docs/stories/tech-spec-epic-8.md#Authentication-Extension]
- [Source: docs/stories/8-1-client-registration.md] — registration flow

**Story Points:** 2

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted with proper BMAD ACs | SM Agent (Party Mode) |
