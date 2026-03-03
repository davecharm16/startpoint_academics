# Story 8.14: Admin Referral Analytics

Status: review

## Story

As an **admin**,
I want **to view referral program performance metrics**,
so that **I can measure marketing ROI and identify top referrers**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | `/admin/referrals` page displays overview stats: total referrals, total conversions, conversion rate (%), total rewards paid (₱), revenue from referred clients (₱) | E2E |
| 2 | Leaderboard section shows top referrers ranked by conversions with: name, referral code, signups, conversions, total rewards earned | Visual |
| 3 | Clicking a referrer in the leaderboard shows their individual referral details | E2E |
| 4 | Date range filter allows filtering analytics by custom period | E2E |
| 5 | Stats update in real-time as new referrals and conversions occur | Integration |
| 6 | Empty state shows when no referral data exists | Visual |

## Tasks / Subtasks

- [ ] **Task 1: Admin Referrals Page** (AC: 1, 6)
  - [ ] 1.1 Create `apps/web/src/app/(auth)/admin/referrals/page.tsx`
  - [ ] 1.2 Stats cards: Total Referrals, Conversions, Conversion Rate, Total Rewards Paid, Referred Revenue
  - [ ] 1.3 Query `referrals` table with aggregations
  - [ ] 1.4 Use `referral_leaderboard` view for top referrers
  - [ ] 1.5 Empty state when no data

- [ ] **Task 2: Leaderboard Component** (AC: 2, 3)
  - [ ] 2.1 Create `apps/web/src/components/admin/referral-leaderboard.tsx`
  - [ ] 2.2 Table: rank, name, code, signups, conversions, rewards earned
  - [ ] 2.3 Click row → expand to show individual referral details
  - [ ] 2.4 Sort by conversions DESC

- [ ] **Task 3: Date Range Filter** (AC: 4)
  - [ ] 3.1 Add date range selector (presets: This Week, This Month, Last 30 Days, Custom)
  - [ ] 3.2 Filter all queries by selected range
  - [ ] 3.3 Update stats cards and leaderboard on filter change

- [ ] **Task 4: Add Navigation** (AC: 1)
  - [ ] 4.1 Add "Referrals" link to admin sidebar navigation
  - [ ] 4.2 Position after "Payments" in navigation order

- [ ] **Task 5: Testing** (All ACs)
  - [ ] 5.1 Unit test: conversion rate calculation
  - [ ] 5.2 Unit test: leaderboard sorting logic
  - [ ] 5.3 Integration test: stats match actual database data
  - [ ] 5.4 Integration test: date filter produces correct results
  - [ ] 5.5 Unit test: empty state renders

## Dev Notes

### Architecture Alignment
- **Database View**: `referral_leaderboard` view (created in migration 00008)
- **Admin Navigation**: `apps/web/src/components/layout/admin-sidebar.tsx`
- **Pattern**: Follow existing admin pages (payments, writers)

### Prerequisites
- Story 8.11 (Reward Tracking) — referral and reward data exists
- Story 3.2 (Admin Dashboard Layout) — admin sidebar navigation

### References
- [Source: docs/stories/tech-spec-epic-8.md#Acceptance-Criteria]
- [Source: docs/epics.md#Story-8.14]

**Story Points:** 3

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted with proper BMAD ACs | SM Agent (Party Mode) |
