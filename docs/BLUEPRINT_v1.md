# RERA Transparency & Intelligence Platform — System Design Blueprint v1.0

> **Prepared for:** Manglesh – Jain Perfumers
> **Version:** 1.0 | March 2026
> **Status:** CONFIDENTIAL — FOR INTERNAL USE ONLY

---

## 1. Executive Summary

This platform is envisioned as India's first dedicated RERA transparency and intelligence platform. Unlike property listing portals (99acres, MagicBricks, NoBroker), this platform does not list properties for sale. Instead, it aggregates, cleans, and presents publicly available RERA regulatory data from all state RERA authorities, starting with Delhi-NCR (UP-RERA, Haryana-RERA, Delhi-RERA).

**The Core Problem:** India has 30+ state RERA websites, each with different formats, broken search, poor UX, and no cross-state comparison capability. Home buyers, investors, lawyers, and NRIs currently have no single source to verify builder track records, project compliance status, delay history, or complaint data.

**The Solution:** A fast, searchable, SEO-optimized platform that becomes the "Google of RERA data" — where any person can search a builder name, project name, or locality and get an instant, comprehensive compliance profile with scores, timelines, and alerts.

**Revenue Model:** Advertising (display ads + sponsored placements), lead generation for builders/brokers/legal firms, premium subscriptions for investors and professionals, builder dashboard subscriptions, and data API licensing.

**Initial Investment:** Approximately ₹50,000 – ₹1,00,000 for the first 6 months (domain, hosting, scraping infrastructure). No team hiring needed initially — the platform can be built and managed by a single person using Claude Code.

**Target Market (Phase 1 — NCR):** Over 1,300+ active RERA-registered projects across Delhi, Gurgaon, Noida, Greater Noida, Ghaziabad, and Faridabad. Total real estate investment in NCR assets was USD 3–3.5 billion in 2025, with 14,248 new units launched in Q4 2025 alone.

---

## 2. System Architecture Overview

The platform is designed as a modern, scalable, event-driven architecture with clear separation of concerns. Every component is chosen for cost-effectiveness at low scale and horizontal scalability as the platform grows.

### 2.1 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14 (React) + Tailwind CSS | SSR/SSG for SEO, fast page loads, Vercel deployment |
| Backend API | Node.js + Next.js API Routes | JavaScript full-stack, fast development, large ecosystem |
| Database (Primary) | PostgreSQL (Supabase or Railway) | ACID compliance, full-text search, JSON support, free tiers |
| Cache Layer | Redis (Upstash serverless) | Sub-millisecond response for hot data, session management |
| Search Engine | Meilisearch (self-hosted) or Algolia | Instant search with typo tolerance, faceted filtering |
| Scraping Engine | Python (Scrapy + Playwright) | Handles JS-rendered RERA sites, anti-bot bypassing |
| Task Queue | BullMQ (Redis-backed) | Scheduled scraping jobs, email queues, report generation |
| File Storage | Cloudflare R2 or AWS S3 | RERA documents, PDFs, builder logos at minimal cost |
| CDN / Hosting | Vercel (frontend) + Railway (backend) | Global CDN, auto-scaling, generous free tiers |
| Authentication | NextAuth.js + JWT | Social login, email OTP, role-based access control |
| Payment Gateway | Razorpay | Indian payments, subscriptions, auto-debit, UPI support |
| Email Service | Resend or AWS SES | Transactional emails, alerts, newsletters |
| Analytics | Plausible or PostHog | Privacy-first, no cookie consent needed, event tracking |
| Monitoring | Sentry + Uptime Robot | Error tracking, uptime alerts, performance monitoring |

### 2.2 Architecture Layers

**Layer 1: Data Ingestion Pipeline**
- Scrapy spiders configured per state RERA website (UP-RERA, Haryana-RERA, Delhi-RERA, Maharashtra-RERA, etc.)
- Playwright browser automation for JavaScript-heavy RERA portals
- Scheduled via BullMQ cron jobs (daily full scrape, hourly delta checks for active projects)
- Raw data stored in PostgreSQL staging tables with version history
- Data cleaning pipeline: deduplication, name normalization, address geocoding
- Change detection engine: compares current vs previous scrape, flags changes (status updates, deadline extensions, new complaints)

