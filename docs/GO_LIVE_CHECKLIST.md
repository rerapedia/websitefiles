# ReraPedia — Go Live Checklist

## Pre-Launch

- [ ] Domain registered and DNS configured (rerapedia.com → Vercel)
- [ ] SSL certificate active on rerapedia.com
- [ ] Production .env variables set in Vercel dashboard
- [ ] Database migrations run on production Supabase
- [ ] Meilisearch production index created and synced (3,220+ projects)
- [ ] Admin account verified: admin@rerapedia.com

## Data Verification

- [ ] Haryana RERA: 1,978 projects across 22 districts
- [ ] Delhi RERA: 102 projects
- [ ] UP RERA: 121 projects across 15 districts
- [ ] Maharashtra RERA: 990 projects across 17 cities
- [ ] Karnataka RERA: 29 projects
- [ ] Total: 3,220+ projects, 2,170+ builders, 5 states
- [ ] Trust scores calculated for all projects
- [ ] Meilisearch returns results for: Gurugram, Noida, Delhi, Pune, Mumbai

## Frontend Verification

- [ ] Homepage loads with correct stats (3,220+, 2,170+, 5+)
- [ ] Search works with filtering by state and status
- [ ] "Load More" pagination works (shows all results)
- [ ] Project detail pages render with trust score ring gauge
- [ ] Builder profiles render with gradient header
- [ ] State hub pages show all districts
- [ ] Blog listing shows 26 posts with category filtering
- [ ] Blog articles render with hero banner and related posts
- [ ] Pricing page shows all 4 plans
- [ ] Mobile responsive on all pages

## Authentication

- [ ] Login with email/password works
- [ ] Registration with role selection works
- [ ] Admin login: admin@rerapedia.com / ReraPedia@2026
- [ ] Dashboard access gated by role (middleware working)
- [ ] Builder claim flow works

## Payments

- [ ] Razorpay live keys configured
- [ ] Subscription checkout works (test with ₹1 plan)
- [ ] Webhook URL set: https://rerapedia.com/api/webhooks/razorpay
- [ ] Invoice generation working

## SEO

- [ ] sitemap.xml accessible (5,528 URLs)
- [ ] robots.txt blocks /dashboard/* and /api/*
- [ ] Google Search Console verified
- [ ] Sitemap submitted to Google
- [ ] All pages have unique <title> and <meta description>
- [ ] JSON-LD structured data on project/builder/blog pages
- [ ] Canonical URLs set on all pages
- [ ] Hindi hreflang tags present

## Legal

- [ ] /privacy-policy page live
- [ ] /terms page live
- [ ] /about page live
- [ ] /contact page live with working form
- [ ] /disclaimer page live
- [ ] Footer links updated to legal pages

## Monitoring

- [ ] Sentry DSN configured (error tracking)
- [ ] PostHog/Plausible analytics script added
- [ ] Uptime Robot monitoring on homepage + API
- [ ] Cron jobs verified (scrapers, alerts, search sync)

## Go Live Steps

```bash
# 1. Final local build
npm run build

# 2. Push to GitHub
git add -A && git commit -m "Production ready v1.0" && git push origin main

# 3. Vercel auto-deploys from main branch

# 4. Run production migrations
DATABASE_URL=<prod> npx prisma migrate deploy

# 5. Sync Meilisearch
MEILISEARCH_HOST=<prod> npm run search:sync

# 6. Verify
curl https://rerapedia.com
curl https://rerapedia.com/sitemap.xml
curl https://rerapedia.com/api/whatsapp/test?q=help
```

## Post-Launch (Week 1)

- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Apply for Google AdSense
- [ ] Begin outreach to builders for paid plans
- [ ] Publish 2 new blog posts
- [ ] Monitor Sentry for errors
- [ ] Check Google indexing after 3 days
