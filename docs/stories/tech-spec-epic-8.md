# Epic Technical Specification: Client Accounts & Referral System

Date: 2025-12-12
Author: Dave
Epic ID: 8
Status: Draft

---

## Overview

Epic 8 introduces client account functionality and a comprehensive marketing system to Startpoint Academics. This epic enables clients to create accounts with email/password authentication, view all their projects in a unified dashboard, and participate in referral and social marketing programs that reward them for bringing new clients and engaging on social media.

This is a **growth-focused epic** that builds on top of the completed MVP (Epics 1-7). It adds a third user role (`client`) alongside existing `admin` and `writer` roles, while maintaining backward compatibility with guest tracking links.

## Objectives and Scope

### In Scope
- Client registration with email/password (extending Supabase Auth)
- Client login and password reset flows
- Client dashboard with unified project view
- Referral code generation and tracking
- Referral rewards system (discount OR cash payout)
- Social media engagement rewards (like, follow, share)
- Admin configuration and analytics for marketing programs
- Backward compatibility with guest tracking links (FR61)

### Out of Scope
- Google OAuth for clients (future enhancement)
- Automated social media verification via APIs
- Multi-level referral programs (affiliate tiers)
- In-app messaging between clients

## System Architecture Alignment

### Role-Based Routing
Epic 8 adds a new route group under `(auth)/client/` with dedicated pages:
- `/client` - Dashboard home
- `/client/projects` - All client projects
- `/client/referrals` - Referral dashboard
- `/client/social-rewards` - Social rewards
- `/client/profile` - Profile management

### Authentication Extension
- Extend existing Supabase Auth to support `role = 'client'`
- Update login page to redirect based on role (admin → /admin, writer → /writer, client → /client)
- Add registration page at `/auth/register` for clients only

### Database Tables (Already Added to Architecture)
- `profiles` - Extended with referral fields (referral_code, referred_by, reward_balance)
- `referrals` - Track referral relationships and conversions
- `reward_transactions` - Audit trail for all reward changes
- `payout_requests` - Cash withdrawal requests
- `social_claims` - Social media engagement claims
- `referral_settings` - Admin configuration for referral program
- `social_reward_settings` - Admin configuration for social rewards

## Detailed Design

### Services and Modules

| Module | Responsibility | Key Functions |
|--------|---------------|---------------|
| `src/lib/utils/referral-code.ts` | Generate unique referral codes | `generateReferralCode(name: string)` |
| `src/hooks/use-referrals.ts` | Query referral data | `useMyReferrals()`, `useReferralStats()` |
| `src/hooks/use-rewards.ts` | Query reward balance | `useRewardBalance()`, `useRewardTransactions()` |
| `src/hooks/use-social-claims.ts` | Manage social claims | `useSocialClaims()`, `useSubmitClaim()` |
| `src/lib/supabase/client-auth.ts` | Client auth helpers | `registerClient()`, `loginClient()` |

### Data Models and Contracts

#### Referral Code Generation
```typescript
// src/lib/utils/referral-code.ts
export function generateReferralCode(fullName: string): string {
  const prefix = fullName
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 4)
    .padEnd(4, 'X');
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${suffix}`; // e.g., DAVE2024
}
```

#### Database Types (Generated)
```typescript
// From database.ts
interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  referred_email: string;
  status: 'signed_up' | 'converted';
  reward_amount: number | null;
  reward_status: 'pending' | 'available' | 'redeemed' | 'paid';
  converted_at: string | null;
  created_at: string;
}

