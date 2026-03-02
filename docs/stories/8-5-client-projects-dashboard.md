# Story 8.5: Client Projects Dashboard

Status: review

## Story

As a **logged-in client**,
I want **to see all my projects in one unified view**,
so that **I don't need to track separate links for each project**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | `/client/projects` displays a list of all projects associated with the client (by `client_user_id` or `client_email` match) | E2E |
| 2 | Each project card shows: reference code, topic, status badge, deadline, package name | Visual |
| 3 | Status badges are color-coded: submitted (blue), assigned (yellow), in_progress (orange), review (purple), complete (green), paid (green) | Visual |
| 4 | Projects are sorted by `created_at` descending (newest first) | E2E |
| 5 | Clicking a project card navigates to the public tracking page `/track/[token]` | E2E |
| 6 | Client with no projects sees an empty state with "Submit Your First Project" CTA linking to packages page | Visual |
| 7 | Project count matches the total shown on dashboard home summary card | Integration |

## Tasks / Subtasks

- [ ] **Task 1: Create Client Projects Page** (AC: 1, 2, 4)
  - [ ] 1.1 Create `apps/web/src/app/(auth)/client/projects/page.tsx`
  - [ ] 1.2 Server-side query: projects WHERE `client_user_id = user.id` OR `client_email = user.email`
  - [ ] 1.3 Include package name via join on packages table
  - [ ] 1.4 Sort by `created_at` DESC

- [ ] **Task 2: Project Card Component** (AC: 2, 3, 5)
  - [ ] 2.1 Create `apps/web/src/components/client/project-card.tsx`
  - [ ] 2.2 Display: reference code, topic (truncated), status badge, deadline, package name
  - [ ] 2.3 Color-coded status badges matching existing admin/writer patterns
  - [ ] 2.4 Card links to `/track/[tracking_token]`
  - [ ] 2.5 Show deadline with urgency indicator (red if overdue, orange if within 48h)

- [ ] **Task 3: Empty State** (AC: 6)
  - [ ] 3.1 Create empty state component with illustration/icon
  - [ ] 3.2 Text: "No projects yet"
  - [ ] 3.3 CTA button: "Submit Your First Project" → `/packages` (or landing page packages section)

- [ ] **Task 4: Testing** (All ACs)
  - [ ] 4.1 Unit test: project card renders all fields correctly
  - [ ] 4.2 Unit test: status badge color mapping
  - [ ] 4.3 Unit test: empty state renders when projects array is empty
  - [ ] 4.4 Integration test: projects query returns correct results for client
  - [ ] 4.5 Integration test: project card links to correct tracking page

## Dev Notes

### Architecture Alignment
- **Data Query**: Use server-side Supabase query (RSC pattern, not client-side)
- **Status Badges**: Reuse color patterns from admin project table and writer project list
- **Tracking Link**: Projects already have `tracking_token` — link to existing public tracking page

### Key Technical Decisions
- Query by BOTH `client_user_id` AND `client_email` to cover projects submitted before and after registration
- No pagination for MVP (assume < 100 projects per client) — add later if needed
- Reuse tracking page rather than building a separate client project detail view

### Prerequisites
- Story 8.4 (Client Dashboard Layout) — provides layout and navigation

### References
- [Source: docs/stories/tech-spec-epic-8.md#Data-Models]
- Pattern reference: `apps/web/src/app/(auth)/writer/page.tsx` (writer projects list)

**Story Points:** 3

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-02 | Story drafted with proper BMAD ACs | SM Agent (Party Mode) |