**Layer 2: Core Application**
- Next.js application with server-side rendering for SEO-critical pages
- Static generation (ISR) for project pages, builder profiles, locality pages
- API routes for dynamic data (search, filters, dashboard endpoints)
- Redis caching for frequently accessed data (top builders, trending projects)
- Meilisearch index synced from PostgreSQL for instant search

**Layer 3: User-Facing Interfaces**
- Public website: Search, browse, project pages, builder profiles, locality reports
- Builder Dashboard: Claimed profiles, analytics, lead management, ad campaigns
- Broker/Agent Dashboard: Lead purchases, saved searches, client management
- Admin Panel: Content moderation, scraping health, revenue analytics, user management
- Investor Dashboard: Portfolio tracking, alert configuration, market analytics

### 2.3 Database Schema Design

#### Core Entities

| Table Name | Key Fields | Purpose |
|-----------|-----------|---------|
| states | id, name, slug, rera_website_url, scrape_config_json | Master list of Indian states with RERA portal details |
| projects | id, state_id, rera_reg_number, name, slug, builder_id, status, type, locality, city, pincode, lat, lng, total_units, carpet_area_range, price_range, possession_date_original, possession_date_revised, rera_registration_date, rera_expiry_date, completion_percentage, compliance_score, last_scraped_at | Central table — one row per RERA-registered project |
| builders | id, name, slug, pan, gstin, registered_address, website, phone, email, total_projects, avg_compliance_score, trust_score, is_claimed, claimed_by_user_id, logo_url, description | Builder/Promoter profiles with aggregated metrics |
| project_timeline | id, project_id, event_type, old_value, new_value, detected_at, source_url | Full audit trail of every change detected by scraper |
| complaints | id, project_id, builder_id, complaint_number, complainant_type, subject, status, filed_date, resolved_date, rera_order_url | RERA complaints and their resolution status |
| project_documents | id, project_id, doc_type, file_url, uploaded_at | Documents associated with RERA projects |
| localities | id, name, slug, city, state_id, lat, lng, avg_price_sqft, total_projects, description, seo_title, seo_description | Locality/micro-market master for SEO pages |

#### User & Authentication

| Table Name | Key Fields | Purpose |
|-----------|-----------|---------|
| users | id, email, phone, name, role, password_hash, avatar_url, is_verified, subscription_plan, created_at | All platform users with role-based access |
| user_sessions | id, user_id, token, ip_address, user_agent, expires_at | Active sessions for security and analytics |
| user_saved_projects | id, user_id, project_id, alert_enabled, created_at | Bookmarked projects with optional change alerts |
| user_search_history | id, user_id, query, filters_json, results_count, searched_at | Search analytics for personalization and insights |

#### Monetization & Commerce

| Table Name | Key Fields | Purpose |
|-----------|-----------|---------|
| subscriptions | id, user_id, plan_id, status, razorpay_subscription_id, current_period_start, current_period_end, auto_renew | Builder/broker/investor subscription management |
| plans | id, name, slug, price_monthly, price_annual, features_json, target_role, is_active | Subscription plan definitions |
| leads | id, source_page, source_type, buyer_user_id, builder_id, broker_id, status, buyer_name, buyer_phone, buyer_email, property_interest, budget_range, created_at | Lead capture and distribution system |
| lead_purchases | id, lead_id, purchased_by_user_id, price_paid, purchased_at | When builders/brokers buy leads |
| ad_campaigns | id, advertiser_user_id, campaign_name, ad_type, budget_total, budget_daily, spent, cpc_bid, cpm_bid, status, start_date, end_date, target_states, target_cities, target_localities | Self-serve advertising campaigns |
| ad_creatives | id, campaign_id, image_url, headline, description, cta_text, destination_url, is_approved | Ad creative assets linked to campaigns |
| ad_impressions | id, campaign_id, creative_id, page_url, user_id, ip_address, timestamp | Impression tracking for billing and analytics |
| ad_clicks | id, impression_id, campaign_id, creative_id, user_id, ip_address, timestamp | Click tracking for CPC billing |
| invoices | id, user_id, invoice_number, amount, tax_gst, total, status, razorpay_payment_id, issued_at, due_at, paid_at, pdf_url | Unified invoicing for all revenue streams |
| payouts | id, user_id, amount, method, status, reference_number, initiated_at, completed_at | Payouts to referral partners if applicable |

