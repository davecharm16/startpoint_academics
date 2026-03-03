# Story 8.10: Referral Discount Application

Status: review

## Story

As a **referred client submitting my first project**,
I want **my referral discount applied automatically**,
so that **I save money as promised when I was referred**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | When a referred client submits their first project, the configured discount is automatically applied to the order total | Integration |
| 2 | Submission confirmation shows "Referral discount: -X%" or "-₱Y" on the summary | Visual |
| 3 | Discount amount is stored in the project's `discount` field | Integration |
| 4 | After first project, `profiles.referral_discount_used` is set to `true` | Integration |
| 5 | Subsequent project submissions do NOT receive referral discount (one-time only) | Integration |
| 6 | Discount percentage/amount is read from `referral_settings` table (not hardcoded) | Integration |
| 7 | If discount brings total below a configured minimum order amount, minimum is enforced | Edge case |
| 8 | Referral record status updates from 'signed_up' to 'converted' after first project submission | Integration |

## Tasks / Subtasks

- [ ] **Task 1: Submission Flow Integration** (AC: 1, 3, 6, 7)
  - [ ] 1.1 Update `apps/web/src/app/api/submit-project/route.ts`
  - [ ] 1.2 On submission: check if user is authenticated AND `referred_by` is set AND `referral_discount_used` is false
  - [ ] 1.3 Fetch discount config from `referral_settings` table
  - [ ] 1.4 Calculate discount: percentage-based or fixed amount
  - [ ] 1.5 Apply discount to `agreed_price` → store in `discount` column
  - [ ] 1.6 Enforce minimum order amount if configured
  - [ ] 1.7 Set `referral_discount_used = true` on profile

- [ ] **Task 2: Confirmation Display** (AC: 2)
  - [ ] 2.1 Update submission success page to show discount if applied
  - [ ] 2.2 Show original price, discount amount, and final price
  - [ ] 2.3 Show "Referral Discount Applied" badge

- [ ] **Task 3: Referral Conversion Tracking** (AC: 8)
  - [ ] 3.1 Update referral record: status = 'converted', converted_at = now()
  - [ ] 3.2 Calculate referrer reward amount from settings
  - [ ] 3.3 Create `reward_transactions` entry for referrer (status: 'pending')
  - [ ] 3.4 Update referrer's `reward_balance` when project completes (deferred to 8.11)

- [ ] **Task 4: Testing** (All ACs — TDD CRITICAL)
  - [ ] 4.1 Unit test: discount calculation — percentage-based
  - [ ] 4.2 Unit test: discount calculation — fixed amount
  - [ ] 4.3 Unit test: minimum order enforcement
  - [ ] 4.4 Integration test: first submission with referral → discount applied
  - [ ] 4.5 Integration test: second submission → no discount
  - [ ] 4.6 Integration test: submission without referral → no discount
  - [ ] 4.7 Integration test: referral record updated to 'converted'
  - [ ] 4.8 Unit test: referral settings fallback when no settings configured

## Dev Notes

### Architecture Alignment
- **Submission Flow**: `apps/web/src/app/api/submit-project/route.ts`
- **Database**: `projects.discount`, `profiles.referral_discount_used`, `referrals.status`
- **Settings**: `referral_settings` table fields: `new_client_discount_type`, `new_client_discount_value`

### Key Technical Decisions
- Discount calculation is server-side only (cannot be manipulated client-side)
- Idempotent: checking `referral_discount_used` prevents double-discount
- Referrer reward is created as 'pending' — becomes 'available' when project completes (Story 8.11)
- All monetary calculations use integer cents or DECIMAL(10,2) to avoid float issues

### Risk Assessment (from Murat/TEA)
- **HIGH RISK**: Money flow — TDD mandatory for all calculation paths
- Test every edge: zero discount, 100% discount, negative amounts, null settings
- Verify idempotency: submitting twice shouldn't double-discount

### Prerequisites
- Story 8.9 (Referral Code Entry) — referral relationship exists
- Story 8.1 (Registration) — `referred_by` and `referral_discount_used` fields
- Epic 2 (Submission Flow) — submit-project API route

### References
- [Source: docs/stories/tech-spec-epic-8.md#Referral-Conversion-Flow]
- [Source: docs/epics.md#Story-8.10]

**Story Points:** 5

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted — flagged as HIGH RISK requiring TDD | SM Agent (Party Mode) |
