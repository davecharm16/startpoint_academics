# Technical Specification - Epic 2: Client Submission Flow

**Epic:** Client Submission Flow
**Author:** Claude (BMAD Dev Agent)
**Date:** 2025-12-01
**Status:** Draft

---

## Epic Overview

**Goal:** Enable clients to submit projects with complete briefs, payment information, and receive tracking links.

**FRs Covered:** FR4, FR5, FR29, FR33, FR38, FR39, FR43, FR44, FR45, FR49

**Dependencies:** Epic 1 (Foundation) - Complete

**Total Story Points:** 23

---

## Stories Summary

| Story | Title | Points | Status |
|-------|-------|--------|--------|
| 2.1 | Intake Form Foundation | 5 | backlog |
| 2.2 | Dynamic Package Fields | 3 | backlog |
| 2.3 | Payment Information Collection | 5 | backlog |
| 2.4 | Form Auto-Save | 3 | backlog |
| 2.5 | Project Submission & Reference Code | 5 | backlog |
| 2.6 | Submission Validation | 2 | backlog |

---

## Technical Architecture

### Route Structure

```
src/app/(public)/submit/
├── [package]/
│   └── page.tsx          # Multi-step intake form
└── success/
    └── page.tsx          # Submission confirmation
```

### Component Architecture

```
src/components/forms/
├── intake-form.tsx       # Main multi-step form container
├── intake-form-steps/
│   ├── project-details.tsx
│   ├── instructions.tsx
│   ├── contact-info.tsx
│   └── payment-step.tsx
├── package-fields.tsx    # Dynamic fields renderer
└── payment-upload.tsx    # Screenshot upload component

src/hooks/
├── use-auto-save.ts      # Form auto-save logic
└── use-package-fields.ts # Dynamic field handling
```

### Database Interactions

**Tables Used:**
- `packages` - Read for package info and required_fields
- `payment_settings` - Read for downpayment config
- `payment_methods` - Read for enabled payment options
- `projects` - Insert on submission
- `payment_proofs` - Insert if screenshot uploaded
- `project_history` - Insert audit entry

### Form Schema (Zod)

```typescript
const intakeFormSchema = z.object({
  // Step 1: Project Details
  topic: z.string().min(10, "Topic must be at least 10 characters"),
  deadline: z.date().min(new Date(), "Deadline must be in the future"),
  expected_outputs: z.string().min(20, "Please describe expected outputs"),

  // Step 2: Instructions
  special_instructions: z.string().optional(),
  requirements: z.record(z.string(), z.any()), // Dynamic fields

  // Step 3: Contact
  client_name: z.string().min(2, "Name is required"),
  client_email: z.string().email("Invalid email"),
  client_phone: z.string().regex(/^09\d{9}$/, "Invalid Philippine mobile"),

  // Step 4: Payment
  amount_paid: z.number().min(0).optional(),
  payment_method_id: z.string().uuid().optional(),
  payment_screenshot: z.instanceof(File).optional(),
});
```

---

## Story 2.1: Intake Form Foundation

### Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | /submit/[package] displays multi-step form | Navigate to route |
| 2 | Form shows selected package details | Visual |
| 3 | Real-time validation on required fields | Fill form |
| 4 | Progress indicator shows current step | Visual |

### Technical Implementation

**Route:** `src/app/(public)/submit/[package]/page.tsx`

```typescript
// Server component fetches package
const { data: pkg } = await supabase
  .from("packages")
  .select("*")
  .eq("slug", params.package)
  .eq("is_active", true)
  .single();

if (!pkg) notFound();

// Pass to client form component
return <IntakeForm package={pkg} />;
```

**Form Steps:**
1. Project Details (topic, deadline, outputs)
2. Instructions (special instructions, dynamic fields)
3. Contact Information (name, email, phone)
4. Payment (methods, screenshot upload)

**State Management:** React Hook Form with form context

### File List

- `src/app/(public)/submit/[package]/page.tsx`
- `src/app/(public)/submit/[package]/not-found.tsx`
- `src/components/forms/intake-form.tsx`
- `src/components/forms/intake-form-steps/project-details.tsx`
- `src/components/forms/step-indicator.tsx`

---

## Story 2.2: Dynamic Package Fields

### Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Package-specific fields render dynamically | Visual |
| 2 | Required package fields block submission | Try submit |
| 3 | Responses stored in project.requirements | Check DB |

### Technical Implementation

**Package required_fields schema:**
```typescript
interface RequiredField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea";
  required: boolean;
  options?: string[]; // For select type
  placeholder?: string;
}
```

**Dynamic rendering:**
```typescript
function PackageFields({ fields, control }) {
  return fields.map((field) => {
    switch (field.type) {
      case "text": return <Input {...register(field.name)} />;
      case "number": return <Input type="number" {...register(field.name)} />;
      case "select": return <Select options={field.options} {...register(field.name)} />;
      case "textarea": return <Textarea {...register(field.name)} />;
    }
  });
}
```

### File List

- `src/components/forms/package-fields.tsx`
- `src/components/forms/intake-form-steps/instructions.tsx`

---

## Story 2.3: Payment Information Collection

### Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Downpayment calculated correctly | Check amount |
| 2 | Payment methods displayed from DB | Visual |
| 3 | Screenshot required if configured | Try submit |
| 4 | Amount paid captured | Check DB |

### Technical Implementation

