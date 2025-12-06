# Startpoint Academics UX Design Specification

_Created on 2025-11-30 by Dave_
_Generated using BMad Method - Create UX Design Workflow v1.0_

---

## Executive Summary

**Project:** Startpoint Academics - A transparency-first platform for academic writing services that connects clients with writers while giving the admin complete operational visibility and automated 60/40 profit splitting.

**Target Users:**
- **Clients (Primary):** Students seeking academic writing support - value transparency, easy submission, progress tracking
- **Writers (Secondary):** Academic writers - need complete briefs, clear assignments, efficient workflows
- **Admin (Dave):** Business owner - needs operational dashboard, automated payment calculations, scalability

**Core Experience:** Transparency at every step - clients know exactly where their project stands, writers have complete information before starting, admin sees business health at a glance.

**Desired Emotional Response:**
- Clients: Informed and in control (no anxiety)
- Writers: Prepared and efficient (no frustration)
- Admin: Confident and unburdened (business runs smoothly)

**Platform:** Web-first (desktop + mobile responsive)
- Desktop primary for Admin/Writer dashboards
- Mobile optimized for client flows

**Inspiration:** Fiverr and Upwork - adopting their clear status states, workroom concepts, and progress visibility while differentiating through public pricing, simpler flows, and automated profit splitting.

**UX Complexity:** Medium - Multi-portal application with 3 user roles, 4 distinct interfaces, standard CRUD patterns with some custom components (progress tracker, payment split calculator).

---

## 1. Design System Foundation

### 1.1 Design System Choice

**Selected:** shadcn/ui

**Rationale:**
- Modern, highly customizable component library built on Radix UI primitives
- Tailwind CSS foundation aligns with modern development practices
- Excellent accessibility out of the box (WCAG compliant)
- Components copy into project (full ownership, no dependency lock-in)
- Perfect for the professional-yet-approachable aesthetic needed

**Installation:** `npx shadcn-ui@latest init`

**Components to leverage:**
- Button, Badge, Card, Input, Select, Textarea (core forms)
- Progress, Tabs, Table (dashboards)
- Dialog, Sheet, Popover (modals and overlays)
- Toast (notifications)
- Avatar, Separator, Skeleton (polish)

**Custom components needed:**
- Status Stepper (horizontal progress tracker)
- Timeline (vertical history view)
- Payment Split Card (60/40 visualization)
- Project Card (unified project display)

---

## 2. Core User Experience

### 2.1 Defining Experience

**The ONE thing:** "It's the platform where you always know exactly where your project stands."

This transparency-first experience defines Startpoint Academics. Unlike competitors where clients wonder "what's happening?", writers chase details, and admins juggle spreadsheets - here, everyone sees what they need at a glance.

**Core experiences by user:**

| User | Defining Moment | Emotional Goal |
|------|-----------------|----------------|
| Client | Checking tracking page and instantly seeing status | Relief, confidence |
| Writer | Opening brief with ALL details ready | Prepared, efficient |
| Admin | Dashboard showing business health in one view | In control, unburdened |

### 2.2 UX Patterns

**Standard patterns applied:**
- CRUD operations for projects, writers, packages
- Form wizards for intake
- Dashboard with stats cards and tables
- Status badges and progress indicators
- Card-based layouts for project lists

**Custom patterns designed:**
- **Status Stepper + Timeline Hybrid:** Horizontal stepper for at-a-glance status, vertical timeline below for detailed history
- **Zero-friction package browsing:** Public pricing pages with shareable links, no registration required
- **Complete brief guarantee:** Form validation ensures all required info before submission

---

## 3. Visual Foundation

### 3.1 Color System

**Theme:** Academic Trust (matches brand logo)

**Personality:** Prestigious, reliable, university-inspired with warmth

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | Deep Navy | `#1e3a5f` | Headers, navigation, primary actions, key text |
| Primary Light | Royal Blue | `#2d5a87` | Hover states, gradients, secondary emphasis |
| Accent | Academic Gold | `#d4a853` | CTAs, highlights, celebrations, premium indicators |
| Success | Green | `#16a34a` | Completed status, positive feedback |
| Warning | Amber | `#f59e0b` | Deadlines, caution states |
| Error | Red | `#dc2626` | Errors, destructive actions |
| Background | Light Gray | `#f8fafc` | Page backgrounds |
| Background Alt | Slate 100 | `#f1f5f9` | Card backgrounds, sections |
| Text | Slate 800 | `#1e293b` | Primary text |
| Text Muted | Slate 500 | `#64748b` | Secondary text, labels |
| Border | Slate 200 | `#e2e8f0` | Borders, dividers |