#### Content & SEO

| Table Name | Key Fields | Purpose |
|-----------|-----------|---------|
| blog_posts | id, title, slug, content_html, author_id, category, tags, seo_title, seo_description, featured_image_url, status, published_at | Blog/news articles for SEO content marketing |
| faqs | id, entity_type, entity_id, question, answer, sort_order | FAQ content for rich snippet Schema markup |
| reviews | id, project_id, builder_id, user_id, rating, title, content, is_verified_buyer, status, created_at | User reviews with moderation workflow |
| seo_pages | id, page_type, slug, title, meta_description, content_html, schema_json, canonical_url | Programmatic SEO pages for long-tail traffic |

---

## 3. User Roles & Dashboard Specifications

### 3.1 Role 1: Public Visitor (No Login Required)

The majority of traffic will be anonymous visitors arriving via Google search. Their experience must be fast, informative, and conversion-optimized.

- Full access to project pages, builder profiles, locality reports
- Search with instant results (Meilisearch-powered)
- Filter by: state, city, locality, builder, status, project type, possession year, compliance score
- View RERA compliance scores, timeline changes, complaint history
- Read blog posts, news, and comparison articles
- Soft-gated features: saving projects, setting alerts, viewing full complaint details requires free registration
- Display ads shown on all public pages (banner, sidebar, in-content)

### 3.2 Role 2: Registered Buyer / Investor

**Free Tier Features:**
- Save up to 10 projects to watchlist
- Email alerts when saved projects have status changes
- View full complaint details and RERA orders
- Post reviews for projects they have purchased
- Basic search history

**Premium Investor Dashboard (₹999/month or ₹9,999/year):**
- Unlimited project watchlist with real-time change alerts (SMS + Email)
- Builder comparison tool: compare up to 5 builders side-by-side on compliance, delays, complaints
- Locality analytics: price trends, project density, infrastructure development tracker
- Portfolio tracker: add owned properties, track their RERA status and market value estimates
- Downloadable PDF reports for any project or builder (branded, shareable)
- Priority access to new data (processed before public pages update)
- Ad-free experience across the entire platform
- API access for power users (100 calls/day)

### 3.3 Role 3: Builder / Promoter Dashboard

Builders can claim their profile (verified via RERA registration details + PAN/GSTIN match) and access a comprehensive dashboard to manage their reputation, respond to market signals, and generate leads.

**Builder Free Tier:**
- Claim and verify builder profile
- Add company logo, description, and website link
- View public compliance score and how it is calculated
- See total page views on their projects (last 30 days)

**Builder Silver Plan (₹5,000/month):**
- Everything in Free, plus:
  - Respond publicly to reviews
  - Add project galleries (images, videos, virtual tours)
  - Access to lead dashboard: view and purchase buyer leads interested in their projects
  - Lead pricing: ₹200–500 per lead depending on project value and locality
  - Basic analytics: page views, search impressions, lead funnel by project
  - "Verified Builder" badge on profile and all project pages

**Builder Gold Plan (₹15,000/month):**
- Everything in Silver, plus:
  - Featured placement in search results for their city/locality
  - Sponsored project listings on competitor project pages
  - Advanced analytics: competitor benchmarking, market share, sentiment analysis from reviews
  - Lead credits: 20 free leads/month included (worth ₹4,000–10,000)
  - Dedicated account manager (for Gold annual subscribers)
  - API access to their own data for integration with their CRM
  - Custom branded PDF reports for their projects (for sales team use)

### 3.4 Role 4: Broker / Real Estate Agent Dashboard

**Broker Plan (₹2,999/month):**
- Verified agent profile with photo, RERA agent registration number, and contact details
- Lead marketplace: browse and purchase buyer leads by locality, budget, and property type
- Lead pricing: ₹150–400 per lead (lower than builder pricing to encourage volume)
- Saved search alerts: get notified when new projects match criteria their clients are looking for
- Client management CRM: track leads, add notes, mark status (contacted/site visit/converted)
- Market intelligence: locality-wise new launch tracker, price trend alerts
- Co-branded project reports to share with clients

### 3.5 Role 5: Admin Dashboard

The admin panel is the operational nerve center of the platform:

- Scraping Health Monitor: status of each state scraper, last run time, records added/updated/failed, error logs
- Data Quality Dashboard: duplicate detection, missing fields, anomaly alerts
- Revenue Dashboard: daily/weekly/monthly revenue by stream (ads, subscriptions, leads), MRR, churn rate, ARPU
- User Management: user list with roles, subscription status, activity logs, ban/suspend capability
- Content Moderation: review queue for user-submitted reviews, builder profile claims, ad creative approvals
- Ad Campaign Manager: approve/reject ad creatives, view campaign performance, manage ad inventory
- SEO Performance: Google Search Console integration, top pages, ranking tracker for target keywords
- Support Ticket System: handle user complaints, builder disputes, billing issues

---

## 4. Monetization Model — Complete Revenue Architecture

The platform is designed with seven distinct revenue streams, layered to grow naturally with traffic and user base.

### 4.1 Revenue Stream 1: Display Advertising

| Placement | Format | Location | Est. eCPM (INR) |
|-----------|--------|----------|-----------------|
| Header Leaderboard | 728x90 Banner | Top of every page below navigation | ₹80–150 |
| Sidebar Sticky | 300x250 Rectangle | Right sidebar on project/builder pages | ₹60–120 |
| In-Content | Native Ad Unit | Between FAQ sections on project pages | ₹100–200 |
| Search Results | Sponsored Listing | Top 2 positions in search results | ₹150–300 |
| Builder Profile | Competitor Ad | Sidebar on builder profile pages | ₹120–250 |
| Locality Page | Featured Projects | Top section of locality report pages | ₹100–200 |
| Footer Anchor | 320x50 Mobile | Bottom-fixed on mobile pages | ₹40–80 |

### 4.2 Revenue Stream 2: Self-Serve Advertising Platform

- Sponsored Search Listings: CPC model (₹15–50 per click)
- Featured Builder Badge: CPM model
- Banner Campaigns: CPM model across specific cities/localities
- Competitor Targeting: CPC model, show ads on competitor builder pages
- Retargeting Campaigns: Show ads to users who previously viewed specific projects

### 4.3 Revenue Stream 3: Lead Generation

| Lead Type | Price to Builder | Price to Broker | Est. Volume (Month 12) |
|-----------|-----------------|-----------------|----------------------|
| Project Interest (Luxury >2Cr) | ₹1,500–2,000 | ₹800–1,200 | 50–100 leads/month |
| Project Interest (Mid 50L–2Cr) | ₹500–800 | ₹300–500 | 200–400 leads/month |
| Project Interest (Affordable <50L) | ₹200–400 | ₹150–250 | 100–200 leads/month |
| Builder Inquiry (General) | ₹300–500 | N/A | 100–200 leads/month |
| Legal Consultation Request | N/A (sold to law firms) | ₹500–1,000 | 50–100 leads/month |
| Home Loan Inquiry | N/A (sold to banks/NBFCs) | ₹200–400 | 100–200 leads/month |

### 4.4 Revenue Stream 4: Subscriptions

| Plan | Monthly Price | Annual Price | Target Users | Projected Subscribers (Year 1) |
|------|-------------|-------------|-------------|------------------------------|
| Investor Premium | ₹999 | ₹9,999 | Individual investors, NRIs | 200–500 |
| Builder Silver | ₹5,000 | ₹50,000 | Small/mid builders | 50–100 |
| Builder Gold | ₹15,000 | ₹1,50,000 | Large builders/developers | 20–50 |
| Broker Plan | ₹2,999 | ₹29,999 | Real estate agents | 100–200 |
| Enterprise/API | ₹25,000+ | Custom | PropTech companies, banks | 5–15 |

### 4.5 Revenue Stream 5: Data API Licensing

- Starter: 1,000 API calls/month — ₹5,000/month
- Professional: 10,000 API calls/month — ₹25,000/month
- Enterprise: Unlimited + custom feeds — ₹1,00,000+/month

### 4.6 Revenue Stream 6: Sponsored Content & Reports

- Builder Spotlight articles: ₹10,000–25,000 per article
- Locality Market Reports (sponsored): ₹15,000–50,000
- Annual Real Estate Transparency Report (flagship, sponsored): ₹2,00,000–5,00,000

### 4.7 Revenue Stream 7: Affiliate & Referral Commissions

