# Story 8.18: Admin Social Action Configuration

Status: review

## Story

As an **admin**,
I want **to configure social media reward amounts and actions**,
so that **I can control marketing spend and manage which social actions are rewarded**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Admin settings page includes a "Social Rewards" section | Visual |
| 2 | For each action type (Like Page, Follow Page, Share Post), admin can set: discount amount (₱), enabled/disabled toggle, instruction text for clients | Visual |
| 3 | Admin can set the social media page URLs (Facebook page link, etc.) displayed as references | Visual |
| 4 | Saving settings persists to `social_reward_settings` table | Integration |
| 5 | Toggling an action off hides it from client social rewards page immediately | Integration |
| 6 | Default values: Like Page ₱50, Follow Page ₱50, Share Post ₱100 (all enabled) | Integration |
| 7 | Validation: discount amount must be ₱0-₱500 per action | Validation |

## Tasks / Subtasks

- [ ] **Task 1: Social Settings Form** (AC: 1, 2, 3, 6)
  - [ ] 1.1 Create `apps/web/src/components/admin/social-settings-form.tsx`
  - [ ] 1.2 Three sections (one per action type): Like Page, Follow Page, Share Post
  - [ ] 1.3 Each section: enabled toggle, discount amount, instruction text, social URL
  - [ ] 1.4 Pre-populate with current values or defaults

- [ ] **Task 2: Settings Persistence** (AC: 4)
  - [ ] 2.1 Server action to upsert social_reward_settings
  - [ ] 2.2 One row per action type in the table
  - [ ] 2.3 Success feedback on save

- [ ] **Task 3: Integration with Admin Settings** (AC: 1)
  - [ ] 3.1 Add "Social Rewards" section to `/admin/settings` page
  - [ ] 3.2 Position after Referral Program section

- [ ] **Task 4: Validation** (AC: 7)
  - [ ] 4.1 Zod schema: discount amount 0-500, instruction text max 500 chars
  - [ ] 4.2 URL format validation for social links

- [ ] **Task 5: Testing** (All ACs)
  - [ ] 5.1 Unit test: form validation (Zod schema)
  - [ ] 5.2 Integration test: save settings → persisted
  - [ ] 5.3 Integration test: toggle off → client page hides action
  - [ ] 5.4 Unit test: default values load correctly

## Dev Notes

### Architecture Alignment
- **Settings Page**: Extend `/admin/settings` (already has payment + referral settings)
- **Database**: `social_reward_settings` table with per-action rows
- **Pattern**: Follow referral-settings-form.tsx pattern

### Prerequisites
- Story 8.13 (Admin Referral Settings) — settings page pattern established

### References
- [Source: docs/stories/tech-spec-epic-8.md#Social-Claim-Flow]
- [Source: docs/epics.md#Story-8.18]

**Story Points:** 2

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted with proper BMAD ACs | SM Agent (Party Mode) |