### 3.2 Typography

**Font Stack:** System fonts for performance
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
```

**Type Scale:**
| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| H1 | 2.5rem | 700 | Page titles |
| H2 | 1.75rem | 700 | Section headers |
| H3 | 1.25rem | 600 | Card titles |
| Body | 1rem | 400 | General text |
| Small | 0.875rem | 400 | Labels, captions |
| Tiny | 0.75rem | 500 | Badges, tags |

### 3.3 Spacing System

**Base unit:** 4px

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight spacing |
| sm | 8px | Between related items |
| md | 16px | Standard padding |
| lg | 24px | Section spacing |
| xl | 32px | Major sections |
| 2xl | 48px | Page-level spacing |

**Interactive Visualizations:**
- Color Theme Explorer: [ux-color-themes.html](./ux-color-themes.html)

---

## 4. Design Direction

### 4.1 Chosen Design Approach

**Overall Style:** Classic Professional + Modern Minimal hybrid

Combines the trustworthy, established feel of classic layouts with contemporary clean aesthetics.

### 4.2 Landing Page

**Approach:** Classic + Modern Hybrid

| Element | Decision | Rationale |
|---------|----------|-----------|
| Hero | Centered, bold headline with navy gradient background | Commands attention, establishes trust |
| Packages | 3-column pricing cards prominently displayed | Transparency-first - pricing visible immediately |
| Typography | Large, clean headers with ample whitespace | Modern feel without sacrificing professionalism |
| Trust signals | Badges and testimonials below fold | Reinforce credibility |
| CTA | Gold accent button "Get Started" | Stands out, invites action |

### 4.3 Client Tracking Page

**Approach:** Stepper + Timeline Hybrid

| Element | Decision | Rationale |
|---------|----------|-----------|
| Status display | Horizontal stepper at top | Instant clarity - "where am I?" answered in 1 second |
| History | Vertical timeline below stepper | Detailed updates for those who want more |
| Project details | Card grid with key info | Easy scanning of deadline, writer, package |
| Progress indicator | Progress bar with percentage | Visual reinforcement of advancement |
| Micro-copy | Human language ("Sarah is working on...") | Personal touch reduces anxiety |

### 4.4 Writer Dashboard

**Approach:** Card-based with filters

| Element | Decision | Rationale |
|---------|----------|-----------|
| Layout | Project cards with status badges | Quick scan of workload |
| Sorting | By deadline (urgent first) | Prioritization built-in |
| Brief view | Expandable cards or slide-out panel | Full info without leaving context |
| Status update | Quick action buttons | Efficient workflow |

### 4.5 Admin Dashboard

**Approach:** Sidebar Navigation

| Element | Decision | Rationale |
|---------|----------|-----------|
| Navigation | Persistent left sidebar | 6+ sections always accessible |
| Stats | 4-column stat cards at top | Key metrics visible immediately |
| Projects | Table view with filters | Dense info, sortable, actionable |
| Color coding | Status badges throughout | Visual scan for issues |
| 60/40 split | Prominent in stats and project rows | Core business metric always visible |

**Interactive Mockups:**
- Design Direction Showcase: [ux-design-directions.html](./ux-design-directions.html)

---

## 5. User Journey Flows

### 5.1 Client Journey: Submit Project

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. DISCOVER          2. BROWSE           3. SELECT                 │
│  ─────────────        ─────────           ─────────                 │
│  Landing page    →    Package cards  →    Click package             │
│  or shared link       (no registration)   "Get Started"             │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  4. SUBMIT            5. CONFIRM          6. TRACK                  │
│  ─────────            ──────────          ───────                   │
│  Intake form     →    Success page   →    Tracking page             │
│  (all fields)         + tracking link     (stepper + timeline)      │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  7. RECEIVE           8. COMPLETE                                   │
│  ──────────           ───────────                                   │
│  Download files  →    Payment                                       │
│  via platform         (method TBD)                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Writer Journey: Complete Assignment

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. NOTIFY            2. REVIEW           3. ACCEPT                 │
│  ─────────            ─────────           ─────────                 │
│  Email/notification   View complete  →    Confirm assignment        │
│  "New assignment"     brief in dashboard                            │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  4. WORK              5. UPDATE           6. SUBMIT                 │
│  ──────               ─────────           ─────────                 │
│  Do the work     →    Mark "In Progress"  →  Upload/link files      │
│  (offline)            Add notes           Mark "Complete"           │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.3 Admin Journey: Manage Operations

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. CHECK             2. ASSIGN           3. MONITOR                │
│  ───────              ─────────           ──────────                │
│  Dashboard       →    New submissions →   Track all projects        │
│  stats at glance      assign to writers   in table view             │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  4. SETTLE            5. REPORT                                     │
│  ─────────            ─────────                                     │
│  Mark paid       →    View weekly/monthly                           │
│  (auto 60/40)         profit summaries                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Component Library

### 6.1 Component Strategy

**Base:** shadcn/ui components with Academic Trust theme applied

### 6.2 Custom Components

#### Status Stepper
**Purpose:** Show project progress at a glance

**States:** Submitted → Assigned → In Progress → Review → Complete

**Anatomy:**
- Circle indicators (completed: check + green, current: number + navy glow, pending: number + gray)
- Connecting line between steps
- Labels below circles
- Optional: percentage display

#### Timeline
**Purpose:** Show detailed history of project updates

**Anatomy:**
- Vertical line (left border)
- Circle markers at each event
- Event title, timestamp, description
- Color coding by event type

#### Project Card
**Purpose:** Unified display of project info across portals

**Variants:**
- Client view: Status-focused, minimal details
- Writer view: Brief-focused, action buttons
- Admin view: Full details, status + financials

**Anatomy:**
- Header with project title
- Status badge
- Key details grid (deadline, writer, package, amount)
- Action buttons contextual to user role

#### Payment Split Display
**Purpose:** Visualize 60/40 split

**Anatomy:**
- Total amount
- Writer share (60%) with bar
- Admin share (40%) with bar
- Status (pending/paid)

### 6.3 shadcn/ui Components to Customize

| Component | Customization |
|-----------|---------------|
| Button | Primary = Navy, Accent = Gold |
| Badge | Status colors (progress = blue, complete = green, pending = amber) |
| Card | Consistent border radius, subtle shadow |
| Input | Navy focus ring |
| Table | Alternating row backgrounds |
| Toast | Position top-right, themed colors |

---

## 7. UX Pattern Decisions

### 7.1 Consistency Rules

**Button Hierarchy:**
| Type | Style | Usage |
|------|-------|-------|
| Primary | Navy background, white text | Main CTAs (Submit, Save, Assign) |
| Secondary | Navy outline, navy text | Secondary actions (Cancel, Back) |
| Accent | Gold background, navy text | High-emphasis CTAs (Get Started, Complete) |
| Ghost | Transparent, navy text | Tertiary actions, links |
| Destructive | Red background, white text | Delete, Remove actions |

**Feedback Patterns:**
| Action | Feedback Type | Duration |
|--------|---------------|----------|
| Form submit | Button loading state + toast on complete | Until response |
| Status change | Optimistic update + confirmation toast | 3 seconds |
| Error | Inline error + toast for system errors | Until dismissed |
| Success | Toast notification | 3 seconds auto-dismiss |

**Form Patterns:**
- Labels above inputs (not floating)
- Required fields marked with asterisk (*)
- Inline validation on blur
- Error messages below field in red
- Helper text in muted gray below input
- Multi-step forms use numbered progress indicator

**Navigation Patterns:**
- Public pages: Minimal header with logo + CTA
- Writer portal: Top navigation bar
- Admin portal: Persistent left sidebar (collapsible on mobile)
- Breadcrumbs for nested views (Admin only)

**Data Display Patterns:**
- Tables for list views with 10+ items
- Cards for visual browsing (packages, project overview)
- Always show empty states with helpful guidance
- Loading skeletons match content shape

**Status Badge Colors:**
| Status | Color | Background |
|--------|-------|------------|
| Submitted | Blue | `#dbeafe` |
| Assigned | Purple | `#ede9fe` |
| In Progress | Amber | `#fef3c7` |
| Review | Indigo | `#e0e7ff` |
| Complete | Green | `#dcfce7` |
| Paid | Green (darker) | `#bbf7d0` |

