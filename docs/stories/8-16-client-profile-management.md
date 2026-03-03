# Story 8.16: Client Profile Management

Status: review

## Story

As a **registered client**,
I want **to view and update my profile information**,
so that **my contact details are always current**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | `/client/profile` page shows current profile: full name, email, phone, referral code (read-only) | Visual |
| 2 | Client can update full name and phone number with success confirmation | E2E |
| 3 | Client can change email — triggers verification email to new address before update takes effect | Integration |
| 4 | Client can change password — requires entering current password and new password that meets strength requirements | E2E |
| 5 | Password strength indicator shows on password change form (same as registration) | Visual |
| 6 | Referral code is displayed as read-only (cannot be changed) | Visual |
| 7 | All form inputs have proper validation with inline error messages | Unit |

## Tasks / Subtasks

- [ ] **Task 1: Profile Page** (AC: 1, 6)
  - [ ] 1.1 Create `apps/web/src/app/(auth)/client/profile/page.tsx`
  - [ ] 1.2 Fetch current profile from Supabase (server-side)
  - [ ] 1.3 Display: full name, email, phone, referral code (read-only badge)

- [ ] **Task 2: Profile Update Form** (AC: 2, 7)
  - [ ] 2.1 Create `apps/web/src/components/client/profile-form.tsx`
  - [ ] 2.2 Editable fields: full name, phone
  - [ ] 2.3 Zod validation: name (2+ chars), phone (valid format)
  - [ ] 2.4 Server action to update `profiles` table
  - [ ] 2.5 Success toast on save

- [ ] **Task 3: Email Change** (AC: 3)
  - [ ] 3.1 Email change form section (separate from profile update)
  - [ ] 3.2 Call Supabase Auth `updateUser({ email: newEmail })`
  - [ ] 3.3 Show message: "Verification email sent to new address"
  - [ ] 3.4 Email doesn't change until verified

- [ ] **Task 4: Password Change** (AC: 4, 5)
  - [ ] 4.1 Password change section (separate from profile update)
  - [ ] 4.2 Fields: current password, new password, confirm new password
  - [ ] 4.3 Verify current password via Supabase Auth `signInWithPassword()`
  - [ ] 4.4 Validate new password strength (8+ chars, 1 uppercase, 1 number)
  - [ ] 4.5 Call `updateUser({ password: newPassword })`
  - [ ] 4.6 Reuse PasswordStrengthIndicator component from registration

- [ ] **Task 5: Testing** (All ACs)
  - [ ] 5.1 Unit test: profile form validation (Zod schema)
  - [ ] 5.2 Unit test: password strength validation
  - [ ] 5.3 Integration test: update name/phone → persisted
  - [ ] 5.4 Integration test: email change → verification required
  - [ ] 5.5 Integration test: password change → current password verified first

## Dev Notes

### Architecture Alignment
- **Auth**: Supabase Auth handles email change verification and password updates
- **Profile**: `profiles` table for name/phone updates
- **Pattern**: Separate sections for profile info, email change, password change

### Key Technical Decisions
- Three separate forms/sections to avoid accidental changes
- Email change uses Supabase's built-in verification flow
- Current password required for password change (security)
- Referral code is NEVER editable

### Prerequisites
- Story 8.4 (Dashboard Layout) — navigation includes Profile link

### References
- [Source: docs/epics.md#Story-8.16]
- [Source: docs/stories/tech-spec-epic-8.md#Security]

**Story Points:** 3

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted with proper BMAD ACs | SM Agent (Party Mode) |
