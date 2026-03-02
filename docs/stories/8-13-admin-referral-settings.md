# Story 8.13: Admin Referral Settings

Status: drafted

## Story

As an **admin**,
I want **to configure referral program settings**,
so that **I can control discount percentages, reward amounts, and payout thresholds**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Admin settings page at `/admin/settings` includes a "Referral Program" section | Visual |
| 2 | Configurable fields: program enabled/disabled toggle, new client discount type (percentage/fixed), new client discount value, referrer reward type (percentage/fixed), referrer reward value, minimum payout amount | Visual |
| 3 | Saving settings persists values to `referral_settings` table | Integration |
| 4 | Changes apply to NEW referrals only (existing referrals keep their original terms) | Integration |
| 5 | Toggling program off hides the referral code field from registration and disables referral features for new users | Integration |
| 6 | Default values are pre-populated: 10% discount, ₱100 reward, ₱500 minimum payout | Integration |
| 7 | Validation: discount cannot exceed 50%, reward cannot exceed ₱1000, minimum payout >= ₱100 | Validation |

## Tasks / Subtasks

- [ ] **Task 1: Referral Settings Form** (AC: 1, 2, 6)
  - [ ] 1.1 Create `apps/web/src/components/admin/referral-settings-form.tsx`
  - [ ] 1.2 Fields: program_enabled (toggle), discount_type (select), discount_value (number), reward_type (select), reward_value (number), minimum_payout (number)
  - [ ] 1.3 Pre-populate with current values from `referral_settings` table
  - [ ] 1.4 Default values when no settings exist

- [ ] **Task 2: Settings Integration** (AC: 1, 3)
  - [ ] 2.1 Add referral settings section to `/admin/settings` page
  - [ ] 2.2 Create server action to save settings
  - [ ] 2.3 Upsert into `referral_settings` table

- [ ] **Task 3: Validation** (AC: 7)
  - [ ] 3.1 Zod schema for referral settings validation
  - [ ] 3.2 Discount max: 50%
  - [ ] 3.3 Reward max: ₱1,000
  - [ ] 3.4 Minimum payout: ₱100 minimum

- [ ] **Task 4: Program Toggle** (AC: 5)
  - [ ] 4.1 When disabled: registration page hides referral code field
  - [ ] 4.2 When disabled: referral features hidden from client dashboard
  - [ ] 4.3 Read `program_enabled` flag in registration and dashboard pages

- [ ] **Task 5: Testing** (All ACs)
  - [ ] 5.1 Unit test: settings form validation (Zod schema)
  - [ ] 5.2 Integration test: save settings → persisted to database
  - [ ] 5.3 Integration test: program toggle → registration hides/shows referral field
  - [ ] 5.4 Unit test: default values loaded when no settings exist

## Dev Notes

### Architecture Alignment
- **Settings Page**: Extend existing `/admin/settings` page (already has payment settings)
- **Database**: `referral_settings` table (created in migration 00008)
- **Pattern**: Follow existing `payment-settings-form.tsx` pattern

### Prerequisites
- Story 3.9 (Payment Settings) — existing settings page to extend

### References
- [Source: docs/stories/tech-spec-epic-8.md#Detailed-Design]
- [Source: docs/epics.md#Story-8.13]

**Story Points:** 2

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted with proper BMAD ACs | SM Agent (Party Mode) |