**Spacing Consistency:**
- Card padding: 16px (md)
- Section gaps: 24px (lg)
- Form field gaps: 16px (md)
- Button groups: 8px (sm) gap

---

## 8. Responsive Design & Accessibility

### 8.1 Responsive Strategy

**Breakpoints:**
| Name | Min Width | Target Devices |
|------|-----------|----------------|
| Mobile | 0px | Phones |
| Tablet | 768px | Tablets, small laptops |
| Desktop | 1024px | Laptops, desktops |
| Wide | 1280px | Large monitors |

**Layout Adaptations:**

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Landing hero | Stacked, full-width | Stacked, centered | Side-by-side option |
| Package cards | Single column | 2 columns | 3 columns |
| Admin sidebar | Hidden (hamburger) | Collapsed icons | Full expanded |
| Project table | Card view | Condensed table | Full table |
| Status stepper | Vertical | Horizontal compact | Horizontal full |
| Forms | Single column | Single column | Two column where logical |

**Mobile-First Priorities:**
1. Client intake form - must be flawless on mobile
2. Client tracking page - primary mobile use case
3. Package browsing - shareable links opened on phones
4. Writer status updates - quick mobile actions

**Touch Targets:**
- Minimum 44x44px for all interactive elements
- Adequate spacing between tap targets (8px minimum)
- Swipe gestures avoided for critical actions

