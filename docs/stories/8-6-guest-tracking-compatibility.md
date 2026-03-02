# Story 8.6: Guest Tracking Compatibility

Status: drafted

## Story

As a **non-registered client**,
I want **my tracking links to continue working**,
so that **I can track my projects without creating an account**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Existing `/track/[token]` URLs continue to work exactly as before for non-registered users | E2E |
| 2 | Tracking page shows a "Create Account" CTA banner for non-authenticated visitors | Visual |
| 3 | "Create Account" CTA links to `/auth/register` with the client's email pre-filled if available (via query param) | E2E |
| 4 | When a user registers with the same email used in a prior submission, existing projects are automatically linked to the new account | Integration |
| 5 | Authenticated clients visiting their own tracking page do NOT see the "Create Account" banner | E2E |
| 6 | No changes to the PIN verification flow — it continues to work as-is | E2E |

## Tasks / Subtasks

- [ ] **Task 1: Add Registration CTA to Tracking Page** (AC: 2, 3, 5)
  - [ ] 1.1 Update `apps/web/src/app/(public)/track/[token]/page.tsx`
  - [ ] 1.2 Add "Create Account" banner below tracking content
  - [ ] 1.3 Check if user is authenticated — hide banner if logged in as client
  - [ ] 1.4 Link to `/auth/register?email=[client_email]` (URL-encoded)
  - [ ] 1.5 Style banner as a soft CTA (not intrusive — use muted background)

- [ ] **Task 2: Pre-fill Registration Email** (AC: 3)
  - [ ] 2.1 Update registration page to accept `?email=` query param
  - [ ] 2.2 Pre-fill email field if param provided
  - [ ] 2.3 Email field remains editable

- [ ] **Task 3: Verify Backward Compatibility** (AC: 1, 6)
  - [ ] 3.1 Verify tracking page loads without auth
  - [ ] 3.2 Verify PIN verification still works
  - [ ] 3.3 Verify status stepper, timeline, file downloads all unchanged
  - [ ] 3.4 Verify no auth-related errors for anonymous visitors

- [ ] **Task 4: Project Linking on Registration** (AC: 4)
  - [ ] 4.1 Verify Story 8.1's `link_projects_to_client()` DB function works correctly
  - [ ] 4.2 Test: submit project as guest → register with same email → project appears in dashboard
  - [ ] 4.3 Verify `client_user_id` is set on matched projects

- [ ] **Task 5: Testing** (All ACs)
  - [ ] 5.1 Integration test: tracking page loads for anonymous user
  - [ ] 5.2 Integration test: CTA banner visible for anonymous, hidden for authenticated client
  - [ ] 5.3 Integration test: registration with email pre-fill
  - [ ] 5.4 Integration test: project linking after registration
  - [ ] 5.5 Regression test: PIN verification unchanged

## Dev Notes

### Architecture Alignment
- **Tracking Page**: `apps/web/src/app/(public)/track/[token]/page.tsx` — public route, no auth required
- **Project Linking**: Migration 00008 includes `link_projects_to_client()` function
- **FR61**: "Existing tracking links continue to work for non-registered clients"

### Key Technical Decisions
- CTA is informational, not blocking — never gate tracking behind registration
- Email pre-fill is a convenience, not required — client can change it
- Use `createClient()` server-side to check auth status (optional, don't error if no session)

### Prerequisites
- Epic 5 (Client Tracking) — existing tracking page
- Story 8.1 (Client Registration) — project linking function

### References
- [Source: docs/stories/tech-spec-epic-8.md#Acceptance-Criteria] — AC-8.6
- [Source: docs/epics.md#Story-8.6]

**Story Points:** 2

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted with proper BMAD ACs | SM Agent (Party Mode) |
