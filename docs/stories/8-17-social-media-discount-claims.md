# Story 8.17: Social Media Discount Claims

Status: drafted

## Story

As a **registered client**,
I want **to claim discounts for engaging with Startpoint Academics on social media**,
so that **I can save money on my orders by liking, following, and sharing**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | `/client/social-rewards` page shows available social actions: Like Page, Follow Page, Share Post | Visual |
| 2 | Each action shows its discount value (from `social_reward_settings`) and instructions | Visual |
| 3 | Clicking "Claim Reward" for an action opens a submission form with: social media username/profile link and screenshot upload | Visual |
| 4 | Screenshot upload accepts JPG, PNG, WebP (max 5MB) and shows preview | E2E |
| 5 | Screenshot is stored in Supabase Storage `social-proofs` bucket under user's folder | Integration |
| 6 | Submitting a claim creates a `social_claims` record with status='pending' | Integration |
| 7 | Already-claimed actions show their status (Pending/Verified/Rejected) instead of "Claim" button | Visual |
| 8 | Each action type is claimable only once per client (no duplicates) | Integration |
| 9 | Rejected claims show rejection reason and allow re-submission | Visual |
| 10 | Disabled social actions (from admin settings) are not shown | Integration |

## Tasks / Subtasks

- [ ] **Task 1: Social Rewards Page** (AC: 1, 2, 10)
  - [ ] 1.1 Create `apps/web/src/app/(auth)/client/social-rewards/page.tsx`
  - [ ] 1.2 Fetch enabled actions from `social_reward_settings`
  - [ ] 1.3 Fetch existing claims from `social_claims` WHERE `user_id = auth.uid()`
  - [ ] 1.4 Display each action: name, discount value, instructions, status

- [ ] **Task 2: Social Action Card Component** (AC: 1, 7, 9)
  - [ ] 2.1 Create `apps/web/src/components/client/social-action-card.tsx`
  - [ ] 2.2 States: Available (with "Claim" button), Pending, Verified, Rejected (with "Resubmit")
  - [ ] 2.3 Color-coded badges: pending (yellow), verified (green), rejected (red)

- [ ] **Task 3: Claim Submission Form** (AC: 3, 4, 5, 6, 8)
  - [ ] 3.1 Create `apps/web/src/components/client/social-claim-form.tsx`
  - [ ] 3.2 Dialog/modal with: social username input, screenshot upload
  - [ ] 3.3 Screenshot validation: JPG/PNG/WebP, max 5MB
  - [ ] 3.4 Image preview before submit
  - [ ] 3.5 Upload to Supabase Storage: `social-proofs/{user_id}/{action_type}.{ext}`
  - [ ] 3.6 Create server action/API route for claim submission
  - [ ] 3.7 Check for existing claim (prevent duplicates per action type)

- [ ] **Task 4: Database & Storage** (AC: 5, 6)
  - [ ] 4.1 Create migration for `social_claims` table (if not in 00008)
  - [ ] 4.2 Create migration for `social_reward_settings` table (if not in 00008)
  - [ ] 4.3 Create `social-proofs` storage bucket with RLS policies
  - [ ] 4.4 RLS: clients upload to own folder, admins read all

- [ ] **Task 5: Testing** (All ACs)
  - [ ] 5.1 Unit test: file validation (type, size)
  - [ ] 5.2 Unit test: social action card states render correctly
  - [ ] 5.3 Integration test: claim submission → record created, file uploaded
  - [ ] 5.4 Integration test: duplicate claim prevention
  - [ ] 5.5 Integration test: rejected claim allows resubmission
  - [ ] 5.6 Integration test: disabled actions not shown

## Dev Notes

### Architecture Alignment
- **Storage**: New `social-proofs` bucket in Supabase Storage
- **Database**: `social_claims` and `social_reward_settings` tables
- **Pattern**: Follow payment screenshot upload pattern from Story 2.3

### Key Technical Decisions
- One claim per action type per client (unique constraint on user_id + action_type)
- Rejected claims: update existing record status, allow new screenshot upload
- Screenshots stored in user-specific folders for RLS enforcement
- Action types: 'like_page', 'follow_page', 'share_post'

### Prerequisites
- Story 8.4 (Dashboard Layout) — navigation includes Social Rewards link
- Story 8.18 (Admin Configuration) — settings define available actions (can develop in parallel)

### References
- [Source: docs/stories/tech-spec-epic-8.md#Social-Claim-Flow]
- [Source: docs/epics.md#Story-8.17]

**Story Points:** 5

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted with proper BMAD ACs | SM Agent (Party Mode) |
