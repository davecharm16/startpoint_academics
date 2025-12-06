# Startpoint Academics - Product Requirements Document

**Author:** Dave
**Date:** 2025-11-30
**Version:** 1.0

---

## Executive Summary

Startpoint Academics is a purpose-built platform for academic writing service operations that transforms chaotic manual processes into a streamlined, transparent workflow. The platform connects clients seeking academic support with writers who deliver, while giving the business owner complete operational visibility and automated financial tracking.

**The core vision:** Eliminate the friction that prevents academic writing services from scaling - incomplete briefs, manual payment calculations, and constant "what's the status?" inquiries - by creating transparency for all parties.

**Target users:**
- Clients (students) who need academic writing support
- Writers who complete projects and need efficient workflows
- Admin (business owner) who coordinates operations and manages finances

**MVP Goal:** A working platform that processes projects from client submission through writer delivery with automated 60/40 profit splitting.

### What Makes This Special

**Transparency-first operations** - While competitors hide pricing, require registration before browsing, and leave clients guessing about progress, Startpoint Academics inverts this model:

1. **Public pricing without barriers** - Shareable package links let clients browse and select without registration
2. **Writer-protective briefs** - No project starts without complete information; writers never chase clients
3. **Real-time visibility** - All parties see exactly where things stand without asking
4. **Automated financials** - The 60/40 split calculates automatically; no spreadsheets, no errors

This transparency becomes the competitive moat - clients trust it, writers prefer it, and the business scales without proportional overhead growth.

---

## Project Classification

**Technical Type:** Web Application (SaaS-style multi-portal platform)
**Domain:** EdTech / Service Business Operations
**Complexity:** Medium

This is a multi-portal web application with three distinct user experiences:
- **Public-facing:** Landing page, package browsing, intake forms
- **Client portal:** Project tracking, file access
- **Writer portal:** Assignment management, progress updates
- **Admin dashboard:** Operations oversight, financial tracking

The domain is educational services with some considerations for:
- Student privacy (contact information handling)
- Content sensitivity (academic work)
- Payment transparency (60/40 split model)

---

## Success Criteria

### What Winning Looks Like

Success for Startpoint Academics means:

1. **Writers start immediately** - Projects begin within hours of submission because briefs are complete
2. **Clients stop asking** - Progress visibility eliminates 80%+ of "what's the status?" messages
3. **Money tracks itself** - Zero manual payment calculations; dashboards show profit in real-time
4. **Growth doesn't hurt** - Handling 2x the projects doesn't require 2x the admin time

### Business Metrics

| Metric | Success Target | Why It Matters |
|--------|----------------|----------------|
| Brief completeness | 95%+ projects start without follow-up | Core value prop for writers |
| Status inquiries | Reduce by 80% | Frees admin time for growth |
| Payment calculation time | <1 minute per project | Currently significant time sink |
| Project capacity | 2x current volume | Platform enables scale |
| Client return rate | Track baseline, improve 20% | Transparency builds trust |

---

## Product Scope

### MVP - Minimum Viable Product

The smallest version that proves the platform delivers value:

| Component | Capability | Success Indicator |
|-----------|------------|-------------------|
| **Landing Page** | Professional presentation of services, packages, pricing, trust signals | Clients convert from browse to submit |
| **Package Links** | Shareable URLs for each tier; no registration to view | Can send link → client submits |
| **Intake Form** | Captures all required info dynamically based on package | Writers never need to ask for more |
| **Writer Dashboard** | View assignments, see complete briefs, update status | Writers prefer platform to messaging |
| **Client Tracking** | Real-time status view via unique link | Clients stop asking for updates |
| **Admin Dashboard** | All projects, all writers, automated 60/40 split | One view shows business health |

**Critical Path:** Landing → Package Selection → Intake → Assignment → Progress → Delivery → Payment Split

### Growth Features (Post-MVP)

Features to add after MVP proves value:

1. **In-platform file management** - Upload/download within platform (replaces Google Drive bridge)
2. **Integrated messaging** - Per-project communication threads
3. **Writer earnings dashboard** - Writers see their own payment history
4. **Automated writer assignment** - Smart matching based on availability/expertise
5. **Client accounts** - Login to see all past projects
6. **Email/SMS notifications** - Proactive status updates

### Vision (Future)

Phase 2 marketplace expansion:

1. **AI Intake Chatbot** - Conversational intake that gathers requirements and qualifies leads
2. **Public freelancer marketplace** - Writers can join and clients can browse
3. **Freelancer onboarding/vetting** - Quality control for marketplace writers
4. **Advanced analytics** - Business intelligence dashboards
5. **Rating and review system** - Quality signals for marketplace
6. **Subscription packages** - Recurring client relationships

---

## Web Application Specific Requirements

### Browser Support

| Browser | Version | Priority |
|---------|---------|----------|
| Chrome | Latest 2 versions | Primary |
| Safari | Latest 2 versions | Primary |
| Firefox | Latest 2 versions | Secondary |
| Edge | Latest 2 versions | Secondary |
| Mobile Safari | iOS 15+ | Primary |
| Chrome Mobile | Android 10+ | Primary |

