# Story 8.3: Client Password Reset

Status: review

## Story

As a **client who forgot their password**,
I want **to reset my password via email**,
so that **I can regain access to my account**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | "Forgot Password?" link on login page navigates to `/auth/change-password` | Visual |
| 2 | Password reset form accepts email address and shows success message regardless of whether email exists (no enumeration) | E2E |
| 3 | Valid email triggers a password reset email with a secure, time-limited link | Integration |
| 4 | Reset link opens a "Set New Password" form at `/auth/change-password` | E2E |
| 5 | New password must meet strength requirements (8+ chars, 1 uppercase, 1 number) | Unit |
| 6 | Successfully setting new password redirects to `/auth/login` with success message | E2E |
| 7 | Reset link expires after 1 hour and shows "Link expired" with option to request a new one | Integration |
| 8 | Used reset link cannot be reused — shows "Link already used" message | Integration |

## Tasks / Subtasks

- [ ] **Task 1: Password Reset Request Page** (AC: 1, 2)
  - [ ] 1.1 Review existing `apps/web/src/app/auth/change-password/` route
  - [ ] 1.2 Create or update forgot password request form (email input + submit)
  - [ ] 1.3 Show generic success message: "If an account exists with this email, you'll receive a reset link"
  - [ ] 1.4 Add "Back to Login" link

- [ ] **Task 2: Reset Email Integration** (AC: 3, 7)
  - [ ] 2.1 Use Supabase Auth `resetPasswordForEmail()` method
  - [ ] 2.2 Configure redirect URL to `/auth/change-password`
  - [ ] 2.3 Create password reset email template in `packages/email/src/templates/password-reset.ts` (already exists — verify)
  - [ ] 2.4 Ensure 1-hour expiry on reset tokens (Supabase default)

- [ ] **Task 3: New Password Form** (AC: 4, 5, 6)
  - [ ] 3.1 Create password update form with new password + confirm password fields
  - [ ] 3.2 Add password strength indicator (reuse from registration)
  - [ ] 3.3 Validate: 8+ chars, 1 uppercase letter, 1 number
  - [ ] 3.4 Call Supabase Auth `updateUser({ password })` on submit
  - [ ] 3.5 On success: redirect to `/auth/login?reset=true` with success toast

- [ ] **Task 4: Edge Cases** (AC: 7, 8)
  - [ ] 4.1 Handle expired token — show friendly message with "Request new link" button
  - [ ] 4.2 Handle already-used token — show message with login link
  - [ ] 4.3 Handle invalid/malformed token gracefully

- [ ] **Task 5: Testing** (All ACs)
  - [ ] 5.1 Unit test: password strength validation logic
  - [ ] 5.2 Unit test: form validation (email format, password match)
  - [ ] 5.3 Integration test: reset request → email sent (mock Supabase)
  - [ ] 5.4 Integration test: valid token → password updated
  - [ ] 5.5 Integration test: expired token → error message

## Dev Notes

### Architecture Alignment
- **Auth Flow**: Supabase Auth handles token generation, expiry, and validation
- **Email**: Password reset template already exists at `packages/email/src/templates/password-reset.ts`
- **Existing Route**: `apps/web/src/app/auth/change-password/` directory already exists

### Key Technical Decisions
- Use Supabase's built-in password reset flow (no custom token management)
- Generic success messages to prevent email enumeration attacks
- Reuse PasswordStrengthIndicator component from registration page

### Prerequisites
- Story 8.2 (Client Login) — login page has "Forgot Password?" link
- Story 7.1 (Email Service) — Resend integration for sending reset emails

### References
- [Source: docs/stories/tech-spec-epic-8.md#Security]
- [Source: docs/architecture.md#Authentication]

**Story Points:** 2

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted with proper BMAD ACs | SM Agent (Party Mode) |
