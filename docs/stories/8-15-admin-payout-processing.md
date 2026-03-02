# Story 8.15: Admin Payout Processing

Status: drafted

## Story

As an **admin**,
I want **to review and process cash payout requests from referrers**,
so that **referrers receive their earned rewards**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | `/admin/referrals/payouts` page shows pending payout requests with: client name, amount, payment method, account details, request date | E2E |
| 2 | Admin can approve a payout by clicking "Mark as Paid" — updates status to 'paid', records `processed_by` and `processed_at` | Integration |
| 3 | Approving a payout creates a `reward_transactions` entry with type='payout' | Integration |
| 4 | Admin can reject a payout with a reason — updates status to 'rejected', returns funds to client's available balance | Integration |
| 5 | Rejected payout creates a `reward_transactions` entry with type='adjustment' (positive, restoring balance) | Integration |
| 6 | Client receives email notification on payout approval (confirmation + amount) | Integration |
| 7 | Client receives email notification on payout rejection (reason + balance restored) | Integration |
| 8 | Payout list can be filtered by status: pending, paid, rejected | E2E |
| 9 | Audit trail shows complete history of all payout actions | Integration |

## Tasks / Subtasks

- [ ] **Task 1: Payouts List Page** (AC: 1, 8)
  - [ ] 1.1 Create `apps/web/src/app/(auth)/admin/referrals/payouts/page.tsx`
  - [ ] 1.2 Query `payout_requests` with client profile joins
  - [ ] 1.3 Display: client name, amount (₱), payment method, account info, date
  - [ ] 1.4 Status filter: All, Pending, Paid, Rejected
  - [ ] 1.5 Sort by created_at DESC

- [ ] **Task 2: Approve Payout** (AC: 2, 3, 6)
  - [ ] 2.1 "Mark as Paid" button with confirmation dialog
  - [ ] 2.2 Update payout_requests: status='paid', processed_by, processed_at
  - [ ] 2.3 Create reward_transaction: type='payout', negative amount, balance_after
  - [ ] 2.4 Send approval email to client

- [ ] **Task 3: Reject Payout** (AC: 4, 5, 7)
  - [ ] 3.1 "Reject" button opens dialog with reason textarea
  - [ ] 3.2 Update payout_requests: status='rejected', rejection_reason
  - [ ] 3.3 Restore funds: add amount back to client's reward_balance
  - [ ] 3.4 Create reward_transaction: type='adjustment', positive amount
  - [ ] 3.5 Send rejection email with reason

- [ ] **Task 4: Email Templates** (AC: 6, 7)
  - [ ] 4.1 Create `packages/email/src/templates/payout-approved.ts`
  - [ ] 4.2 Create `packages/email/src/templates/payout-rejected.ts`

- [ ] **Task 5: Navigation** (AC: 1)
  - [ ] 5.1 Add "Payouts" sub-link under Referrals in admin sidebar
  - [ ] 5.2 Show badge with pending count

- [ ] **Task 6: Testing** (All ACs — TDD for money flow)
  - [ ] 6.1 Integration test: approve payout → status updated, transaction created
  - [ ] 6.2 Integration test: reject payout → funds restored, transaction created
  - [ ] 6.3 Integration test: balance after approve matches expected
  - [ ] 6.4 Integration test: balance after reject matches expected
  - [ ] 6.5 Unit test: filter by status
  - [ ] 6.6 Integration test: email sent on approve/reject

## Dev Notes

### Architecture Alignment
- **Database**: `payout_requests` table (needs creation if not in 00008)
- **Admin Navigation**: Add to admin-sidebar.tsx under Referrals section
- **Pattern**: Follow payment validation workflow pattern from Story 3.8

### Risk Assessment (from Murat/TEA)
- **HIGH RISK**: Balance restoration on rejection must be atomic
- Verify: approved payout cannot be re-approved
- Verify: rejected payout restores exact amount

### Prerequisites
- Story 8.12 (Reward Redemption) — creates payout requests
- Story 8.14 (Referral Analytics) — admin referrals section exists

### References
- [Source: docs/stories/tech-spec-epic-8.md#APIs-and-Interfaces]
- [Source: docs/epics.md#Story-8.15]

**Story Points:** 3

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted — TDD required for money flow | SM Agent (Party Mode) |