### Responsive Design

- **Desktop:** Full dashboard experience (primary for Admin/Writer)
- **Tablet:** Functional for all portals
- **Mobile:** Optimized for client flows (browsing, intake, tracking)

### SEO Considerations

- Landing page should be indexable
- Package pages should have unique meta for sharing
- Client tracking pages should be noindex (private links)

---

## User Experience Principles

### Visual Personality

**Professional yet approachable** - This is an academic service, so it needs to convey competence and trustworthiness without being cold or corporate.

- Clean, modern design
- Clear typography hierarchy
- Trust signals prominent (testimonials, guarantees)
- Progress states visually obvious

### Key Interactions

1. **Package Selection:** Browse → Compare → Select should be frictionless
2. **Intake Form:** Progressive disclosure; don't overwhelm upfront
3. **Progress Tracking:** Status should be immediately obvious; no hunting
4. **Admin Dashboard:** Most important metrics visible without scrolling

### Accessibility

- WCAG 2.1 AA compliance target
- Keyboard navigation for all flows
- Screen reader compatible
- Color contrast requirements met

---

## Functional Requirements

### Client-Facing Capabilities

**FR1:** Visitors can view the landing page with service descriptions, packages, and pricing without registration

**FR2:** Visitors can access individual package detail pages via shareable unique URLs

**FR3:** Visitors can select a package and proceed to the intake form

**FR4:** Clients can complete a dynamic intake form that captures: topic, deadline, expected outputs, special instructions, contact information, and package-specific fields

**FR5:** Clients receive a confirmation with a unique project tracking link after submission

**FR6:** Clients can view their project status (Submitted → Assigned → In Progress → Review → Complete) via tracking link

**FR7:** Clients can access delivered files or file links through their tracking page

**FR8:** Clients receive email notifications at key status changes (assignment, completion)

### Writer Capabilities

**FR9:** Writers can log in to a secure writer dashboard

**FR10:** Writers can view all projects assigned to them with status indicators

**FR11:** Writers can view complete client briefs including all intake form responses

**FR12:** Writers can update project status (mark as In Progress, submit for Review, mark Complete)

**FR13:** Writers can add notes or updates to projects visible to admin

**FR14:** Writers can see project deadlines and sort/filter by urgency

**FR15:** Writers receive notifications when new projects are assigned to them

### Admin Capabilities

**FR16:** Admin can log in to a secure admin dashboard

**FR17:** Admin can view all projects across all statuses in a unified view

**FR18:** Admin can view and manage the writer roster

**FR19:** Admin can assign projects to writers manually

**FR20:** Admin can reassign projects between writers

**FR21:** Admin can view individual project details and full audit history

**FR22:** Admin can create and manage package definitions (name, price, description, required fields)

**FR23:** Admin can update package pricing without developer intervention

**FR24:** Admin can view the payment tracker showing: project, package price, writer share (60%), admin share (40%)

**FR25:** Admin can mark projects as paid/settled

**FR26:** Admin can view weekly and monthly profit summaries

**FR27:** Admin can filter projects by date range, status, writer, or package

**FR28:** Admin can export project and payment data (CSV)

### System Capabilities

**FR29:** System generates unique, non-guessable URLs for client tracking links

**FR30:** System sends email notifications at configurable trigger points

**FR31:** System calculates 60/40 split automatically when project is marked complete

**FR32:** System maintains audit log of all status changes with timestamps

**FR33:** System validates intake form submissions for completeness before accepting

**FR34:** System displays package information from database (not hardcoded)

---

## Non-Functional Requirements

### Performance

| Metric | Target | Rationale |
|--------|--------|-----------|
| Landing page load | < 2 seconds | First impression matters |
| Dashboard initial load | < 3 seconds | Admin uses frequently |
| Form submission | < 1 second feedback | User needs to know it worked |
| Status check | < 500ms | Clients check often |

### Security

| Requirement | Implementation |
|-------------|----------------|
| Admin/Writer authentication | Secure login with password hashing |
| Session management | Secure tokens with expiration |
| Client tracking links | Cryptographically random, non-guessable |
| HTTPS | All traffic encrypted |
| Input validation | All form inputs sanitized |
| SQL injection prevention | Parameterized queries/ORM |

### Scalability

- MVP target: 50 concurrent users, 100 active projects
- Growth target: 200 concurrent users, 500 active projects
- Database should support horizontal scaling path

### Integration

| System | Integration Type | Priority |
|--------|------------------|----------|
| Email service (SendGrid/SES) | Transactional emails | MVP |
| Google Drive | Link sharing (bridge solution) | MVP |
| Payment gateway (Stripe/PayPal) | Future integration point | Phase 1.5 |

---

_This PRD captures the essence of Startpoint Academics - a transparency-first platform that transforms academic writing service operations from chaotic manual processes into a scalable, visible, automated business._

_Created through collaborative discovery between Dave and AI facilitator._
