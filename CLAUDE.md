# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

RERA transparency and intelligence platform for India (domain TBD — working name "ReraPedia"). Aggregates public RERA data from state regulatory portals, scores projects on trustworthiness, and monetizes through builder/broker dashboards, lead generation, self-serve ads, and premium subscriptions. Competing directly with RERAScore.in but differentiated by NCR coverage (Haryana + Delhi), full commercial layer, Hindi language support, and deep SEO content.

**Primary competitor:** RERAScore.in (62K projects, 3 states, zero monetization, no Haryana/Delhi, English only)

**Dev environment:** MacBook Air 8GB RAM. EaseMySale (CI4/PHP/MySQL :8080/:3000/:3306) runs on same machine. This project uses :3001/:5432. Never run both dev servers simultaneously — stop one before starting the other. See `docs/LOCAL_SETUP.md` for resource management.

## Tech Stack

- **Frontend:** Next.js 14+ (App Router) with TypeScript strict mode, Tailwind CSS, next-intl for i18n (English + Hindi)
- **Backend:** Next.js API Routes + standalone Node.js services for scraping workers
- **Database:** PostgreSQL via Supabase (primary), Redis via Upstash (cache/sessions/queues)
- **Search:** Meilisearch (self-hosted or Cloud) for instant project/builder/locality search
- **Scraping:** Python 3.11+ with Scrapy + Playwright for JS-heavy RERA portals
- **Queue:** BullMQ (Redis-backed) for scraping schedules, email jobs, report generation
- **Auth:** NextAuth.js with credentials, Google, and OTP-based phone login
- **Payments:** Razorpay (subscriptions, lead purchases, ad billing, invoicing)
- **Storage:** Cloudflare R2 for RERA documents, PDFs, builder logos, ad creatives
- **Maps:** Mapbox GL JS for interactive project map views
- **Email:** Resend for transactional, alerts, and newsletters
- **Analytics:** PostHog for product analytics, Plausible for traffic
- **Monitoring:** Sentry for errors, Uptime Robot for uptime
- **Deployment:** Vercel (frontend), Railway (backend services, scraping workers, Meilisearch)

## Commands