- Home loan referrals to banks/NBFCs: ₹1,000–5,000 per disbursed loan
- Legal service referrals: ₹500–2,000 per client
- Interior design / home service referrals: ₹200–500 per lead
- Property insurance referrals: commission-based

---

## 5. Revenue Projections — 3-Year Forecast

### Year 1 — NCR Focus (Delhi + Haryana + UP)

| Revenue Stream | Month 3 | Month 6 | Month 9 | Month 12 |
|---------------|---------|---------|---------|----------|
| Display Ads | ₹500 | ₹2,400 | ₹10,500 | ₹28,800 |
| Self-Serve Ads | ₹0 | ₹0 | ₹5,000 | ₹20,000 |
| Lead Generation | ₹0 | ₹5,000 | ₹25,000 | ₹1,00,000 |
| Builder Subscriptions | ₹0 | ₹0 | ₹15,000 | ₹50,000 |
| Broker Subscriptions | ₹0 | ₹0 | ₹6,000 | ₹20,000 |
| Investor Subscriptions | ₹0 | ₹0 | ₹3,000 | ₹10,000 |
| Affiliate/Referral | ₹0 | ₹0 | ₹2,000 | ₹10,000 |
| **TOTAL MONTHLY** | **₹500** | **₹7,400** | **₹66,500** | **₹2,38,800** |

### Year 2 — National Expansion (Top 10 States)

| Revenue Stream | Month 15 | Month 18 | Month 21 | Month 24 |
|---------------|----------|----------|----------|----------|
| Display Ads | ₹50,000 | ₹83,300 | ₹1,40,000 | ₹2,16,000 |
| Self-Serve Ads | ₹40,000 | ₹75,000 | ₹1,20,000 | ₹1,80,000 |
| Lead Generation | ₹2,00,000 | ₹3,50,000 | ₹5,00,000 | ₹7,00,000 |
| Subscriptions (All) | ₹1,20,000 | ₹2,00,000 | ₹3,00,000 | ₹4,00,000 |
| Data API | ₹10,000 | ₹30,000 | ₹60,000 | ₹1,00,000 |
| Sponsored Content | ₹25,000 | ₹50,000 | ₹75,000 | ₹1,00,000 |
| Affiliate/Referral | ₹20,000 | ₹40,000 | ₹60,000 | ₹80,000 |
| **TOTAL MONTHLY** | **₹4,65,000** | **₹8,28,300** | **₹12,55,000** | **₹17,76,000** |

### Year 3 — Market Leadership (All States + Mobile App)

| Revenue Stream | Month 30 | Month 36 |
|---------------|----------|----------|
| Display Ads | ₹5,00,000 | ₹8,28,000 |
| Self-Serve Ads | ₹4,00,000 | ₹7,00,000 |
| Lead Generation | ₹12,00,000 | ₹20,00,000 |
| Subscriptions (All) | ₹8,00,000 | ₹15,00,000 |
| Data API | ₹2,00,000 | ₹5,00,000 |
| Sponsored Content | ₹1,50,000 | ₹3,00,000 |
| Affiliate/Referral | ₹1,50,000 | ₹3,00,000 |
| **TOTAL MONTHLY** | **₹30,00,000** | **₹58,28,000** |

**Year 3 Annual Revenue Target: ₹5–7 Crore**

---

## 6. Cost Structure & Profitability

### Phase 1: Months 1–6 (Build Phase)

| Cost Item | Monthly Cost | 6-Month Total | Notes |
|-----------|-------------|---------------|-------|
| Domain | – | ₹800 | One-time annual cost |
| Hosting (Vercel Pro) | ₹1,700 | ₹10,200 | Pro plan for SSR/ISR |
| Database (Supabase Pro) | ₹2,100 | ₹12,600 | 500MB, daily backups |
| Redis (Upstash) | ₹500 | ₹3,000 | Serverless, pay-per-use |
| Scraping Server (Railway) | ₹1,500 | ₹9,000 | Always-on for scheduled jobs |
| Meilisearch Cloud | ₹2,000 | ₹12,000 | Search-as-a-service |
| Claude Code Subscription | ₹7,500 | ₹45,000 | For development assistance |
| Miscellaneous | ₹1,000 | ₹6,000 | APIs, email, monitoring |
| **TOTAL** | **₹16,300** | **₹98,600** | |

