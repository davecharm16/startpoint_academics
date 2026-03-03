# Story 8.7: Referral Code Display & Sharing

Status: review

## Story

As a **registered client**,
I want **to see my referral code prominently and easily share it**,
so that **I can invite friends and earn rewards**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Referral code is displayed prominently on the client dashboard home page | Visual |
| 2 | A shareable referral link is shown (e.g., `https://startpointacademics.com/auth/register?ref=DAVE2024`) | Visual |
| 3 | "Copy Link" button copies the full referral URL to clipboard and shows "Copied!" feedback | E2E |
| 4 | "Copy Code" button copies just the referral code to clipboard | E2E |
| 5 | Referral code section includes brief explanation: "Share this code with friends — they get X% off, you earn ₱Y!" | Visual |
| 6 | Discount and reward amounts are fetched from `referral_settings` (not hardcoded) | Integration |

## Tasks / Subtasks

- [ ] **Task 1: Referral Code Display Component** (AC: 1, 2, 5, 6)
  - [ ] 1.1 Create `apps/web/src/components/client/referral-code-card.tsx`
  - [ ] 1.2 Display referral code in large, bold text
  - [ ] 1.3 Display full shareable URL below the code
  - [ ] 1.4 Fetch discount/reward values from `referral_settings` table
  - [ ] 1.5 Show explanation text with actual values (e.g., "They get 10% off, you earn ₱100")

- [ ] **Task 2: Copy-to-Clipboard Functionality** (AC: 3, 4)
  - [ ] 2.1 Implement "Copy Link" button using `navigator.clipboard.writeText()`
  - [ ] 2.2 Implement "Copy Code" button for just the code
  - [ ] 2.3 Show "Copied!" toast/feedback for 2 seconds after copy
  - [ ] 2.4 Fallback for browsers without clipboard API

- [ ] **Task 3: Integration with Dashboard** (AC: 1)
  - [ ] 3.1 Include ReferralCodeCard in client dashboard home page
  - [ ] 3.2 Position prominently (above or alongside summary cards)

- [ ] **Task 4: Testing** (All ACs)
  - [ ] 4.1 Unit test: ReferralCodeCard renders code and URL correctly
  - [ ] 4.2 Unit test: copy button triggers clipboard API
  - [ ] 4.3 Integration test: referral settings values are fetched and displayed
  - [ ] 4.4 Unit test: fallback behavior when clipboard API unavailable

## Dev Notes

### Scope Note (Reduced from Original)
Referral code **generation** was completed in Story 8.1. This story focuses on the **display and sharing UI** only. The code already exists in `profiles.referral_code` — we're building the presentation layer.

### Architecture Alignment
- **Data Source**: `profiles.referral_code` (generated at registration)
- **Settings**: `referral_settings` table (created in migration 00008)
- **URL Pattern**: `/auth/register?ref={CODE}` (already handled in registration page)

### Prerequisites
- Story 8.1 (Registration) — referral code generation
- Story 8.4 (Dashboard Layout) — dashboard home page

### References
- [Source: docs/stories/tech-spec-epic-8.md#Referral-Code-Generation]
- [Source: docs/epics.md#Story-8.7]

**Story Points:** 2

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted with reduced scope (display/sharing only, generation done in 8-1) | SM Agent (Party Mode) |
