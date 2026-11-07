## Webflow Project Calculator

Next.js 16 + TypeScript + Tailwind CSS codebase for the AI-assisted Webflow estimation tool outlined in `requirements/PRD.md`. The repository is structured around two entry flows (fresh project vs. existing-site analysis) that share a deterministic cost engine, crawler pipeline, and professional export suite.

### Stack Summary

- **Frontend**: Next.js 16 (App Router, Server Components), React 19, Tailwind CSS 3, Geist fonts, shadcn/ui New York theme
- **Backend**: Next.js Route Handlers, Node.js (TypeScript), Prisma ORM + Dockerized PostgreSQL
- **Services**: local mock identity, Redis cache, and optional Firecrawl, OpenRouter and currency API integrations

### Getting Started

1. Ensure you have **Node 20+** and **Docker Desktop** installed.
2. Copy the example configuration. The database and Redis defaults match the local Docker stack; add service keys only for the features you need (see Service Accounts below).

```bash
cp .env.local.example .env.local
npm install
```

3. Boot the local data stack and prepare the database:

```bash
npm run stack:up
npm run prisma:generate
npm run prisma:push
```

4. Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`. Stop the local data stack with `npm run stack:down`.

The current project APIs use a mock `x-user-id` header, not Clerk authentication. For local project API testing, create a `User` with Prisma Studio and set its ID as `NEXT_PUBLIC_MOCK_USER_ID` in `.env.local`. The mock identity is not suitable for protecting production data.

Add more shadcn/ui primitives as needed:

```bash
npx shadcn@latest add button
```

### Database & Prisma

The Prisma schema in `prisma/schema.prisma` defines the base tables (`User`, `Project`, `ProjectResponse`, `CrawlResult`, `CostCalculation`). Useful commands:

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
| PostgreSQL  | System-of-record (Dockerized locally) | Set `DATABASE_URL`; the example matches the compose service |
| Redis       | Rate limiting + crawl cache           | Set `REDIS_URL` to the local compose service or another Redis instance |
| Firecrawl   | Website analysis                      | Set `FIRECRAWL_API_KEY` to enable crawling |
| OpenRouter  | AI complexity analysis                | Set `OPENROUTER_API_KEY` to enable AI analysis |
| currencyapi.com | Live FX rates (USD/EUR/GBP)      | Set `CURRENCY_API_KEY`; without it the app uses static fallback rates |

Clerk authentication and Stripe billing are planned rather than configured in this codebase. Keep real keys in a secure vault and never commit `.env.local`.

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
