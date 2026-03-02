# Story 8.11: Referrer Reward Tracking

Status: drafted

## Story

As a **referrer**,
I want **to earn rewards when my referrals convert**,
so that **I'm incentivized to refer more friends**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | When a referred client's first project payment is validated, the referrer earns a reward with status 'pending' | Integration |
| 2 | When the referred project is completed (status='complete'), the reward status changes to 'available' | Integration |
| 3 | A `reward_transactions` entry is created with type='referral_reward', the correct amount, and updated balance | Integration |
| 4 | Referrer's `profiles.reward_balance` is updated when reward becomes 'available' | Integration |
| 5 | Reward amount matches `referral_settings.referrer_reward_value` (fixed or percentage of order) | Integration |
| 6 | Referrer receives email notification when reward becomes available | Integration |
| 7 | Referral dashboard (Story 8.8) reflects updated reward amounts in real-time | E2E |

## Tasks / Subtasks

- [ ] **Task 1: Reward Creation on Conversion** (AC: 1, 5)
  - [ ] 1.1 In the submission/payment validation flow, after referral converts (Story 8.10):
  - [ ] 1.2 Calculate reward amount from `referral_settings` (fixed ₱ amount or % of order)
  - [ ] 1.3 Create `reward_transactions` entry: type='referral_reward', status='pending'
  - [ ] 1.4 Update `referrals` record: `reward_amount`, `reward_status='pending'`

- [ ] **Task 2: Reward Activation on Project Completion** (AC: 2, 3, 4)
  - [ ] 2.1 Create utility function `activateReferralReward(projectId)`
  - [ ] 2.2 Hook into project status change to 'complete' (in project status actions)
  - [ ] 2.3 Find associated referral record via project's client
  - [ ] 2.4 Update reward_status from 'pending' to 'available'
  - [ ] 2.5 Add reward amount to referrer's `profiles.reward_balance`
  - [ ] 2.6 Create `reward_transactions` entry with updated balance_after

- [ ] **Task 3: Email Notification** (AC: 6)
  - [ ] 3.1 Create email template `packages/email/src/templates/referral-reward-earned.ts`
  - [ ] 3.2 Include: referrer name, amount earned, total balance, dashboard link
  - [ ] 3.3 Send on reward activation (status → 'available')

- [ ] **Task 4: Testing** (All ACs — TDD CRITICAL)
  - [ ] 4.1 Unit test: reward amount calculation (fixed amount)
  - [ ] 4.2 Unit test: reward amount calculation (percentage of order)
  - [ ] 4.3 Integration test: conversion → pending reward created
  - [ ] 4.4 Integration test: project complete → reward activated → balance updated
  - [ ] 4.5 Integration test: reward transaction audit trail correct
  - [ ] 4.6 Unit test: balance_after calculation accuracy
  - [ ] 4.7 Integration test: email sent on reward activation

## Dev Notes

### Architecture Alignment
- **Reward Flow**: pending (on conversion) → available (on project completion)
- **Balance Updates**: Transactional — reward_transaction + balance update must be atomic
- **Idempotency**: Check if reward already exists before creating (prevent double rewards)

### Risk Assessment (from Murat/TEA)
- **HIGH RISK**: Balance updates must be atomic and idempotent
- Use Supabase transactions or RPC function for atomic balance updates
- Verify: balance_after = previous_balance + reward_amount

### Prerequisites
- Story 8.10 (Discount Application) — creates referral conversion
- Story 8.8 (Referral Dashboard) — displays reward data

### References
- [Source: docs/stories/tech-spec-epic-8.md#Referral-Conversion-Flow]
- [Source: docs/epics.md#Story-8.11]

**Story Points:** 3

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted — flagged as HIGH RISK requiring TDD | SM Agent (Party Mode) |
