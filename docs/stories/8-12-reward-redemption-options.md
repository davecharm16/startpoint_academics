# Story 8.12: Reward Redemption Options

Status: review

## Story

As a **client with available rewards**,
I want **to choose how to use my rewards — apply to orders or request cash payout**,
so that **I can benefit from my referral activity**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Referral dashboard shows current reward balance prominently | Visual |
| 2 | Two redemption options are available: "Apply to Next Order" and "Request Cash Payout" | Visual |
| 3 | "Apply to Next Order" sets a flag that auto-applies balance as discount on next submission | Integration |
| 4 | When reward is applied to order, `reward_balance` decreases by the applied amount | Integration |
| 5 | A `reward_transactions` entry is created with type='redemption' for order applications | Integration |
| 6 | "Request Cash Payout" opens a form for payment details (GCash or bank, account number, account name) | Visual |
| 7 | Payout request requires minimum balance (from `referral_settings.minimum_payout`) | Validation |
| 8 | Payout request creates a `payout_requests` record with status='pending' | Integration |
| 9 | Client receives confirmation that payout request is submitted and awaiting admin approval | Visual |
| 10 | Reward balance is put on hold (cannot be used) during pending payout | Integration |

## Tasks / Subtasks

- [ ] **Task 1: Reward Balance Display** (AC: 1, 2)
  - [ ] 1.1 Update referral dashboard to show balance card prominently
  - [ ] 1.2 Add two action buttons: "Apply to Next Order", "Request Cash Payout"
  - [ ] 1.3 Disable buttons if balance is zero

- [ ] **Task 2: Apply to Order Flow** (AC: 3, 4, 5)
  - [ ] 2.1 Add `apply_rewards_to_next_order` flag to profiles
  - [ ] 2.2 Update submission flow to check flag and apply balance
  - [ ] 2.3 Calculate: apply MIN(reward_balance, order_total) as discount
  - [ ] 2.4 Create reward_transaction with type='redemption', negative amount
  - [ ] 2.5 Update profiles.reward_balance

- [ ] **Task 3: Cash Payout Request** (AC: 6, 7, 8, 9, 10)
  - [ ] 3.1 Create `apps/web/src/components/client/payout-request-form.tsx`
  - [ ] 3.2 Form fields: payment method (GCash/Bank), account number, account name, amount
  - [ ] 3.3 Validate minimum payout threshold from settings
  - [ ] 3.4 Create API route or server action for payout request
  - [ ] 3.5 Insert into `payout_requests` table with status='pending'
  - [ ] 3.6 Put requested amount on hold (deduct from available balance)
  - [ ] 3.7 Show success confirmation

- [ ] **Task 4: Database Migration** (AC: 8, 10)
  - [ ] 4.1 Create `payout_requests` table if not in migration 00008
  - [ ] 4.2 Fields: id, user_id, amount, payment_method, payment_details (JSONB), status, processed_by, processed_at, created_at
  - [ ] 4.3 RLS policies: clients see own requests, admins see all

- [ ] **Task 5: Testing** (All ACs — TDD CRITICAL)
  - [ ] 5.1 Unit test: reward application calculation (full balance, partial balance)
  - [ ] 5.2 Unit test: minimum payout validation
  - [ ] 5.3 Integration test: apply rewards → balance decreases → transaction created
  - [ ] 5.4 Integration test: payout request → record created → balance on hold
  - [ ] 5.5 Integration test: cannot create payout if balance below minimum
  - [ ] 5.6 Integration test: cannot double-spend (apply + payout simultaneously)

## Dev Notes

### Architecture Alignment
- **Database**: `payout_requests` table, `reward_transactions` table
- **Submission Flow**: Must check for reward application in submit-project route
- **Balance Integrity**: All balance changes must go through reward_transactions for audit

### Risk Assessment (from Murat/TEA)
- **HIGH RISK**: Double-spending prevention — cannot apply rewards AND request payout for same amount
- Use database constraints and transaction checks
- Balance on hold during pending payout prevents overspend

### Prerequisites
- Story 8.11 (Reward Tracking) — rewards exist in balance
- Story 8.8 (Referral Dashboard) — display context

### References
- [Source: docs/stories/tech-spec-epic-8.md#APIs-and-Interfaces]
- [Source: docs/epics.md#Story-8.12]

**Story Points:** 5

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted — flagged as HIGH RISK requiring TDD for money flow | SM Agent (Party Mode) |
