## Webflow Project Calculator

Next.js 16 + TypeScript + Tailwind CSS codebase for the AI-assisted Webflow estimation tool outlined in `requirements/PRD.md`. The repository is structured around two entry flows (fresh project vs. existing-site analysis) that share a deterministic cost engine, crawler pipeline, and professional export suite.

### Stack Summary

- **Frontend**: Next.js 16 (App Router, Server Components), React 19, Tailwind CSS 3, Geist fonts, shadcn/ui New York theme
- **Backend**: Next.js Route Handlers, Node.js (TypeScript), Prisma ORM + Dockerized PostgreSQL
- **Infra**: Clerk for auth, Redis cache (later), Firecrawl + OpenRouter integrations (Phase 3+)

### Getting Started

1. Ensure you have **Node 20+** and **Docker Desktop** installed.
2. Copy `.env.local.example` to `.env.local` and fill in Clerk, database, Redis, and API keys (see Service Accounts below).
3. Boot the local data stack:

```bash
npm run stack:up
# tears down with npm run stack:down
```

4. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```
5. Generate the Prisma client after schema changes:

```bash
npm run prisma:generate
```

Add more shadcn/ui primitives as needed:

```bash
npx shadcn@latest add button
```

### Database & Prisma

Prisma schema lives in `prisma/schema.prisma` and is seeded with base tables (`User`, `Project`, `ProjectResponse`, `CrawlResult`, `CostCalculation`). Useful commands:

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run prisma:format`| Format the Prisma schema                      |
| `npm run prisma:generate` | Rebuild Prisma Client after schema changes |
| `npm run prisma:push`  | Sync schema to the local Docker Postgres      |
| `npm run prisma:studio`| Inspect/edit data with Prisma Studio          |

`src/lib/prisma.ts` exports a singleton `PrismaClient` for API routes and server modules.

### Cost Calculation API

- `POST /api/calculations`
  - Request body:
    ```json
    {
      "projectType": "landing_page",
      "tier": "simple",
      "hourlyRate": 95,
      "currency": "usd",
      "multipliers": {
        "design": "standard",
        "functionality": "basic",
        "content": "existing",
        "technical": "basic",
        "timeline": "standard"
      },
      "maintenance": "light"
    }
    ```
  - Response: deterministic hours, total cost, per-phase line items, and multipliers applied. Input validation is handled via Zod in `src/app/api/calculations/route.ts`, and the deterministic engine lives in `src/lib/calculator`.
  - Extras: request rate-limited via Redis (20 req/min per IP) and responses cached for 30 days using the same parameters.

- `POST /api/ai/complexity`
- `GET /api/currency`
  - Response: `{ "data": { "base": "usd", "rates": { "usd": 1, "eur": 0.93, "gbp": 0.79 }, "fetchedAt": 1732300000, "source": "live", "stale": false } }`
  - Used by client components to show FX freshness badges and auto-convert hourly rates when the questionnaire currency selector changes. Rates are cached in Redis for 30 minutes with graceful static fallbacks.

  - Request body:
    ```json
    {
      "projectType": "landing_page",
      "summary": "Migration of 12-page marketing site with advanced interactions...",
      "features": ["CMS collections", "Lottie storytelling"],
      "constraints": ["Timeline: rush", "Maintenance: retainer"],
      "signals": { "pages": 12, "cmsCollections": 4 },
      "entry": "fresh",
      "userType": "agency"
    }
    ```
  - Response: Claude Haiku-derived complexity score, recommended multipliers (design/functionality/content/technical/timeline), confidence scores, and highlights/risks. Implemented in `src/app/api/ai/complexity/route.ts` using the OpenRouter client in `src/lib/openrouter.ts`.
- Current usage: crawl-driven suggestions now appear inline on each questionnaire card with accept/dismiss controls. The AI endpoint remains available for future overlays; its output can still be attached to `/api/calculations` via the optional `aiInsight` field if needed.