**Downpayment calculation:**
```typescript
function calculateDownpayment(packagePrice: number, settings: PaymentSettings) {
  if (settings.downpayment_type === 'percentage') {
    return (packagePrice * settings.downpayment_value) / 100;
  }
  return settings.downpayment_value;
}
```

**File upload:**
- Use Supabase Storage bucket: `payment-proofs`
- Max file size: 5MB
- Accepted types: image/jpeg, image/png, image/webp

### File List

- `src/components/forms/intake-form-steps/payment-step.tsx`
- `src/components/forms/payment-upload.tsx`
- `src/components/forms/intake-form-steps/contact-info.tsx`

---

## Story 2.4: Form Auto-Save

### Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Form auto-saves after 2s pause | Navigate away, return |
| 2 | Sensitive fields excluded | Check localStorage |
| 3 | 24h expiry enforced | Wait 24h or check code |
| 4 | Restore prompt on return | Navigate away, return |

### Technical Implementation

**Auto-save hook:**
```typescript
function useAutoSave(packageSlug: string, formData: FormData) {
  const STORAGE_KEY = `intake_draft_${packageSlug}`;
  const SENSITIVE_FIELDS = ['payment_screenshot', 'client_phone', 'client_email'];
  const EXPIRY_HOURS = 24;

  // Debounced save
  const debouncedSave = useDebouncedCallback((data) => {
    const sanitized = omit(data, SENSITIVE_FIELDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      data: sanitized,
      timestamp: Date.now()
    }));
  }, 2000);

  // Check for expired draft on load
  useEffect(() => {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      const { timestamp } = JSON.parse(draft);
      const hoursOld = (Date.now() - timestamp) / (1000 * 60 * 60);
      if (hoursOld > EXPIRY_HOURS) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);
}
```

### File List

- `src/hooks/use-auto-save.ts`
- Update `src/components/forms/intake-form.tsx`

---

## Story 2.5: Project Submission & Reference Code

### Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Reference code SA-YYYY-NNNNN generated | Check confirmation |
| 2 | tracking_token UUID generated | Check DB |
| 3 | agreed_price stored immutably | Check DB |
| 4 | Confirmation page shows code + link | Visual |
| 5 | localStorage draft cleared | Check storage |

### Technical Implementation

**Reference code generation:**
```typescript
async function generateReferenceCode(): Promise<string> {
  const year = new Date().getFullYear();

  // Get count of projects this year
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01`);

  const sequence = String((count ?? 0) + 1).padStart(5, '0');
  return `SA-${year}-${sequence}`;
}
```

**Project insertion:**
```typescript
const project = await supabase
  .from('projects')
  .insert({
    reference_code: await generateReferenceCode(),
    tracking_token: crypto.randomUUID(),
    package_id: package.id,
    agreed_price: package.price,
    status: 'submitted',
    topic: formData.topic,
    deadline: formData.deadline,
    expected_outputs: formData.expected_outputs,
    special_instructions: formData.special_instructions,
    requirements: formData.requirements,
    client_name: formData.client_name,
    client_email: formData.client_email,
    client_phone: formData.client_phone,
  })
  .select()
  .single();
```

### File List

- `src/lib/utils/reference-code.ts`
- `src/app/(public)/submit/success/page.tsx`
- `src/app/api/submit-project/route.ts` (or server action)

---

## Story 2.6: Submission Validation

### Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Inline validation errors displayed | Fill incomplete form |
| 2 | Future deadline enforced | Enter past date |
| 3 | Email format validated | Enter invalid email |
| 4 | Phone format validated (PH mobile) | Enter invalid phone |
| 5 | File type validated | Upload wrong type |

### Technical Implementation

**Zod schema refinements:**
```typescript
const intakeFormSchema = z.object({
  // ... base schema
}).refine(
  (data) => new Date(data.deadline) > new Date(),
  { message: "Deadline must be in the future", path: ["deadline"] }
).refine(
  (data) => /^09\d{9}$/.test(data.client_phone),
  { message: "Please enter a valid Philippine mobile number", path: ["client_phone"] }
);
```

**Server-side validation:**
- Duplicate all validation on server
- Check package exists and is active
- Verify payment settings

### File List

- `src/lib/validations/intake-form.ts`
- Update form components with validation

---

## Implementation Order

1. **Story 2.1** - Foundation (form shell, steps, navigation)
2. **Story 2.6** - Validation (define all schemas upfront)
3. **Story 2.2** - Dynamic fields (package-specific inputs)
4. **Story 2.3** - Payment (payment step with upload)
5. **Story 2.4** - Auto-save (localStorage persistence)
6. **Story 2.5** - Submission (complete flow, reference code)

---

## Testing Checklist

- [ ] Form navigates through all 4 steps
- [ ] Required fields block step progression
- [ ] Dynamic package fields render correctly
- [ ] Payment calculation is accurate
- [ ] Screenshot upload works
- [ ] Auto-save triggers after 2s
- [ ] Drafts restore correctly
- [ ] Expired drafts are deleted
- [ ] Reference code is unique
- [ ] Tracking link is valid UUID
- [ ] agreed_price matches package price at submission time
- [ ] Project appears in database with correct status
- [ ] project_history entry created
- [ ] localStorage cleared on success

---

## References

- [PRD - Functional Requirements](../prd.md#functional-requirements)
- [Architecture - Project Structure](../architecture.md#project-structure)
- [Epic Breakdown - Epic 2](../epics.md#epic-2-client-submission-flow)
