# Story 8.21: Client Social Rewards Dashboard

Status: review

## Story

As a **client**,
I want **to see my social engagement status and earned rewards in one view**,
so that **I know which actions I've completed and what I've earned**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | `/client/social-rewards` page shows all social actions with their current status per client | Visual |
| 2 | Available actions (not yet claimed) show "Claim Reward" button with discount amount | Visual |
| 3 | Pending actions show "Awaiting Verification" badge with submission date | Visual |
| 4 | Verified actions show "Verified" badge with earned amount and verification date | Visual |
| 5 | Rejected actions show "Rejected" badge with reason and "Resubmit" button | Visual |
| 6 | Progress indicator shows completion: "X of Y social rewards claimed" | Visual |
| 7 | Summary card shows total earned from social rewards | Visual |
| 8 | Instructions for each action include the social media URL to visit | Visual |

## Tasks / Subtasks

- [ ] **Task 1: Social Rewards Dashboard** (AC: 1, 6, 7)
  - [ ] 1.1 Update `apps/web/src/app/(auth)/client/social-rewards/page.tsx` (from Story 8.17)
  - [ ] 1.2 Progress bar: "X of Y completed"
  - [ ] 1.3 Summary card: total earned from social rewards
  - [ ] 1.4 Query social_reward_settings (enabled actions) and social_claims (user's claims)

- [ ] **Task 2: Action Status Cards** (AC: 2, 3, 4, 5, 8)
  - [ ] 2.1 Refine `apps/web/src/components/client/social-action-card.tsx` (from Story 8.17)
  - [ ] 2.2 State: Available → show instructions, social URL, discount amount, "Claim" button
  - [ ] 2.3 State: Pending → "Awaiting Verification" badge, submission date, disable claim
  - [ ] 2.4 State: Verified → green badge, earned amount, verification date
  - [ ] 2.5 State: Rejected → red badge, rejection reason text, "Resubmit" button

- [ ] **Task 3: Instructions Enhancement** (AC: 8)
  - [ ] 3.1 Show instruction text from social_reward_settings
  - [ ] 3.2 Show social media URL as clickable link (opens in new tab)
  - [ ] 3.3 Step-by-step guide: "1. Visit our page, 2. Like/Follow/Share, 3. Take a screenshot, 4. Click Claim"

- [ ] **Task 4: Testing** (All ACs)
  - [ ] 4.1 Unit test: progress indicator calculation
  - [ ] 4.2 Unit test: all 4 card states render correctly
  - [ ] 4.3 Unit test: summary total calculation
  - [ ] 4.4 Integration test: page renders with correct data from DB
  - [ ] 4.5 Integration test: resubmit after rejection opens claim form

## Dev Notes

### Architecture Alignment
- **Page**: Same page as Story 8.17 — this story refines the display and adds dashboard features
- **Components**: Refines social-action-card.tsx from Story 8.17
- **Data**: Combines `social_reward_settings` (config) + `social_claims` (user data)

### Key Technical Decisions
- This story is mostly UI refinement on top of Story 8.17's foundation
- Progress indicator is calculated client-side from available data
- Total earned = SUM of discount_amount WHERE status='verified'

### Prerequisites
- Story 8.17 (Social Claims) — base page and claim submission
- Story 8.19 (Admin Verification) — claims have been processed

### References
- [Source: docs/epics.md#Story-8.21]
- [Source: docs/stories/tech-spec-epic-8.md#Social-Claim-Flow]

**Story Points:** 2

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted with proper BMAD ACs | SM Agent (Party Mode) |