Unit tests for the cost engine are located in `__tests__/calculator.test.ts`. Use `npm test` whenever the calculation rules change.

### Service Accounts & Secrets

| Tool        | Purpose                               | Setup                                                                 |
| ----------- | ------------------------------------- | --------------------------------------------------------------------- |
| Clerk       | Auth, user management                 | Create an app at [clerk.com](https://clerk.com), grab publishable + secret keys |
| PostgreSQL  | System-of-record (Dockerized locally) | `DATABASE_URL` already targets the compose service                    |
| Redis       | Rate limiting + crawl cache           | Local compose service, or Upstash URL assigned to `REDIS_URL`         |
| Firecrawl   | Website analysis                      | Create API key at [firecrawl.dev](https://firecrawl.dev)              |
| OpenRouter  | AI orchestration                      | Get API key at [openrouter.ai](https://openrouter.ai)                 |
| currencyapi.com | Live FX rates (USD/EUR/GBP)         | Create a free account at [currencyapi.com](https://currencyapi.com) and set `CURRENCY_API_KEY` |
| Stripe      | Billing (Phase 5)                     | Generate secret + webhook keys in test mode                           |

Document any production keys inside an internal vault; never commit `.env.local`.

Visit `http://localhost:3000` to view the marketing placeholder and start building modules under `src/app`.

### Results Experience

- `/results` renders the MVP cost breakdown surface built in `src/components/results/results-experience.tsx`.
- Data falls back to `getDemoCalculation()` but is now automatically replaced after finishing `/questionnaire`.
- Features: total cost hero, detailed vs tiered breakdown toggle, expandable line items, visual timeline (gantt/phases), AI insight highlights, profit-margin slider, currency-aware formatting, share link shortcut, and PDF export.
- Extend `src/lib/demo/calculation.ts` or wire additional flows (e.g., `/analysis`) to feed live project data.

### Export & Sharing

- Basic PDF exports are powered by `pdf-lib` under `src/lib/export`. `basic-template.ts` normalizes calculation results into shareable sections, and `basic-pdf.ts` renders the watermark, summary grid, breakdown table, timeline, and scope notes.
- Free tier exports apply a `Webflow Calculator · Free Tier` watermark. Use `localStorage.setItem("wpc-feature-tier", "pro")` or set `NEXT_PUBLIC_FEATURE_TIER=pro` in `.env.local` to preview Pro formatting (no watermark + branding hooks).
- The Results surface now exposes a `Download PDF` action that streams the generated blob to the browser for instant sharing.

### Project Structure

```
src/
  app/           # App Router entry, shared layouts, route handlers
  components/    # Shared UI primitives & shadcn/ui building blocks
  hooks/         # Reusable client hooks (placeholder .gitkeep)
  lib/           # Server utilities (DB clients, feature flags)
  pages/         # Legacy Next.js routes (unused; reserved for API routes)
  types/         # Global TypeScript types/schemas
  utils/         # Pure helper functions
requirements/    # Product vision + task backlog (source of truth)
```

### Scripts

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start Next.js in development mode        |
| `npm run build`    | Production build                         |
| `npm run start`    | Run the production server                |
| `npm run lint`     | ESLint with `--max-warnings=0`           |
| `npm test`         | Run Jest unit tests                      |
| `npm run typecheck`| Run `tsc --noEmit`                       |
| `npm run format`   | Format with Prettier + Tailwind plugin   |

### Workflow

- **Trunk-based**: branch from `main`, keep changes small, open PRs referencing task IDs from `requirements/tasks.json`.
- **Source of Truth**: update PRD/task files if the implementation deviates.
- **Quality Gates**: `lint`, `typecheck`, and relevant tests must pass before merging. Add or update tests alongside feature work.

### Next Steps

1. Wire up Dockerized PostgreSQL + Prisma/Drizzle migrations.
2. Integrate Clerk auth surfaces for onboarding.
3. Build the questionnaire JSON config + deterministic calculation engine to unblock MVP flows.
