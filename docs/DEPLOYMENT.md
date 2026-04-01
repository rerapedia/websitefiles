# ReraPedia Production Deployment Checklist

## 1. Vercel (Frontend + API)

### Setup
- [ ] Create Vercel project linked to GitHub repo
- [ ] Set framework preset to Next.js
- [ ] Set root directory to `/` (monorepo root)
- [ ] Set build command: `npm run build`
- [ ] Set install command: `npm install --legacy-peer-deps`
- [ ] Deploy region: `bom1` (Mumbai, India)

### Environment Variables
Set all variables in Vercel Dashboard > Settings > Environment Variables:

```
DATABASE_URL=               # Supabase pooled connection string
DIRECT_URL=                 # Supabase direct connection (migrations only)
REDIS_URL=                  # Upstash Redis URL
NEXTAUTH_SECRET=            # Generate: openssl rand -base64 32
NEXTAUTH_URL=               # https://rerapedia.com
RAZORPAY_KEY_ID=            # Live Razorpay key
RAZORPAY_KEY_SECRET=        # Live Razorpay secret
MEILISEARCH_HOST=           # Meilisearch Cloud or Railway URL
MEILISEARCH_API_KEY=        # Meilisearch admin API key
MAPBOX_ACCESS_TOKEN=        # Mapbox GL JS token
R2_ACCOUNT_ID=              # Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
RESEND_API_KEY=             # Resend email service
POSTHOG_KEY=                # PostHog project key
SENTRY_DSN=                 # Sentry DSN
GOOGLE_CLIENT_ID=           # Google OAuth
GOOGLE_CLIENT_SECRET=
CRON_SECRET=                # Vercel Cron auth secret
TWILIO_ACCOUNT_SID=         # WhatsApp bot (optional)
TWILIO_AUTH_TOKEN=
```

### Domain Configuration
- [ ] Add custom domain: `rerapedia.com`
- [ ] Add `www.rerapedia.com` redirect to apex
- [ ] Verify SSL certificate auto-provisioned
- [ ] Test all routes on production URL

## 2. Supabase (PostgreSQL Database)

### Setup
- [ ] Create Supabase project in `ap-south-1` (Mumbai)
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Run seed: `npx tsx prisma/seed.ts`
- [ ] Enable Row Level Security on sensitive tables
- [ ] Set up connection pooling (PgBouncer) via Supabase dashboard
- [ ] Configure daily database backups

### Post-Migration
- [ ] Run scrapers to populate real data
- [ ] Run `npm run search:sync` to index Meilisearch
- [ ] Verify all 222+ projects are accessible

## 3. Upstash Redis

- [ ] Create Upstash Redis database (Mumbai region)
- [ ] Set `REDIS_URL` in Vercel environment
- [ ] Configure eviction policy: `allkeys-lru`
- [ ] Set max memory: 256MB (free tier is fine initially)

## 4. Meilisearch

### Option A: Meilisearch Cloud
- [ ] Create Meilisearch Cloud project
- [ ] Note host URL and admin API key
- [ ] Set in Vercel environment variables

### Option B: Railway Self-Hosted
- [ ] Deploy Meilisearch container on Railway
- [ ] Set master key via environment variable
- [ ] Expose public URL with Railway domain

### Post-Setup
- [ ] Run `npm run search:sync` against production
- [ ] Verify search returns results

## 5. Scraper Workers (Railway)

- [ ] Create Railway project for scraper services
- [ ] Deploy using `infrastructure/docker-compose.yml`
- [ ] Set DATABASE_URL, REDIS_URL, MEILISEARCH_* vars
- [ ] Configure cron schedule via Railway or Vercel Crons
- [ ] Verify scrapers connect to production DB

## 6. DNS Configuration

```
Type    Name    Value                       TTL
A       @       76.76.21.21 (Vercel)        300
CNAME   www     cname.vercel-dns.com        300
```

- [ ] Propagation verified (use dig or nslookup)
- [ ] HTTPS working on both apex and www

## 7. Google Search Console

- [ ] Verify domain ownership (DNS TXT record or HTML file)
- [ ] Submit sitemap: `https://rerapedia.com/sitemap.xml`
- [ ] Request indexing for homepage, state pages, top project pages
- [ ] Set up email alerts for crawl errors
- [ ] Verify robots.txt is accessible: `https://rerapedia.com/robots.txt`

## 8. Google AdSense

- [ ] Apply for AdSense with rerapedia.com
- [ ] Add ads.txt to public directory
- [ ] Wait for approval (typically 2-4 weeks)
- [ ] Replace placeholder ad components with real AdSense code
- [ ] Verify ad placements: header (728x90), sidebar (300x250), in-content

## 9. Razorpay Production

- [ ] Verify Razorpay live mode is enabled
- [ ] Set production webhook URL: `https://rerapedia.com/api/webhooks/razorpay`
- [ ] Enable webhook events: subscription.activated, subscription.charged, payment.failed
- [ ] Test subscription flow end-to-end with ₹1 test plan
- [ ] Verify invoice generation

## 10. Monitoring & Analytics

### Sentry
- [ ] Create Sentry project for Next.js
- [ ] Install: `npm install @sentry/nextjs`
- [ ] Run wizard: `npx @sentry/wizard@latest -i nextjs`
- [ ] Set `SENTRY_DSN` in Vercel
- [ ] Verify error tracking on staging

### PostHog
- [ ] Create PostHog project
- [ ] Add `POSTHOG_KEY` to Vercel env
- [ ] Verify events firing on production

### Plausible Analytics
- [ ] Add Plausible script to layout
- [ ] Configure custom domain for analytics

### Uptime Monitoring
- [ ] Set up Uptime Robot for:
  - `https://rerapedia.com` (homepage)
  - `https://rerapedia.com/api/search?q=test` (API health)
  - `https://rerapedia.com/sitemap.xml` (SEO)
- [ ] Configure Slack/email alerts for downtime

## 11. Security Checklist

- [ ] All API routes have rate limiting
- [ ] CORS configured for production domain only
- [ ] Security headers set in vercel.json
- [ ] No PII stored beyond what's necessary (per CLAUDE.md)
- [ ] Razorpay webhook signature verification enabled
- [ ] CSRF protection on all forms (NextAuth handles this)
- [ ] Content Security Policy headers configured

## 12. Pre-Launch Testing

- [ ] All 222+ projects accessible via URL
- [ ] Search returns results for: Gurugram, Noida, Delhi
- [ ] Lead form submits correctly
- [ ] Builder claim flow works
- [ ] Pricing page loads plans from DB
- [ ] Blog posts render with SEO meta tags
- [ ] Sitemap.xml includes all public URLs
- [ ] robots.txt blocks /dashboard/* and /api/*
- [ ] Mobile responsive on iPhone and Android
- [ ] Hindi language switcher works
- [ ] WhatsApp webhook responds to test messages

## Quick Deploy Commands

```bash
# 1. Push to GitHub
git push origin main

# 2. Vercel deploys automatically on push to main

# 3. Run migrations on production
DATABASE_URL=<prod_url> npx prisma migrate deploy

# 4. Sync search indexes
MEILISEARCH_HOST=<prod_url> MEILISEARCH_API_KEY=<key> npm run search:sync

# 5. Verify deployment
curl https://rerapedia.com/api/search?q=test
```
