# Story 8.19: Admin Social Verification Queue

Status: review

## Story

As an **admin**,
I want **to review and verify social media claims manually**,
so that **only legitimate engagement earns rewards**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | `/admin/social-claims` page shows pending claims: client name, action type, social username, screenshot thumbnail, submission date | E2E |
| 2 | Clicking a claim shows the full screenshot proof in a dialog/modal | Visual |
| 3 | Dialog shows the social platform URL for manual verification (from settings) | Visual |
| 4 | "Verify" button approves the claim: updates status to 'verified', sets `verified_by` and `verified_at` | Integration |
| 5 | Verifying a claim adds the discount amount to client's `reward_balance` and creates a `reward_transactions` entry with type='social_reward' | Integration |
| 6 | "Reject" button opens a reason form: updates status to 'rejected', stores `rejection_reason` | Integration |
| 7 | Client receives email notification on verification (amount earned) | Integration |
| 8 | Client receives email notification on rejection (reason + can resubmit) | Integration |
| 9 | Claims list can be filtered by status: Pending, Verified, Rejected | E2E |
| 10 | Badge on admin sidebar shows count of pending claims | Visual |

## Tasks / Subtasks

- [ ] **Task 1: Social Claims Admin Page** (AC: 1, 9)
  - [ ] 1.1 Create `apps/web/src/app/(auth)/admin/social-claims/page.tsx`
  - [ ] 1.2 Query `social_claims` with profile joins for client name
  - [ ] 1.3 Status filter tabs: All, Pending, Verified, Rejected
  - [ ] 1.4 Table: client name, action type, username, thumbnail, date, status badge

- [ ] **Task 2: Claim Review Dialog** (AC: 2, 3)
  - [ ] 2.1 Create `apps/web/src/components/admin/social-claim-review.tsx`
  - [ ] 2.2 Full screenshot display (signed URL from storage)
  - [ ] 2.3 Social username and action type
  - [ ] 2.4 Link to social platform page URL (from settings) for manual verification
  - [ ] 2.5 "Verify" and "Reject" action buttons

- [ ] **Task 3: Verify Action** (AC: 4, 5, 7)
  - [ ] 3.1 Server action: update social_claims status='verified', verified_by, verified_at
  - [ ] 3.2 Add discount_amount to client's profiles.reward_balance
  - [ ] 3.3 Create reward_transactions: type='social_reward', amount, balance_after
  - [ ] 3.4 Send verification email to client

- [ ] **Task 4: Reject Action** (AC: 6, 8)
  - [ ] 4.1 Rejection dialog with reason textarea (required)
  - [ ] 4.2 Server action: update status='rejected', rejection_reason
  - [ ] 4.3 Allow resubmission (reset claim for that action type)
  - [ ] 4.4 Send rejection email to client with reason

- [ ] **Task 5: Email Templates** (AC: 7, 8)
  - [ ] 5.1 Create `packages/email/src/templates/social-claim-verified.ts`
  - [ ] 5.2 Create `packages/email/src/templates/social-claim-rejected.ts`

- [ ] **Task 6: Navigation Badge** (AC: 10)
  - [ ] 6.1 Add "Social Claims" link to admin sidebar
  - [ ] 6.2 Show pending count badge (query count on layout render)

- [ ] **Task 7: Testing** (All ACs — TDD for balance updates)
  - [ ] 7.1 Integration test: verify claim → balance updated, transaction created
  - [ ] 7.2 Integration test: reject claim → status updated, no balance change
  - [ ] 7.3 Integration test: verify claim → email sent
  - [ ] 7.4 Unit test: signed URL generation for screenshot
  - [ ] 7.5 Unit test: filter by status
  - [ ] 7.6 Integration test: double-verify prevention (idempotent)

## Dev Notes

### Architecture Alignment
- **Storage**: Screenshots in `social-proofs` bucket (created in Story 8.17)
- **Balance Updates**: Same pattern as referral reward activation (Story 8.11)
- **Admin Navigation**: `apps/web/src/components/layout/admin-sidebar.tsx`

### Risk Assessment (from Murat/TEA)
- Balance update must be atomic with claim status update
- Prevent double-verification (idempotent verify action)
- Signed URLs for screenshot access (time-limited, admin-only)

### Prerequisites
- Story 8.17 (Social Claims) — claims exist to verify
- Story 8.18 (Admin Configuration) — social platform URLs available

### References
- [Source: docs/stories/tech-spec-epic-8.md#Social-Claim-Flow]
- [Source: docs/epics.md#Story-8.19]

**Story Points:** 5

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted — TDD required for balance updates | SM Agent (Party Mode) |
