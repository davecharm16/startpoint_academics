# Startpoint Academics

Academic writing services platform built with Turborepo, Next.js 14, and Supabase.

## Project Structure

This is a monorepo managed with [Turborepo](https://turbo.build/repo) and [pnpm workspaces](https://pnpm.io/workspaces).

```
startpoint_academics/
├── apps/
│   └── web/                 # Next.js 14 web application
├── packages/
│   ├── ai/                  # Claude AI SDK, agent tools, guardrails
│   ├── config/              # Shared config (ESLint, Tailwind, TypeScript)
│   ├── email/               # Email templates and Resend client
│   ├── supabase/            # Supabase clients (browser, server, admin)
│   ├── types/               # Shared TypeScript types
│   ├── ui/                  # Shared UI components (shadcn/ui)
│   └── utils/               # Shared utility functions
├── supabase/
│   └── migrations/          # Database migrations
├── turbo.json               # Turborepo configuration
└── pnpm-workspace.yaml      # pnpm workspace configuration
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+ (install with `npm install -g pnpm`)
- Supabase CLI (for local development)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your Supabase credentials
```

### Development

```bash
# Start all packages in dev mode
pnpm dev

# Start only the web app
pnpm dev --filter @startpoint/web

# Build all packages
pnpm build

# Run linting
pnpm lint
```

### Working with Packages

Each package in `packages/` is a standalone npm package that can be imported by other packages or apps.

```typescript
// Import from packages using workspace aliases
import { createClient } from "@startpoint/supabase/client";
import { Button } from "@startpoint/ui";
import { formatCurrency } from "@startpoint/utils";
import { runAgent } from "@startpoint/ai";
```

### Adding Dependencies

```bash
# Add to a specific package
pnpm add <package> --filter @startpoint/web

# Add to the root (dev tools)
pnpm add -D <package> -w

# Add workspace dependency
pnpm add @startpoint/ui --filter @startpoint/web
```

## Phone Development

For coding from your phone using Claude Code and GitHub:

### Claude Code + GitHub (Recommended)

The easiest way to code from your phone is using Claude Code via the web:

1. **Open Claude** at [claude.ai](https://claude.ai) on your phone browser
2. **Start a conversation** and describe what you want to build/fix
3. **Share code context** by:
   - Pasting file contents from GitHub mobile app
   - Describing the file structure
   - Sharing error messages
4. **Get code from Claude** and commit via GitHub:
   - Copy Claude's code output
   - Open [github.com](https://github.com) on mobile
   - Navigate to the file → Edit (pencil icon)
   - Paste the code and commit

### GitHub Mobile Workflow

```
Phone workflow:
1. GitHub mobile app → View files, issues, PRs
2. Claude (web) → Generate/fix code
3. GitHub web (mobile browser) → Edit files directly
4. Commit → Vercel auto-deploys
```

**Quick edits on GitHub mobile:**
- Go to your repo → Find file → Tap "..." → "Edit file"
- Make changes → Scroll down → Add commit message → Commit

### Using VS Code Remote Tunnels

For a full IDE experience from phone:

1. **On your computer**, start a tunnel:
   ```bash
   code tunnel --accept-server-license-terms
   ```
2. **On your phone**, go to [vscode.dev](https://vscode.dev)
3. Sign in with GitHub and connect to your tunnel
4. Full VS Code experience in your browser

### Using Codespaces

GitHub Codespaces gives you a full dev environment in the cloud:

1. Go to your repo on GitHub
2. Click "Code" → "Codespaces" → "Create codespace"
3. Wait for it to spin up (has Node, pnpm, etc.)
4. Run `pnpm install && pnpm dev`
5. Codespaces auto-forwards port 3000

### Local Testing with ngrok

If you need to test the running app on your phone:

```bash
# On your computer - start dev server
pnpm dev

# In another terminal - expose to internet
npx ngrok http 3000
```

Then open the ngrok URL on your phone to test.

## Features

### Writer Agent (AI Writing Assistant)

The platform includes an AI-powered writing assistant for writers:

- **Rich Text Editor**: TipTap-based editor with formatting, tables, and images
- **AI Chat**: Claude-powered assistant for research and writing
- **Tools**: Web search, academic search, citation formatting, writing analysis
- **Guardrails**: Usage limits, content filtering, project validation
- **Export**: DOCX export with proper formatting

Access at: `/writer/agent`

### Key Workflows

1. **Client Submission**: Public intake form → Project creation
2. **Writer Assignment**: Admin assigns writers to projects
3. **Writing Process**: Writers use the agent to research and write
4. **Export & Delivery**: DOCX export and file upload

## Environment Variables

Required in `apps/web/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Email (Resend)
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# AI (for Writer Agent)
ANTHROPIC_API_KEY=sk-ant-...
BRAVE_SEARCH_API_KEY=your_brave_key
```

## Database Migrations

```bash
# Create a new migration
supabase migration new <name>

# Apply migrations locally
supabase db reset

# Push to production
supabase db push
```

## Deployment

The app is deployed on Vercel:

1. Connect the repository to Vercel
2. Set the root directory to `apps/web`
3. Add environment variables
4. Deploy

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Monorepo**: Turborepo + pnpm
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Claude AI (Anthropic SDK)
- **Email**: Resend
- **Editor**: TipTap (ProseMirror)