- `npm run dev` — Start Next.js dev server (port 3000)
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run type-check` — TypeScript strict check
- `npm run test` — Run Vitest unit tests
- `npm run test:e2e` — Run Playwright E2E tests
- `npm run db:migrate` — Run Prisma migrations against Supabase
- `npm run db:seed` — Seed database with sample data
- `npm run db:studio` — Open Prisma Studio
- `npm run search:sync` — Sync PostgreSQL data to Meilisearch index
- `npm run scrape:up-rera` — Run UP-RERA scraper manually
- `npm run scrape:haryana-rera` — Run Haryana-RERA scraper manually
- `npm run scrape:delhi-rera` — Run Delhi-RERA scraper manually
- `npm run scrape:all` — Run all state scrapers sequentially
- `npm run leads:report` — Generate daily lead summary
- `npm run emails:send-alerts` — Process and send project change alerts
- `./dev.sh` — Start all ReraPedia services (PostgreSQL, Redis db1, Meilisearch) + Next.js on :3001
- `./stop.sh` — Stop ReraPedia services to free RAM for EaseMySale

## 8GB RAM Workflow

This machine has 8GB RAM shared with EaseMySale. Follow these rules strictly:
- **NEVER run both EaseMySale and ReraPedia dev servers at the same time**
- Before starting ReraPedia: stop EaseMySale (`cd ~/Projects/easemysale && php spark serve` must be killed, React dev server must be killed)
- Before starting EaseMySale: run `./stop.sh` in ReraPedia root to free resources
- Keep Meilisearch and Redis running always (shared, low footprint ~150MB combined)
- MySQL and PostgreSQL can both run simultaneously (~300MB combined)
- Close all unnecessary browser tabs and apps before development
- Use `pnpm dev --turbo` for faster Next.js compilation with less memory

## Architecture

```
gharscore/
├── apps/
│   └── web/                    # Next.js frontend + API routes
│       ├── app/                # App Router pages and layouts
│       │   ├── (public)/       # Public pages (project, builder, locality, search, blog)
│       │   ├── (auth)/         # Auth pages (login, register, verify)
│       │   ├── dashboard/      # Role-based dashboards
│       │   │   ├── builder/    # Builder dashboard (claim, analytics, leads, ads)
│       │   │   ├── broker/     # Broker dashboard (leads, CRM, market intel)
│       │   │   ├── investor/   # Investor dashboard (portfolio, alerts, reports)
│       │   │   └── admin/      # Admin panel (scraping, revenue, moderation)
│       │   └── api/            # API routes
│       │       ├── auth/       # NextAuth endpoints
│       │       ├── projects/   # Project data endpoints
│       │       ├── builders/   # Builder data endpoints
│       │       ├── search/     # Search proxy to Meilisearch
│       │       ├── leads/      # Lead capture and distribution
│       │       ├── ads/        # Ad serving, impression/click tracking
│       │       ├── payments/   # Razorpay webhooks, subscription management
│       │       └── webhooks/   # External service webhooks
│       ├── components/
│       │   ├── ui/             # Reusable UI components (shadcn/ui based)
│       │   ├── forms/          # Lead capture, contact, search forms
│       │   ├── charts/         # Recharts-based data visualizations
│       │   ├── maps/           # Mapbox map components
│       │   └── ads/            # Ad placement components
│       ├── lib/
│       │   ├── db/             # Prisma client, queries, transactions
│       │   ├── auth/           # Auth utilities, role checks
│       │   ├── search/         # Meilisearch client and index config
│       │   ├── payments/       # Razorpay client, subscription helpers
│       │   ├── email/          # Email templates and sending
│       │   ├── scoring/        # Trust score calculation engine
│       │   ├── seo/            # Meta tag generators, schema markup (JSON-LD)
│       │   └── utils/          # Shared utilities
│       └── messages/           # i18n translation files (en.json, hi.json)
├── packages/
│   ├── scrapers/               # Python scraping package
│   │   ├── spiders/            # Per-state Scrapy spiders
│   │   │   ├── up_rera.py
│   │   │   ├── haryana_rera.py
│   │   │   ├── delhi_rera.py
│   │   │   └── maha_rera.py
│   │   ├── pipelines/          # Data cleaning, dedup, geocoding
│   │   ├── middlewares/        # Proxy rotation, rate limiting, CAPTCHA
│   │   └── schedules/          # Cron job definitions for BullMQ
│   ├── scoring-engine/         # Trust score calculation (TypeScript)
│   │   ├── dimensions/         # Individual scoring dimensions
│   │   │   ├── delivery.ts
│   │   │   ├── documents.ts
│   │   │   ├── legal-risk.ts
│   │   │   ├── financial.ts
│   │   │   ├── registration.ts
│   │   │   ├── neighbourhood.ts  # Our unique dimension (not in RERAScore)
│   │   │   └── builder-history.ts # Our unique dimension
│   │   └── calculator.ts       # Weighted score aggregator
│   └── shared/                 # Shared types, constants, validation schemas (Zod)
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration files
├── docs/
│   ├── BLUEPRINT_v1.md         # Full system design document
│   ├── COMPETITIVE_STRATEGY.md # RERAScore analysis and competitive positioning
│   ├── DATABASE_SCHEMA.md      # Detailed schema documentation
│   ├── API_SPEC.md             # API endpoint specifications
│   ├── SCORING_METHODOLOGY.md  # Trust score calculation rules
│   └── SCRAPER_GUIDE.md        # How to add a new state scraper
└── infrastructure/
    ├── docker-compose.yml      # Local dev (Postgres, Redis, Meilisearch)
    └── scripts/                # Deployment and utility scripts
