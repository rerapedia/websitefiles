/**
 * Seed 5 blog posts for Sprint 10.
 * Run: npx tsx scripts/seed-blog-posts.ts
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

function getDbUrl(): string {
  const url = process.env.DATABASE_URL ?? "";
  return url.includes("?schema=") ? url.split("?schema=")[0] : url;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: getDbUrl() }),
});

const POSTS = [
  {
    title: "How to Check RERA Status of Any Project in India (2026 Guide)",
    slug: "how-to-check-rera-status-india-2026-guide",
    category: "guides",
    tags: ["rera", "how-to", "home-buying", "india"],
    language: "en",
    seoTitle: "How to Check RERA Status of Any Project in India — 2026 Guide | ReraPedia",
    seoDescription: "Step-by-step guide to verify RERA registration status of any real estate project in India. Check online portals, verify builders, and protect your investment.",
    content: `# How to Check RERA Status of Any Project in India (2026 Guide)

Buying a home is the biggest financial decision most Indians make. RERA (Real Estate Regulatory Authority) registration ensures that the project you're investing in is legally compliant and the builder is accountable.

## What is RERA Registration?

RERA was established under the Real Estate (Regulation and Development) Act, 2016. Every residential and commercial project above 500 sq meters or 8 apartments must be registered with the state RERA authority before advertising or selling.

## How to Check RERA Status Online

### Step 1: Identify the State RERA Portal
Each state has its own RERA portal:
- **Haryana RERA**: haryanarera.gov.in
- **Delhi RERA**: erera.co.in
- **UP RERA**: up-rera.in
- **MahaRERA**: maharera.mahaonline.gov.in

### Step 2: Search by Registration Number
Enter the RERA registration number (printed on all marketing materials) on the portal. The result shows project details, builder info, completion timeline, and compliance status.

### Step 3: Verify Builder Track Record
Check the builder's history across all their projects. On ReraPedia, we calculate a Trust Score (0-100) based on 8 dimensions including delivery record, legal risk, and financial transparency.

### Step 4: Check for Complaints
RERA portals list complaints filed against projects. A high complaint count is a red flag.

## Use ReraPedia for Instant Verification

Instead of navigating each state portal individually, use ReraPedia to search any RERA project across Haryana, Delhi, and UP. Get instant trust scores, builder ratings, and complaint history — all in one place.

## Red Flags to Watch For
- Project not registered on RERA portal
- Registration expired or lapsed
- Multiple complaints without resolution
- Builder with delayed projects elsewhere
- No QPR (Quarterly Progress Report) submissions

## Conclusion

Always verify RERA status before booking any property. Use ReraPedia to compare projects and make informed decisions.`,
  },
  {
    title: "Top 10 RERA Compliant Builders in Gurgaon",
    slug: "top-10-rera-compliant-builders-gurgaon",
    category: "rankings",
    tags: ["gurgaon", "builders", "rera", "rankings"],
    language: "en",
    seoTitle: "Top 10 RERA Compliant Builders in Gurgaon 2026 | ReraPedia",
    seoDescription: "Ranked list of the most RERA-compliant builders in Gurgaon based on trust scores, delivery record, and complaint history. Data-driven builder analysis.",
    content: `# Top 10 RERA Compliant Builders in Gurgaon

Gurgaon (Gurugram) is one of India's most active real estate markets. With dozens of builders operating in the region, choosing the right one can be overwhelming. We've analyzed RERA data from Haryana RERA to rank the most compliant builders.

## How We Rank Builders

Our ranking is based on ReraPedia's 8-dimension Trust Score system:
- Delivery track record across all projects
- Document compliance and QPR submissions
- Legal risk (complaints and RERA orders)
- Financial transparency
- Registration quality and timely renewals
- Builder history across all their projects
- Neighbourhood quality of their project locations
- Market confidence indicators

## The Rankings

Rankings are based on average Trust Scores across all RERA-registered projects in Gurugram. Visit ReraPedia to see live, updated scores for every builder.

### Key Takeaways

1. **Compliance matters**: Builders with higher trust scores have fewer complaints and better delivery records.
2. **Track record is key**: Look at ALL projects by a builder, not just the one you're interested in.
3. **Registration expiry**: Check that the RERA registration hasn't lapsed — this is a major red flag.

## How to Use This Information

Visit each builder's profile on ReraPedia to see detailed breakdowns of their trust score across all 8 dimensions. Compare builders side-by-side using our comparison tool.

Always verify information independently before making investment decisions.`,
  },
  {
    title: "Haryana RERA vs UP RERA: Key Differences for Home Buyers",
    slug: "haryana-rera-vs-up-rera-differences",
    category: "analysis",
    tags: ["haryana", "uttar-pradesh", "rera", "comparison"],
    language: "en",
    seoTitle: "Haryana RERA vs UP RERA: Key Differences for Home Buyers | ReraPedia",
    seoDescription: "Compare Haryana RERA and UP RERA — registration processes, complaint mechanisms, penalties, and what home buyers in NCR need to know.",
    content: `# Haryana RERA vs UP RERA: Key Differences for Home Buyers

If you're buying property in the Delhi NCR region, you'll likely encounter both Haryana RERA and UP RERA. Understanding the differences between these two regulatory bodies can help you make better decisions.

## Registration Process

### Haryana RERA
- Portal: haryanarera.gov.in
- Managed by HRERA (Haryana Real Estate Regulatory Authority)
- Two benches: Gurugram and Panchkula
- Registration typically processed within 30 days

### UP RERA
- Portal: up-rera.in
- One of the most active RERA bodies in India
- Handles Noida, Greater Noida, Ghaziabad, and all UP districts
- Known for strict enforcement

## Complaint Mechanisms

Both portals allow online complaint filing, but UP RERA is generally considered more responsive to buyer complaints with faster resolution timelines.

## Key Differences for NCR Buyers

| Feature | Haryana RERA | UP RERA |
|---------|-------------|---------|
| Primary NCR Cities | Gurgaon, Faridabad | Noida, Greater Noida, Ghaziabad |
| Portal Usability | Moderate | Complex (ASP.NET) |
| Complaint Resolution | Moderate speed | Generally faster |
| Penalty Enforcement | Active | Very active |
| Project Data Transparency | Good | Good |

## Which Affects You?

Your RERA jurisdiction depends entirely on where the project is physically located, not where the builder is headquartered.

Use ReraPedia to check trust scores for projects across both Haryana and UP RERA jurisdictions in one search.`,
  },
  {
    title: "RERA Complaint Process: Step-by-Step Guide with Templates",
    slug: "rera-complaint-process-guide-templates",
    category: "guides",
    tags: ["rera", "complaints", "legal", "templates"],
    language: "en",
    seoTitle: "RERA Complaint Process: Step-by-Step Guide with Templates 2026 | ReraPedia",
    seoDescription: "File a RERA complaint against a builder. Complete guide with step-by-step process, required documents, complaint templates, and what to expect.",
    content: `# RERA Complaint Process: Step-by-Step Guide with Templates

If your builder has delayed possession, violated terms, or not delivered what was promised, RERA provides a legal remedy. Here's how to file a complaint.

## When Can You File a RERA Complaint?

- Delayed possession beyond the agreed date
- Poor construction quality
- False advertising or misleading promises
- Changes in layout without consent
- Non-registration of the project
- Builder not maintaining a separate escrow account
- Non-delivery of amenities promised in the agreement

## Step-by-Step Complaint Process

### Step 1: Gather Documentation
- Allotment letter or buyer-builder agreement
- Payment receipts
- Builder's marketing materials
- RERA registration details
- Communication records (emails, letters)

### Step 2: Visit the State RERA Portal
- Haryana: haryanarera.gov.in
- Delhi: erera.co.in
- UP: up-rera.in

### Step 3: Register and File Online
Create an account, fill in the complaint form, upload documents, and pay the filing fee.

### Step 4: Filing Fee
Filing fees vary by state (typically around Rs 1,000 for buyers).

### Step 5: Track Your Complaint
Use the complaint number to track status online.

## What to Expect

RERA authorities typically schedule hearings within 30-60 days. Both parties present their case, and the authority passes an order.

## Check Builder's Complaint History on ReraPedia

Before buying, check the builder's complaint history on ReraPedia. Projects with multiple unresolved complaints have lower trust scores.`,
  },
  {
    title: "NRI Guide to Buying RERA Registered Property in Delhi NCR",
    slug: "nri-guide-buying-rera-property-delhi-ncr",
    category: "guides",
    tags: ["nri", "delhi-ncr", "rera", "investment", "home-buying"],
    language: "en",
    seoTitle: "NRI Guide to Buying RERA Property in Delhi NCR 2026 | ReraPedia",
    seoDescription: "Complete guide for NRIs buying property in Delhi NCR. RERA compliance, documentation, FEMA rules, power of attorney, and how to verify projects remotely.",
    content: `# NRI Guide to Buying RERA Registered Property in Delhi NCR

Delhi NCR remains one of the most popular real estate investment destinations for NRIs. With RERA in place, buying property remotely has become safer — but you still need to do your due diligence.

## Why NRIs Should Only Buy RERA Registered Properties

1. **Legal Protection**: RERA ensures the builder is accountable for delivery timelines
2. **Escrow Account**: Builder must maintain a separate account for your project
3. **Complaint Mechanism**: You can file complaints online from anywhere
4. **Transparency**: All project details are publicly available

## FEMA Guidelines for NRI Property Purchase

Under FEMA (Foreign Exchange Management Act):
- NRIs can buy residential and commercial property
- Agricultural land, plantation property, and farmhouse are restricted
- Payment must be from NRE/NRO account or foreign inward remittance
- No limit on number of properties

## Remote Verification Using ReraPedia

Since you cannot easily visit India for every project, use ReraPedia to:
- Check RERA registration status
- View trust scores based on 8 dimensions
- Compare builders side-by-side
- Download PDF reports for any project
- Set up alerts for project status changes

## Key Documents Needed

1. Valid Indian passport
2. OCI/PIO card (if applicable)
3. PAN card
4. Power of Attorney (if buying through representative)
5. NRE/NRO bank account statements

## Power of Attorney for NRIs

If you cannot be present for registration, execute a Power of Attorney:
- Must be notarized at Indian consulate abroad
- Adjudicated within 3 months of arrival in India
- Specify clear scope (which property, which acts)

## Delhi NCR Market Overview

The NCR region spans three RERA jurisdictions:
- **Haryana RERA** (Gurgaon, Faridabad)
- **Delhi RERA** (Delhi projects)
- **UP RERA** (Noida, Greater Noida, Ghaziabad)

Use ReraPedia to search across all three with a single query.`,
  },
];

async function main() {
  console.log("Seeding blog posts...\n");

  // Get or create admin user
  let adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        name: "ReraPedia Editorial",
        email: "editorial@rerapedia.com",
        role: "ADMIN",
      },
    });
  }

  for (const post of POSTS) {
    const existing = await prisma.blogPost.findFirst({
      where: { slug: post.slug },
    });

    if (existing) {
      console.log(`  Skipped (exists): ${post.slug}`);
      continue;
    }

    await prisma.blogPost.create({
      data: {
        title: post.title,
        slug: post.slug,
        contentHtml: post.content,
        category: post.category,
        tags: post.tags,
        language: post.language,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        status: "PUBLISHED",
        authorId: adminUser.id,
        publishedAt: new Date(),
      },
    });
    console.log(`  Created: ${post.title}`);
  }

  const count = await prisma.blogPost.count();
  console.log(`\nTotal blog posts: ${count}`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
