# Story 1.1: Project Infrastructure Setup

Status: done

## Story

As a **developer**,
I want **the project initialized with all required dependencies and tooling**,
so that **development can begin with a consistent, well-configured environment**.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Running `npm install && npm run dev` starts the application on localhost:3000 | Manual |
| 2 | Supabase local instance is accessible via `npx supabase status` | CLI |
| 3 | All required dependencies installed: Next.js 14, @supabase/supabase-js, @supabase/ssr, shadcn/ui, react-hook-form, @hookform/resolvers, zod, @tanstack/react-query, date-fns, lucide-react, use-debounce | `npm ls` |
| 4 | shadcn/ui initialized with Academic Trust theme (Navy #1e3a5f, Gold #d4a853) configured in tailwind.config.ts | Visual + config check |
| 5 | Project structure matches architecture document (src/app, src/components, src/lib, src/types, supabase/) | File system |
| 6 | TypeScript strict mode enabled | tsconfig.json |
| 7 | Environment variables template (.env.local.example) created with required variables | File exists |

## Tasks / Subtasks

- [x] **Task 1: Create Next.js Project** (AC: 1, 5, 6)
  - [x] Run `npx create-next-app@14 . --typescript --tailwind --app --src-dir --import-alias "@/*"` (in empty app directory or create fresh)
  - [x] Verify TypeScript strict mode is enabled in tsconfig.json
  - [x] Verify src directory structure created

- [x] **Task 2: Initialize Supabase** (AC: 2)
  - [x] Run `npx supabase init` to create supabase/ directory
  - [ ] Run `npx supabase start` to start local Docker containers (requires Docker - manual step)
  - [ ] Verify Supabase studio accessible at localhost:54323 (requires Docker)
  - [x] Capture anon key and service role key from output (demo keys in .env.local)

- [x] **Task 3: Install Core Dependencies** (AC: 3)
  - [x] Install Supabase clients: `npm install @supabase/supabase-js @supabase/ssr`
  - [x] Install form handling: `npm install react-hook-form @hookform/resolvers zod`
  - [x] Install data fetching: `npm install @tanstack/react-query`
  - [x] Install utilities: `npm install date-fns lucide-react use-debounce`
  - [x] Install shadcn dependencies: `npm install class-variance-authority clsx tailwind-merge`

- [x] **Task 4: Initialize shadcn/ui** (AC: 4)
  - [x] Run `npx shadcn@latest init` (select New York style, Slate base color, CSS variables)
  - [x] Update tailwind.config.ts with Academic Trust theme colors:
    - Primary: #1e3a5f (Deep Navy)
    - Primary-foreground: #ffffff
    - Accent: #d4a853 (Academic Gold)
    - Accent-foreground: #1e3a5f
  - [x] Install base components: `npx shadcn@latest add button card`
  - [x] Verify components render correctly with theme

- [x] **Task 5: Create Project Structure** (AC: 5)
  - [x] Create `src/lib/supabase/` directory
  - [x] Create `src/lib/utils/` directory
  - [x] Create `src/types/` directory
  - [x] Create `src/components/ui/` (done by shadcn)
  - [x] Create `src/components/layout/` directory
  - [x] Create `src/components/marketing/` directory
  - [x] Create `src/app/(public)/` route group directory

- [x] **Task 6: Create Environment Configuration** (AC: 7)
  - [x] Create `.env.local.example` with template variables:
    ```
    NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
    SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```
  - [x] Create actual `.env.local` with local Supabase credentials
  - [x] Ensure `.env.local` is in .gitignore

- [x] **Task 7: Verify Setup** (AC: 1, 2)
  - [x] Run `npm run dev` and confirm app loads at localhost:3000
  - [ ] Run `npx supabase status` and confirm all services running (requires Docker)
  - [x] Run `npm run build` to verify no build errors
  - [x] Run `npm run lint` to verify no linting errors

## Dev Notes

### Architecture References

- **Technology Stack:** Next.js 14.x, TypeScript 5.x, Tailwind CSS 3.x, shadcn/ui (latest)
- **ADR-001:** Single Next.js App - Initialize with route groups for (public), (auth) separation
- **ADR-002:** Supabase for backend - Set up local Supabase instance via Docker

[Source: docs/architecture.md#Project-Initialization]

### Academic Trust Theme Colors

Per UX Design Specification, configure the following colors:

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary (Deep Navy) | #1e3a5f | --primary |
| Primary Light | #2d5a87 | hover states |
| Accent (Academic Gold) | #d4a853 | --accent |
| Background | #f8fafc | --background |
| Text | #1e293b | --foreground |
| Muted | #64748b | --muted-foreground |
| Border | #e2e8f0 | --border |

[Source: docs/ux-design-specification.md#3.1-Color-System]

### Project Structure Notes

Create the following directory structure per architecture doc:

```
startpoint-academics/
├── src/
│   ├── app/
│   │   ├── (public)/           # Public routes (no auth)
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout components
│   │   └── marketing/          # Marketing components
│   ├── lib/
│   │   ├── supabase/           # Supabase clients
│   │   └── utils/              # Utility functions
│   └── types/                  # TypeScript types
├── supabase/
│   ├── migrations/             # Database migrations
│   └── seed.sql               # Seed data
├── public/
│   └── images/                # Static assets
└── .env.local.example         # Environment template
```

[Source: docs/architecture.md#Project-Structure]

### Command Reference

```bash
# Create Next.js app (if starting fresh)
npx create-next-app@14 startpoint-academics --typescript --tailwind --app --src-dir --import-alias "@/*"

# Initialize Supabase
npx supabase init
npx supabase start

# Install dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install react-hook-form @hookform/resolvers zod
npm install @tanstack/react-query
npm install date-fns lucide-react use-debounce
npm install class-variance-authority clsx tailwind-merge

# Initialize shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card
```

[Source: docs/architecture.md#Development-Environment]

### Tailwind Config Example

```typescript
// tailwind.config.ts - Academic Trust theme extension
const config = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a5f',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#d4a853',
          foreground: '#1e3a5f',
        },
      },
    },
  },
}
```

### References

- [Source: docs/architecture.md#Project-Initialization]
- [Source: docs/architecture.md#Project-Structure]
- [Source: docs/architecture.md#Development-Environment]
- [Source: docs/ux-design-specification.md#1.1-Design-System-Choice]
- [Source: docs/ux-design-specification.md#3.1-Color-System]
- [Source: docs/stories/tech-spec-epic-1.md#Story-1.1]

## Dev Agent Record

### Context Reference

N/A - First story, context built from architecture and UX spec documents directly.

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101) via BMAD implementation-sprint workflow

### Debug Log References

- Build completed successfully with only expected Supabase Edge Runtime warnings
- Lint passed with no errors

### Completion Notes List

1. **Next.js 14 project created** with TypeScript, Tailwind CSS, App Router, and src directory structure
2. **Supabase initialized** - `supabase/` directory created; Docker required for `supabase start` (manual step)
3. **All dependencies installed** per architecture spec (404 packages total)
4. **shadcn/ui configured** with New York style and Academic Trust theme colors (Navy #1e3a5f, Gold #d4a853)
5. **Project structure created** matching architecture document
6. **Environment configuration** - `.env.local.example` template and `.env.local` with demo Supabase keys
7. **Supabase clients created** - Browser client, Server client, and Middleware client
8. **TypeScript types** - Placeholder database types created (will be regenerated after migrations)
9. **TanStack Query provider** configured in app/providers.tsx
10. **Build and lint verified** - Both pass successfully

**Note:** AC #2 (Supabase local instance running) requires Docker Desktop to be running. User must manually run `npx supabase start` after starting Docker.

### File List

**Created/Modified Files:**
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript strict mode enabled
- `tailwind.config.ts` - Academic Trust theme with shadcn/ui colors
- `components.json` - shadcn/ui configuration
- `src/app/globals.css` - CSS variables for theme
- `src/app/layout.tsx` - Root layout with Providers
- `src/app/providers.tsx` - TanStack Query provider
- `src/app/page.tsx` - Placeholder page with theme demo
- `src/lib/utils.ts` - cn() utility function
- `src/lib/supabase/client.ts` - Browser Supabase client
- `src/lib/supabase/server.ts` - Server Supabase client
- `src/lib/supabase/middleware.ts` - Middleware Supabase client
- `src/middleware.ts` - Next.js middleware for auth
- `src/types/database.ts` - Database type definitions
- `src/types/index.ts` - App types and re-exports
- `src/components/ui/button.tsx` - shadcn Button component
- `src/components/ui/card.tsx` - shadcn Card component
- `.env.local.example` - Environment template
- `.env.local` - Local environment with demo keys
- `supabase/config.toml` - Supabase configuration

**Directories Created:**
- `src/lib/supabase/`
- `src/lib/utils/`
- `src/types/`
- `src/components/ui/`
- `src/components/layout/`
- `src/components/marketing/`
- `src/app/(public)/`
- `src/hooks/`
- `supabase/migrations/`
- `public/images/`