interface SocialClaim {
  id: string;
  user_id: string;
  action_type: 'like_page' | 'follow_page' | 'share_post';
  social_username: string | null;
  proof_url: string | null;
  status: 'pending' | 'verified' | 'rejected';
  discount_amount: number | null;
  rejection_reason: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

interface RewardTransaction {
  id: string;
  user_id: string;
  type: 'referral_reward' | 'social_reward' | 'redemption' | 'payout' | 'adjustment';
  amount: number;
  balance_after: number;
  reference_id: string | null;
  reference_type: string | null;
  notes: string | null;
  created_at: string;
}
```

### APIs and Interfaces

#### Client Registration
```typescript
// POST /auth/register (Server Action)
interface RegisterClientRequest {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  referral_code?: string; // Optional referral code
}

interface RegisterClientResponse {
  success: boolean;
  user_id?: string;
  referral_code?: string; // Generated code for new client
  has_referral_discount?: boolean; // If registered with valid referral
  error?: string;
}
```

#### Social Claim Submission
```typescript
// POST /api/social-claims (Server Action)
interface SubmitSocialClaimRequest {
  action_type: 'like_page' | 'follow_page' | 'share_post';
  social_username: string;
  proof_file: File; // Screenshot
}

interface SubmitSocialClaimResponse {
  success: boolean;
  claim_id?: string;
  error?: string;
}
```

#### Payout Request
```typescript
// POST /api/payout-requests (Server Action)
interface RequestPayoutRequest {
  amount: number;
  payment_method: 'gcash' | 'bank';
  payment_details: {
    account_number: string;
    account_name: string;
  };
}
```

### Workflows and Sequencing

#### Client Registration Flow
```
1. User visits /auth/register
2. Fills form (email, password, name, phone, optional referral_code)
3. If referral_code provided:
   a. Validate code exists in profiles.referral_code
   b. If valid: set referred_by, flag for first-order discount
   c. Create referral record (status: signed_up)
4. Create auth.user via Supabase Auth
5. Create profile with role='client'
6. Generate unique referral_code for new client
7. Send welcome email
8. Link existing projects (by client_email match)
9. Redirect to /client
```

#### Referral Conversion Flow
```
1. Referred client submits first project
2. System checks: is client referred AND referral_discount_used = false?
3. Apply discount to order (from referral_settings.new_client_discount_value)
4. Mark referral_discount_used = true
5. Update referral record status to 'converted'
6. Calculate referrer reward (from referral_settings.referrer_reward_value)
7. Add reward to referrer (reward_status: 'pending' until project completes)
8. When project completes: upgrade reward_status to 'available'
9. Notify referrer via email
```

#### Social Claim Flow
```
1. Client visits /client/social-rewards
2. Sees available actions (like, follow, share) from social_reward_settings
3. Performs action on actual social platform
4. Clicks "Claim Reward", uploads screenshot + username
5. Screenshot stored in Supabase Storage (social-proofs bucket)
6. Claim created with status: 'pending'
7. Admin sees pending claim in /admin/social-claims
8. Admin reviews screenshot, verifies on platform
9. Admin clicks "Verify" or "Reject"
10. If verified: add discount_amount to client's reward_balance
11. Create reward_transaction record
12. Notify client via email
```

## Non-Functional Requirements

### Performance

| Metric | Target | Notes |
|--------|--------|-------|
| Client dashboard load | < 2s | Projects query with pagination |
| Referral stats aggregation | < 500ms | Use referral_leaderboard view |
| Social claim image upload | < 5s | Max 5MB, compressed |
| Registration | < 2s | Including referral validation |

### Security

| Requirement | Implementation |
|-------------|----------------|
| Password strength | Min 8 chars, 1 uppercase, 1 number (Supabase default) |
| RLS for client data | Clients can only view own referrals, claims, transactions |
| Social proof storage | Signed URLs with expiry for screenshots |
| Payout verification | Admin-only processing, audit trail |
| Referral code validation | Case-insensitive, SQL injection safe |

### Reliability/Availability

- Client registration must be transactional (rollback if profile creation fails)
- Referral reward calculations must be idempotent
- Social claim status must be consistent (no double rewards)
- Payout balance must match transaction history (auditable)

### Observability

| Signal | Implementation |
|--------|----------------|
| Registration success/failure | Log with referral_code used |
| Referral conversions | Track conversion rate over time |
| Social claim verification time | Monitor admin response time |
| Payout processing time | SLA tracking |

## Dependencies and Integrations

### Existing Dependencies (No Changes)
- `@supabase/supabase-js` - Auth, database, storage
- `react-hook-form` + `zod` - Form handling
- `@tanstack/react-query` - Data fetching
- `resend` - Email notifications (welcome, reward earned, payout processed)

### New Storage Bucket
```sql
-- Supabase Storage bucket for social proof screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('social-proofs', 'social-proofs', false);

-- RLS: Clients can upload to own folder, admins can read all
CREATE POLICY "Clients upload own proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'social-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins read all proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'social-proofs' AND is_admin());
```

## Acceptance Criteria (Authoritative)

### Client Account Stories (8.1-8.6)
1. AC-8.1: Clients can register with email/password and receive welcome email
2. AC-8.2: Clients can login and are redirected to /client dashboard
3. AC-8.3: Clients can reset password via email link
4. AC-8.4: Client dashboard shows navigation (Projects, Referrals, Social, Profile)
5. AC-8.5: Client can view all their projects (past and current) in unified view
6. AC-8.6: Existing tracking links continue to work for non-registered clients

### Referral Stories (8.7-8.15)
7. AC-8.7: Each registered client has a unique referral code displayed prominently
8. AC-8.8: Clients can see their referral conversions and earned rewards
9. AC-8.9: New clients can enter referral code during registration
10. AC-8.10: Valid referral codes apply one-time discount to first order
11. AC-8.11: Referrers earn rewards when their referrals submit first project
12. AC-8.12: Clients can choose to apply rewards to orders OR request cash payout
13. AC-8.13: Admin can configure referral discount %, reward amount, minimum payout
14. AC-8.14: Admin can view referral analytics (signups, conversions, revenue)
15. AC-8.15: Admin can process/approve/reject payout requests

### Social Marketing Stories (8.17-8.21)
16. AC-8.17: Clients can submit social claims with screenshot proof
17. AC-8.18: Admin can configure discount amounts per social action
18. AC-8.19: Admin can manually verify/reject social claims
19. AC-8.20: Verified social rewards are added to client's reward balance
20. AC-8.21: Clients can see status of all their social claims

### Profile Story (8.16)
21. AC-8.16: Clients can update profile info (name, phone, email, password)

## Traceability Mapping

| AC | Spec Section | Component(s) | Test Approach |
|----|--------------|--------------|---------------|
| AC-8.1 | Client Registration Flow | `/auth/register`, `client-auth.ts` | E2E: Register → verify email → login |
| AC-8.2 | Role-Based Routing | `middleware.ts`, login page | E2E: Login → check redirect |
| AC-8.5 | Data Models | `/client/projects`, `use-projects.ts` | Query: projects by client_user_id |
| AC-8.7 | Referral Code Generation | `referral-code.ts` | Unit: uniqueness, format |
| AC-8.10 | Referral Conversion Flow | Submission flow | E2E: Register with code → submit → verify discount |
| AC-8.13 | Admin Settings | `/admin/settings` | E2E: Update → verify new referrals use new values |
| AC-8.17-19 | Social Claim Flow | Social components | E2E: Submit → admin verify → check balance |

## Risks, Assumptions, Open Questions

### Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Referral code collision | Low | Regenerate on collision, unique constraint |
| Social proof fraud | Medium | Manual admin verification, one-time per action |
| Payout abuse | Medium | Minimum threshold, admin approval required |
| Balance inconsistency | High | Transactional updates, audit trail validation |

### Assumptions
- Clients are willing to register for account features (not all will)
- Manual social verification is acceptable at MVP scale
- ₱500 minimum payout threshold is reasonable
- 10% referral discount and ₱100 referrer reward are reasonable defaults

### Open Questions
- Q: Should expired referral codes be allowed to re-register?
  - A: Default to no (code stays with original client permanently)
- Q: Can rewards expire?
  - A: For MVP, no expiration. Track for future consideration.

## Test Strategy Summary

### Unit Tests
- `referral-code.ts` - Code generation uniqueness, format
- `split-calculator.ts` - Verify discount calculations
- Zod schemas for all forms

### Integration Tests
- Client registration with referral code
- Referral conversion tracking
- Social claim submission and storage
- Payout request processing

### E2E Tests (Cypress/Playwright)
- Full client registration flow
- Referral link → signup → first order → reward
- Social claim → admin verify → balance update
- Payout request → admin process → confirmation

### Manual Testing
- Social proof screenshot quality
- Cross-platform referral link sharing
- Mobile responsiveness of client dashboard