**Total Phase 1 Investment: Under ₹1,00,000 for 6 months**

### Phase 2: Months 7–12 (Growth Phase)

| Cost Item | Monthly Cost | Notes |
|-----------|-------------|-------|
| Hosting (scaled) | ₹5,000 | Higher traffic, more SSR |
| Database (scaled) | ₹5,000 | More storage, connections |
| Redis + Search | ₹4,000 | Higher query volume |
| Scraping Infrastructure | ₹3,000 | More states, more spiders |
| Email (Resend/SES) | ₹2,000 | Alert emails, newsletters |
| Freelance Content Writer | ₹10,000 | Blog posts, locality descriptions |
| Google Ads (optional) | ₹10,000 | Retargeting, brand keywords |
| Claude Code | ₹7,500 | Ongoing development |
| **TOTAL** | **₹46,500/month** | |

**Break-even target: Month 9–10 (when revenue exceeds ₹46,500/month)**

### Phase 3: Year 2+ (Scale Phase)

| Cost Item | Monthly Cost | Notes |
|-----------|-------------|-------|
| Infrastructure (all) | ₹30,000 | Scaled for national traffic |
| Part-time Developer | ₹40,000 | For feature development |
| Content Team (2 writers) | ₹30,000 | SEO content production |
| Marketing / Ads | ₹50,000 | Google, social, partnerships |
| Legal / Compliance | ₹10,000 | GST filing, legal review |
| Office / Misc | ₹10,000 | Co-working, tools, subscriptions |
| **TOTAL** | **₹1,70,000/month** | |

**Projected Net Margin at Month 24: 85–90% (revenue ₹17.7L vs costs ₹1.7L)**

---

## 7. SEO & Content Strategy

### 7.1 Programmatic SEO Pages

Every project, builder, and locality automatically generates an optimized page. With 1,300+ projects in NCR alone, this creates 5,000+ indexable pages from day one.

| Page Type | URL Pattern | Example Keywords | Monthly Search Vol (Est.) |
|-----------|------------|-----------------|-------------------------|
| Project Page | /project/[slug] | [project name] RERA status, [project name] complaints | 100–1,000 per project |
| Builder Profile | /builder/[slug] | [builder name] RERA projects, is [builder] reliable | 500–5,000 per builder |
| Locality Report | /locality/[city]/[area] | RERA projects in [area], new projects in [area] 2026 | 1,000–10,000 per locality |
| State RERA Hub | /state/[slug] | [state] RERA registered projects | 5,000–20,000 per state |
| Comparison Pages | /compare/[a]-vs-[b] | [project A] vs [project B] | 50–500 per comparison |
| Blog / Guides | /blog/[slug] | how to check RERA status, RERA complaint process | 2,000–50,000 per topic |

### 7.2 Schema Markup Strategy

- FAQ Schema on every project and builder page (rich snippets in Google)
- Organization Schema for builder profiles
- Product Schema for project pages (with aggregate rating)
- BreadcrumbList Schema for navigation
- Article Schema for blog posts
- LocalBusiness Schema for builder contact pages

### 7.3 Content Calendar (Monthly)

- 4 blog posts targeting high-volume informational queries
- 2 locality deep-dive reports
- 1 builder spotlight / interview
- 1 monthly RERA update roundup (new registrations, expired projects, major orders)
- 10–20 auto-generated comparison pages based on search demand

---

## 8. Expansion Roadmap

### Phase 1: NCR Foundation (Months 1–6)

| Month | Milestone | Key Deliverables |
|-------|-----------|-----------------|
| Month 1 | Infrastructure + UP-RERA Scraper | Set up tech stack, build UP-RERA scraper, design database schema, deploy staging environment |
| Month 2 | Haryana-RERA + Delhi-RERA Scrapers | Complete NCR data coverage, build data cleaning pipeline, launch internal admin panel |
| Month 3 | MVP Website Launch | Project pages, builder profiles, search functionality, basic SEO optimization, Google Analytics + Search Console setup |
| Month 4 | Content & SEO Push | Publish first 20 blog posts, submit sitemap, begin link building, set up Google AdSense |
| Month 5 | User Accounts + Alerts | Registration system, saved projects, email alerts, free tier features |
| Month 6 | Monetization V1 | Enable display ads, launch builder profile claiming, implement lead capture forms |

