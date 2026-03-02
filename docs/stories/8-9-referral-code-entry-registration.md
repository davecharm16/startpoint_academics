# Story 8.9: Referral Code Entry on Registration

Status: drafted

## Story

As a **new visitor with a referral code**,
I want **the code to be recognized when I register**,
so that **I get my discount and my referrer gets credit**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Landing on `/auth/register?ref=CODE` pre-fills the referral code field | E2E |
| 2 | A banner appears when referral code is pre-filled: "You've been referred! You'll get a discount on your first order." | Visual |
| 3 | Valid referral code is validated on form submission (case-insensitive) | Integration |
| 4 | Invalid referral code shows inline error "Invalid referral code" but does NOT block registration | E2E |
| 5 | User can clear the referral code field and register without one | E2E |
| 6 | On successful registration with valid code, a `referrals` record is created linking referrer to referred | Integration |
| 7 | Referred user's profile has `referred_by` set to the referrer's user ID | Integration |

## Tasks / Subtasks

- [ ] **Task 1: Verify Pre-fill from URL** (AC: 1, 2)
  - [ ] 1.1 Verify `apps/web/src/app/auth/register/page.tsx` reads `?ref=` query param (already implemented in 8-1)
  - [ ] 1.2 Verify referral code field is pre-filled
  - [ ] 1.3 Verify banner appears when ref param is present
  - [ ] 1.4 Add `?email=` pre-fill support (from Story 8.6)

- [ ] **Task 2: Validate Code Handling** (AC: 3, 4, 5)
  - [ ] 2.1 Verify server action validates code case-insensitively (already implemented in 8-1)
  - [ ] 2.2 Verify invalid code shows error but allows registration without code
  - [ ] 2.3 Verify user can clear referral code and register

- [ ] **Task 3: Referral Record Creation** (AC: 6, 7)
  - [ ] 3.1 Verify referral record created in `referrals` table on registration with valid code
  - [ ] 3.2 Verify `referred_by` field set on new user's profile
  - [ ] 3.3 Verify referral record status is 'signed_up' (not 'converted' yet)

- [ ] **Task 4: Testing** (All ACs)
  - [ ] 4.1 Unit test: query param parsing for ref and email
  - [ ] 4.2 Integration test: register with valid referral code → referral record created
  - [ ] 4.3 Integration test: register with invalid code → error shown, can still register without code
  - [ ] 4.4 Integration test: register without code → no referral record
  - [ ] 4.5 Unit test: case-insensitive code matching

## Dev Notes

### Scope Note (Reduced from Original)
The core referral code entry and validation logic was implemented in Story 8.1. This story focuses on **verification, edge cases, and testing** of that functionality, plus adding email pre-fill from Story 8.6.

### Architecture Alignment
- **Registration**: `apps/web/src/app/auth/register/actions.ts` — already handles referral validation
- **Database**: `referrals` table and `profiles.referred_by` — already in migration 00008

### Key Technical Decisions
- Invalid referral codes should NOT block registration — show warning but allow proceeding
- Case-insensitive matching via SQL `LOWER()` function
- Referral record starts as 'signed_up' — converts to 'converted' when first project submitted (Story 8.10)

### Prerequisites
- Story 8.1 (Registration) — base implementation
- Story 8.6 (Guest Compatibility) — email pre-fill integration

### References
- [Source: docs/stories/tech-spec-epic-8.md#Client-Registration-Flow]
- [Source: docs/epics.md#Story-8.9]

**Story Points:** 2

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted with reduced scope (verification & testing of 8-1 implementation) | SM Agent (Party Mode) |
