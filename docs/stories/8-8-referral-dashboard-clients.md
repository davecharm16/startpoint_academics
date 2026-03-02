# Story 8.8: Referral Dashboard for Clients

Status: review

## Story

As a **client with a referral code**,
I want **to see my referral performance and earned rewards**,
so that **I know how my referrals are doing and what I've earned**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | `/client/referrals` page displays referral statistics: total signups, total conversions, conversion rate | E2E |
| 2 | Page shows reward summary: total earned, pending amount, available amount | E2E |
| 3 | Referrals list shows each referred person with: email (masked), signup date, status (signed_up/converted), reward amount | Visual |
| 4 | Referral status badges are color-coded: signed_up (blue), converted (green) | Visual |
| 5 | Reward status badges are color-coded: pending (yellow), available (green), redeemed (gray), paid (green) | Visual |
| 6 | Empty state shows when no referrals exist: "No referrals yet — share your code to get started!" | Visual |
| 7 | Referral code card (from Story 8.7) is included at the top of the page | Visual |

## Tasks / Subtasks

- [ ] **Task 1: Create Referrals Page** (AC: 1, 2, 7)
  - [ ] 1.1 Create `apps/web/src/app/(auth)/client/referrals/page.tsx`
  - [ ] 1.2 Query `referrals` table WHERE `referrer_id = user.id`
  - [ ] 1.3 Calculate stats: total signups (count), conversions (status='converted'), conversion rate
  - [ ] 1.4 Calculate rewards: SUM pending, SUM available from `reward_transactions`
  - [ ] 1.5 Include ReferralCodeCard component at top

- [ ] **Task 2: Stats Cards Component** (AC: 1, 2)
  - [ ] 2.1 Create `apps/web/src/components/client/referral-stats.tsx`
  - [ ] 2.2 Cards: Total Referrals, Conversions, Conversion Rate (%), Total Earned (₱)
  - [ ] 2.3 Use shadcn Card components with icon decorations

- [ ] **Task 3: Referrals List Component** (AC: 3, 4, 5, 6)
  - [ ] 3.1 Create `apps/web/src/components/client/referral-list.tsx`
  - [ ] 3.2 Table/list showing each referral
  - [ ] 3.3 Mask email for privacy (show first 2 chars + domain: `jo***@gmail.com`)
  - [ ] 3.4 Status badges with appropriate colors
  - [ ] 3.5 Reward amount and reward status per referral
  - [ ] 3.6 Empty state with encouraging message and share prompt

- [ ] **Task 4: Testing** (All ACs)
  - [ ] 4.1 Unit test: stats calculation logic
  - [ ] 4.2 Unit test: email masking function
  - [ ] 4.3 Unit test: referral list renders with correct badges
  - [ ] 4.4 Unit test: empty state renders when no referrals
  - [ ] 4.5 Integration test: data fetched correctly from referrals table

## Dev Notes

### Architecture Alignment
- **Data Source**: `referrals` table (created in migration 00008)
- **Rewards**: `reward_transactions` table for audit trail
- **View**: Can use `referral_leaderboard` view for aggregated stats

### Key Technical Decisions
- Email masking is for privacy in the client's own dashboard
- Stats calculated server-side (RSC pattern)
- Reward amounts fetched from actual transactions, not estimates

### Prerequisites
- Story 8.7 (Referral Code Display) — ReferralCodeCard component
- Story 8.4 (Dashboard Layout) — navigation includes Referrals link

### References
- [Source: docs/stories/tech-spec-epic-8.md#Data-Models]
- [Source: docs/epics.md#Story-8.8]

**Story Points:** 3

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted with proper BMAD ACs | SM Agent (Party Mode) |