### Phase 2: NCR Growth + Revenue (Months 7–12)

| Month | Milestone | Key Deliverables |
|-------|-----------|-----------------|
| Month 7 | Builder Dashboard Launch | Claimed profiles, analytics, Silver plan subscriptions via Razorpay |
| Month 8 | Lead Generation System | Lead capture optimization, lead marketplace for builders/brokers, CRM integration |
| Month 9 | Broker Dashboard + Plans | Agent registration, lead purchasing, client management tools |
| Month 10 | Self-Serve Ad Platform V1 | Campaign creation, creative upload, CPC/CPM billing, admin approval workflow |
| Month 11 | Investor Premium Features | Builder comparison tool, portfolio tracker, PDF reports, premium subscriptions |
| Month 12 | Maharashtra RERA Expansion | Add MahaRERA scraper (largest state RERA), Mumbai/Pune coverage |

### Phase 3: National Expansion (Year 2)

| Quarter | States Added | Major Features |
|---------|-------------|---------------|
| Q1 Year 2 | Karnataka, Tamil Nadu, Telangana | South India coverage, multilingual support |
| Q2 Year 2 | Gujarat, Rajasthan, Madhya Pradesh | West/Central India, mobile app development begins |
| Q3 Year 2 | West Bengal, Odisha, Punjab | East India coverage, data API launch |
| Q4 Year 2 | All remaining states | Full national coverage, mobile app launch, advanced analytics |

### Phase 4: Market Leadership (Year 3)

- AI-powered features: automated compliance risk scoring, price prediction models, investment recommendations
- Mobile app with push notifications for project alerts
- WhatsApp bot for instant RERA checks (WhatsApp Business API)
- Partnerships with banks for integrated home loan processing
- B2B data platform: API + dashboard for banks, insurance companies, PropTech startups
- Government partnerships: official RERA data aggregation MoU with state authorities

---

## 9. Competitive Analysis & Differentiation

| Feature | Our Platform | 99acres | MagicBricks | NoBroker | State RERA Sites |
|---------|-------------|---------|-------------|---------|-----------------|
| Primary Focus | RERA compliance & transparency | Property listings | Property listings | Listings (no broker) | Regulatory compliance |
| Cross-State RERA Search | Yes (all states) | No | No | No | No (single state only) |
| Builder Compliance Score | Yes (algorithmic) | No | No | No | No |
| Project Timeline Tracking | Yes (automated) | No | No | No | Partial (manual) |
| Complaint History | Yes (aggregated) | No | No | No | Yes (hard to search) |
| Builder Comparison Tool | Yes | No | No | No | No |
| Data API for Developers | Yes | No | No | No | No |
| User Experience | Fast, modern, mobile-first | Cluttered | Cluttered | App-focused | Very poor |
| SEO Content | Deep RERA-focused content | Generic listings | Generic listings | Minimal | None |
| Free for Buyers | Yes | Yes | Yes | Partial | Yes |

---

## 10. Risk Analysis & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|-----------|--------|-------------------|
| RERA sites block scraping | Medium | High | Use rotating proxies, headless browsers, CAPTCHA solvers; pursue official data partnerships |
| Slow SEO traction | Medium | Medium | Supplement with targeted Google Ads; leverage social media; partner with real estate YouTubers |
| Builder legal pushback | Low | Medium | All data is from public RERA records; add clear disclaimer citing Right to Information |
| Competition from big players | Low (near-term) | High (long-term) | First-mover advantage; deep SEO moat; data quality as barrier to entry |
| Data accuracy issues | Medium | High | Automated anomaly detection; user-reported corrections; regular manual audits |
| Low conversion to paid plans | Medium | Medium | Focus on lead generation revenue; optimize free-to-paid funnel; A/B test pricing |
| Technical scalability | Low | Medium | Serverless architecture scales automatically; CDN for static content; load testing |

---

## 11. Legal & Compliance Requirements

### Business Registration
- Register as a Private Limited Company or LLP (recommended for investor readiness)
- Obtain GST Registration (mandatory for online services exceeding ₹20 lakh turnover)
- Apply for Startup India recognition (tax benefits under Section 80-IAC)
- Open a current bank account with Razorpay-compatible bank