```

## Database

PostgreSQL via Supabase with Prisma ORM. See `prisma/schema.prisma` for the full schema and `docs/DATABASE_SCHEMA.md` for documentation.

**Core entity groups:**
- Projects, Builders, Localities, States (RERA data layer)
- Users, Sessions, SavedProjects, SearchHistory (user layer)
- Subscriptions, Plans, Leads, LeadPurchases (monetization)
- AdCampaigns, AdCreatives, AdImpressions, AdClicks (advertising)
- Invoices, Payouts (billing)
- BlogPosts, FAQs, Reviews, SEOPages (content/SEO)
- ProjectTimeline, Complaints, ProjectDocuments (audit trail)

**Key conventions:**
- All tables use `uuid` primary keys (Prisma `@default(uuid())`)
- Timestamps: `createdAt`, `updatedAt` on every table
- Soft deletes: `deletedAt` nullable timestamp (never hard delete user data)
- Slug fields on Projects, Builders, Localities for SEO-friendly URLs
- All monetary values stored as integers in paise (1 rupee = 100 paise)
- JSONB columns for flexible data: `metadata`, `config`, `features_json`

## User Roles

Five roles with strict RBAC. Check role in middleware before every dashboard route.

| Role | Access |
|------|--------|
| `PUBLIC` | Read-only project/builder/locality pages, search, blog |
| `BUYER` | Above + save projects, alerts, reviews, search history |
| `BUILDER` | Above + builder dashboard, claim profile, manage leads, run ads |
| `BROKER` | Above + broker dashboard, buy leads, CRM, market intel |
| `ADMIN` | Full access: scraping, moderation, revenue, user management |

Investor features are a premium tier within the BUYER role (check `subscription.plan`).

## Code Style

- TypeScript strict mode everywhere — never use `any`
- Use named exports, not default exports (except Next.js pages/layouts)
- Tailwind CSS for all styling — no CSS modules, no styled-components
- Server Components by default, Client Components only when interactivity is needed (prefix with `"use client"`)
- Zod for all input validation (API routes, forms, scraper output)
- All API routes return typed responses: `{ success: boolean, data?: T, error?: string }`
- Use `@/` path alias for imports from project root
- Prefer `async/await` over `.then()` chains
- Error handling: try/catch in API routes, error boundaries in React
- All user-facing strings must use next-intl `t()` function for i18n

## SEO Conventions

SEO is the primary growth engine. Every public page must have:
- Unique `<title>` and `<meta description>` within Google's character limits
- Open Graph and Twitter Card meta tags
- JSON-LD structured data (FAQ Schema on project/builder pages, Organization Schema on builder profiles, BreadcrumbList on all pages)
- Canonical URL
- Hindi alternate via `hreflang` tags
- Internal links to related projects, builders, and localities

**URL patterns (do not change — SEO depends on stable URLs):**
- `/project/[state-slug]/[project-slug]` — Project pages
- `/builder/[builder-slug]` — Builder profiles
- `/locality/[state-slug]/[city-slug]/[locality-slug]` — Locality reports
- `/state/[state-slug]` — State RERA hub pages
- `/compare/[type]/[slug-a]-vs-[slug-b]` — Comparison pages
- `/blog/[slug]` — Blog posts
- `/search` — Search results page
- `/dashboard/builder` — Builder dashboard
- `/dashboard/broker` — Broker dashboard
- `/dashboard/investor` — Investor dashboard
- `/dashboard/admin` — Admin panel

## Scraping Rules

- Each state RERA portal has its own Scrapy spider in `packages/scrapers/spiders/`
- Spiders must respect `robots.txt` and use rate limiting (max 2 requests/second)
- Use rotating proxy middleware for production scraping
- All scraped data goes to staging tables first (`_raw` suffix), then cleaned pipeline writes to production tables
- Change detection: compare current scrape with last known state, log diffs to `project_timeline`
- Store raw HTML responses in R2 for audit/debugging (30-day retention)
- Spider output must pass Zod validation before database insert
- New state scrapers must follow the template in `docs/SCRAPER_GUIDE.md`

## Scoring Engine

Trust Score is 0-100, calculated from 8 weighted dimensions (our improvement over RERAScore's 6):

| Dimension | Weight | Source |
|-----------|--------|--------|
| Delivery Track Record | 25 pts | RERA data: completion %, deadline extensions, phase delivery |
| Document Compliance | 15 pts | RERA data: required docs uploaded, QPR submissions |
| Legal Risk | 15 pts | RERA data: complaints filed, resolution rate, RERA orders |
| Financial Transparency | 10 pts | RERA data: bank account, financial statements |
| Registration Quality | 10 pts | RERA data: timely renewals, information accuracy |
| Builder History | 10 pts | Cross-project analysis: builder's record across ALL projects |
| Neighbourhood Quality | 10 pts | External data: metro proximity, schools, hospitals, AQI |
| Market Confidence | 5 pts | Agent network size, recent search interest, price trends |

Score recalculates on every data update. Cache in Redis with 1-hour TTL.

## Monetization Integration Points

Every public page must include these revenue touchpoints:
- **Lead capture form** on project and builder pages (soft-gated: name + phone required)
- **Ad placements**: header banner (728x90), sidebar (300x250), in-content native ad, search results sponsored listings
- **"Claim This Profile" CTA** on unclaimed builder profiles → leads to builder subscription signup
- **Affiliate links** for home loans and legal services on relevant pages
- **Premium upsell** triggers when free users hit limits (>10 saved projects, PDF reports, builder comparison)

Razorpay integration handles: subscriptions (auto-debit), one-time lead purchases, ad campaign billing (prepaid wallet), invoice generation.

## Testing

- **Unit tests:** Vitest for scoring engine, utility functions, API route handlers
- **Integration tests:** Test database queries with Prisma + test database
- **E2E tests:** Playwright for critical user flows (search → project page → lead form, builder login → dashboard, payment flow)
- **Scraper tests:** Mock RERA responses for each spider, validate output schema
- Run `npm run test` before every commit. Run `npm run test:e2e` before every deploy.

## Environment Variables

Required in `.env.local` (never commit):
```
DATABASE_URL=               # Supabase PostgreSQL connection string
DIRECT_URL=                 # Supabase direct connection (for migrations)
REDIS_URL=                  # Upstash Redis URL
NEXTAUTH_SECRET=            # Random secret for NextAuth
NEXTAUTH_URL=               # http://localhost:3000 in dev
RAZORPAY_KEY_ID=            # Razorpay API key
RAZORPAY_KEY_SECRET=        # Razorpay secret
MEILISEARCH_HOST=           # Meilisearch URL
MEILISEARCH_API_KEY=        # Meilisearch admin key
MAPBOX_ACCESS_TOKEN=        # Mapbox GL JS token
R2_ACCOUNT_ID=              # Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
RESEND_API_KEY=             # Email service
POSTHOG_KEY=                # Product analytics
SENTRY_DSN=                 # Error tracking
GOOGLE_CLIENT_ID=           # Google OAuth
GOOGLE_CLIENT_SECRET=
```

## Git Workflow

- `main` — Production branch, auto-deploys to Vercel
- `develop` — Integration branch for feature merges
- `feature/*` — Feature branches off develop
- `fix/*` — Bug fix branches
- `scraper/*` — New state scraper branches
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `scraper:`
- Squash merge to develop, merge commit to main
- Never force push to main or develop

## Important Gotchas

- **RERA URLs are not stable** — State portals change URL structures without notice. Scrapers must handle 404s gracefully and alert admin.
- **Monetary values in paise** — ₹5,000 is stored as `500000`. Convert only at display layer.
- **Hindi translations** — Never hardcode Hindi strings. Always use `messages/hi.json` via next-intl. Verify RTL is not needed (Hindi is LTR).
- **Lead deduplication** — Same buyer can submit interest on multiple projects. Deduplicate by phone number within 24-hour window before billing builders.
- **Ad impression counting** — Use server-side counting only (not client JS) to prevent fraud. One impression per unique user per ad per page per hour.
- **Score caching** — Trust scores are expensive to compute. Always serve from Redis cache. Invalidate only when new scraper data arrives for that project.
- **Image optimization** — All builder logos and ad creatives served via Next.js Image component with Cloudflare R2 loader. Max 500KB upload limit.
- **robots.txt** — Allow all public pages for Googlebot. Block `/dashboard/*` and `/api/*`.

## Do NOT

- Modify scoring weights without updating `docs/SCORING_METHODOLOGY.md` and recalculating all scores
- Change URL patterns on public pages (breaks SEO rankings and indexed links)
- Store PII (Aadhaar, PAN) in the database — only store GSTIN for builder verification
- Bypass Razorpay for any payment — no manual payment recording
- Hard-delete any user data — use soft deletes (`deletedAt` timestamp)
- Deploy scraper changes without testing against mock data first
- Add new npm dependencies without checking bundle size impact (`npm run analyze`)
- Skip Zod validation on any API route or form submission
- Use `console.log` in production — use structured logger (`lib/logger.ts`)

## Sprint Reference

Development follows this priority order (from Blueprint v1.0 and Competitive Strategy v2.0):

1. **Sprint 1-2:** Database schema + Haryana/Delhi/UP RERA scrapers + data cleaning pipeline
2. **Sprint 3-4:** Next.js project + project page + builder profile + search (Meilisearch)
3. **Sprint 5-6:** User auth + saved projects + email alerts + AdSense integration
4. **Sprint 7-8:** Blog CMS + first 20 SEO articles (EN + HI) + sitemap submission
5. **Sprint 9-10:** Builder dashboard + profile claiming + Razorpay subscriptions
6. **Sprint 11-12:** Lead capture system + broker dashboard + ad platform v1
7. **Sprint 13-14:** Investor premium features + WhatsApp bot MVP
8. **Sprint 15-16:** Maharashtra RERA scraper + national expansion prep

See `docs/BLUEPRINT_v1.md` for full system design and `docs/COMPETITIVE_STRATEGY.md` for competitive positioning against RERAScore.in.

## When Compacting

When compacting this conversation, always preserve: the full list of modified files, current sprint number and active tasks, any failing tests or scraper errors, database migration state, and deployment status.
