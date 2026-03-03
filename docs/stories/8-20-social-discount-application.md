# Story 8.20: Social Discount Application

Status: review

## Story

As a **client with verified social rewards**,
I want **my social discounts added to my reward balance**,
so that **I can use them on future orders alongside referral rewards**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | When a social claim is verified, the discount amount is added to client's `reward_balance` | Integration |
| 2 | A `reward_transactions` entry with type='social_reward' is created with the exact amount and updated balance | Integration |
| 3 | Client's rewards dashboard shows combined total from both referral and social sources | Visual |
| 4 | Transaction history on referral dashboard distinguishes between 'referral_reward' and 'social_reward' types | Visual |
| 5 | Social rewards use the same redemption options as referral rewards (apply to order or cash payout) | Integration |
| 6 | Reward balance shown on dashboard home reflects all reward sources combined | Visual |

## Tasks / Subtasks

- [ ] **Task 1: Unified Reward Balance** (AC: 1, 2)
  - [ ] 1.1 Verify social claim verification (Story 8.19) adds to same `reward_balance` field
  - [ ] 1.2 Verify `reward_transactions` entry created with type='social_reward'
  - [ ] 1.3 Verify `balance_after` is correct (previous balance + social reward amount)

- [ ] **Task 2: Transaction History Display** (AC: 3, 4)
  - [ ] 2.1 Update referral dashboard to show all `reward_transactions` (not just referral)
  - [ ] 2.2 Add transaction type labels: "Referral Reward", "Social Reward", "Redemption", "Payout"
  - [ ] 2.3 Add icons or color coding per transaction type
  - [ ] 2.4 Show running balance in transaction history

- [ ] **Task 3: Dashboard Integration** (AC: 6)
  - [ ] 3.1 Dashboard home reward balance card queries `profiles.reward_balance` (already unified)
  - [ ] 3.2 Optionally show breakdown: "₱X from referrals, ₱Y from social"

- [ ] **Task 4: Verify Redemption Compatibility** (AC: 5)
  - [ ] 4.1 Verify "Apply to Next Order" works with social rewards in balance
  - [ ] 4.2 Verify "Request Cash Payout" works with social rewards in balance
  - [ ] 4.3 No distinction needed — unified balance for all redemption

- [ ] **Task 5: Testing** (All ACs)
  - [ ] 5.1 Integration test: social reward + referral reward → combined balance correct
  - [ ] 5.2 Integration test: transaction history shows both types
  - [ ] 5.3 Integration test: apply combined balance to order
  - [ ] 5.4 Unit test: transaction type labels and icons

## Dev Notes

### Architecture Alignment
- **Unified Balance**: All reward types share `profiles.reward_balance`
- **Audit Trail**: `reward_transactions` with `type` field distinguishes sources
- **Redemption**: Same flow for all reward types (Story 8.12)

### Key Technical Decisions
- Single reward_balance — no separate social vs referral balances
- Transaction history provides the breakdown via type field
- All balance operations go through reward_transactions for auditability

### Prerequisites
- Story 8.19 (Admin Verification) — social rewards are verified and added
- Story 8.12 (Reward Redemption) — redemption options exist

### References
- [Source: docs/stories/tech-spec-epic-8.md#Data-Models]
- [Source: docs/epics.md#Story-8.20]

**Story Points:** 2

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted with proper BMAD ACs | SM Agent (Party Mode) |