### 8.2 Accessibility Requirements

**WCAG 2.1 AA Compliance:**

| Requirement | Implementation |
|-------------|----------------|
| Color contrast | 4.5:1 minimum for text, 3:1 for large text |
| Focus indicators | Visible focus ring (navy outline, 2px) |
| Keyboard navigation | All interactions accessible via keyboard |
| Screen readers | ARIA labels, semantic HTML, role attributes |
| Motion | Respect prefers-reduced-motion |
| Text scaling | Support up to 200% zoom |

**Semantic Structure:**
- One `<h1>` per page (page title)
- Logical heading hierarchy (h1 → h2 → h3)
- Landmark regions (header, nav, main, footer)
- Form labels properly associated with inputs

**Color Independence:**
- Status never conveyed by color alone
- Icons and text accompany color indicators
- Progress states include text labels

**Focus Management:**
- Logical tab order
- Focus trapped in modals
- Focus returned after modal close
- Skip links for navigation

**Accessible Components (shadcn/ui):**
- Built on Radix UI primitives (accessibility-first)
- Dialog, Popover, Menu all keyboard accessible
- Proper ARIA attributes included

---

## 9. Implementation Guidance

### 9.1 Completion Summary

**Design System:** shadcn/ui with Academic Trust theme applied

**Key Design Decisions:**

| Area | Decision | Rationale |
|------|----------|-----------|
| Design System | shadcn/ui | Modern, accessible, customizable, Tailwind-based |
| Primary Color | Deep Navy #1e3a5f | Matches brand logo, conveys trust |
| Accent Color | Academic Gold #d4a853 | Highlights CTAs, premium feel |
| Landing Page | Classic + Modern hybrid | Professional trust + contemporary clean |
| Client Tracking | Stepper + Timeline hybrid | Instant status + detailed history |
| Admin Dashboard | Sidebar navigation | 6+ sections always accessible |
| Writer Dashboard | Card-based with filters | Quick scan, efficient workflow |

**Custom Components Required:**
1. Status Stepper - Horizontal progress indicator
2. Timeline - Vertical event history
3. Project Card - Role-specific variants
4. Payment Split Display - 60/40 visualization

**Implementation Priority:**
1. Core shadcn/ui setup with theme customization
2. Landing page with package cards
3. Client intake form
4. Client tracking page (stepper + timeline)
5. Writer dashboard
6. Admin dashboard

### 9.2 Developer Handoff Checklist

- [ ] Install shadcn/ui: `npx shadcn-ui@latest init`
- [ ] Configure Tailwind with Academic Trust colors
- [ ] Import base components: Button, Card, Input, Badge, Table, Dialog, Toast
- [ ] Build custom Status Stepper component
- [ ] Build custom Timeline component
- [ ] Build custom Project Card with role variants
- [ ] Build Payment Split Display component
- [ ] Implement responsive breakpoints
- [ ] Test accessibility compliance

### 9.3 Design Assets Delivered

| Asset | Location | Purpose |
|-------|----------|---------|
| Color Theme Visualizer | `docs/ux-color-themes.html` | Interactive color exploration |
| Design Direction Mockups | `docs/ux-design-directions.html` | Layout reference implementations |
| UX Specification | `docs/ux-design-specification.md` | Complete design documentation |

---

## Appendix

### Related Documents

- Product Requirements: `docs/prd.md`
- Product Brief: `docs/product-brief-startpoint_academics-2025-11-30.md`
- Brainstorming: `docs/brainstorming-session-results-2025-11-30.md`

### Core Interactive Deliverables

- **Color Theme Visualizer**: docs/ux-color-themes.html
- **Design Direction Mockups**: docs/ux-design-directions.html

### Version History

| Date       | Version | Changes                         | Author |
| ---------- | ------- | ------------------------------- | ------ |
| 2025-11-30 | 1.0     | Initial UX Design Specification | Dave   |

---

_This UX Design Specification was created through collaborative design facilitation, not template generation. All decisions were made with user input and are documented with rationale._