### Data & Privacy Compliance
- Draft comprehensive Privacy Policy and Terms of Service
- Comply with Digital Personal Data Protection Act (DPDPA) 2023
- Implement cookie consent mechanism for EU visitors (if any)
- Data retention policy: user data, search history, lead data
- Right to deletion: allow users to delete their accounts and data

### Advertising Compliance
- All sponsored content must be clearly labeled as "Sponsored" or "Ad"
- Builder advertisements must not contain misleading claims
- Ad creative approval workflow to prevent fraudulent ads
- Comply with ASCI (Advertising Standards Council of India) guidelines

### RERA Data Usage
- All RERA data is publicly available under the RERA Act 2016
- Add clear attribution: "Source: [State] Real Estate Regulatory Authority"
- Disclaimer on every page: "Data sourced from public RERA records. Verify independently before making investment decisions."
- Do NOT present scraped data as official government data

---

## 12. Key Performance Indicators (KPIs)

### Growth KPIs

| KPI | Month 6 Target | Month 12 Target | Month 24 Target |
|-----|---------------|-----------------|-----------------|
| Monthly Organic Traffic | 50,000 | 3,00,000 | 15,00,000 |
| Indexed Pages (Google) | 5,000 | 15,000 | 50,000+ |
| Registered Users | 500 | 5,000 | 50,000 |
| Projects in Database | 1,500 (NCR) | 10,000 (5 states) | 50,000+ (all states) |
| Builders in Database | 200 (NCR) | 2,000 | 10,000+ |
| Domain Authority | 15 | 30 | 50+ |

### Revenue KPIs

| KPI | Month 6 Target | Month 12 Target | Month 24 Target |
|-----|---------------|-----------------|-----------------|
| Monthly Revenue | ₹7,400 | ₹2,38,800 | ₹17,76,000 |
| MRR (Subscriptions Only) | ₹0 | ₹80,000 | ₹4,00,000 |
| Leads Generated/Month | 20 | 500 | 3,000 |
| Paying Builder Accounts | 0 | 30 | 200 |
| Net Profit Margin | Negative | 70%+ | 85%+ |

### Operational KPIs

| KPI | Target |
|-----|--------|
| Scraping Success Rate | >95% per run |
| Data Freshness | <24 hours from RERA update to platform update |
| Page Load Time | <2 seconds (Core Web Vitals compliant) |
| Search Response Time | <100ms (Meilisearch) |
| Uptime | >99.5% |
| Support Response Time | <24 hours for free users, <4 hours for paid |

---

## 13. Immediate Next Steps

### Week 1 Actions

1. Register the domain (check availability for top choices)
2. Set up GitHub repository with project structure (Next.js + Tailwind + PostgreSQL)
3. Set up Supabase project with initial database schema
4. Build UP-RERA scraper first (largest NCR dataset)
5. Deploy MVP with 100 project pages to test SEO indexing speed
6. Submit sitemap to Google Search Console and Bing Webmaster Tools
7. Set up Google AdSense account (approval takes 1–2 weeks)
8. Register business entity (LLP recommended) and open current bank account
9. Set up Razorpay account for future subscription payments
10. Begin writing first 10 blog posts targeting high-volume RERA keywords

### Development Sprints with Claude Code

1. Sprint 1-2 (Week 1–4): Database schema + Haryana/Delhi/UP RERA scrapers + data cleaning pipeline
2. Sprint 3-4 (Week 5–8): Next.js project + project page + builder profile + search (Meilisearch)
3. Sprint 5-6 (Week 9–12): User auth + saved projects + email alerts + AdSense integration
4. Sprint 7-8 (Week 13–16): Blog CMS + first 20 SEO articles (EN + HI) + sitemap submission
5. Sprint 9-10 (Week 17–20): Builder dashboard + profile claiming + Razorpay subscriptions
6. Sprint 11-12 (Week 21–24): Lead capture system + broker dashboard + ad platform v1
7. Sprint 13-14 (Week 25–28): Investor premium features + WhatsApp bot MVP
8. Sprint 15-16 (Week 29–32): Maharashtra RERA scraper + national expansion prep

---

*This document serves as the complete blueprint. Every section can be referenced during development to ensure the platform is built with all future expansion capabilities, monetization logic, and operational requirements accounted for from Day 1.*
