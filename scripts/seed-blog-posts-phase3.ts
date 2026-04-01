/**
 * Phase 3: Seed remaining blog posts to reach 20+ total.
 * Run: npx tsx scripts/seed-blog-posts-phase3.ts
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: (process.env.DATABASE_URL ?? "").split("?")[0] }),
});

function makeContent(title: string, desc: string, sections: string[]): string {
  let html = `<h2>${title}</h2>\n<p>${desc}</p>\n`;
  for (const section of sections) {
    const [heading, ...paragraphs] = section.split("|");
    html += `<h2>${heading.trim()}</h2>\n`;
    for (const p of paragraphs) {
      html += `<p>${p.trim()}</p>\n`;
    }
  }
  html += `<h2>Conclusion</h2>\n<p>Always verify RERA registration before making any property investment. Use ReraPedia to check trust scores, compare builders, and make data-driven decisions. Visit rerapedia.com for the latest RERA data across Haryana, Delhi, UP, Maharashtra, and Karnataka.</p>`;
  return html;
}

const POSTS = [
  {
    title: "What is RERA Registration Number and How to Verify It",
    slug: "what-is-rera-registration-number-verify",
    category: "guides",
    tags: ["rera", "registration", "verification", "guide"],
    language: "en",
    seoTitle: "What is RERA Registration Number? How to Verify | ReraPedia",
    seoDescription: "Learn what a RERA registration number is, where to find it, and how to verify it online. Complete guide with step-by-step verification process for all states.",
    content: makeContent("What is RERA Registration Number and How to Verify It",
      "Every real estate project in India above 500 sq meters must have a unique RERA registration number. This number is your key to verifying project legitimacy.",
      [
        "What is a RERA Registration Number?|A RERA registration number is a unique identifier assigned by the state RERA authority when a real estate project is registered under the Real Estate (Regulation and Development) Act, 2016.|Each state has a different format. For example, Haryana uses 'RERA-GRG-XXX-YYYY', UP uses 'UPRERAPRJXXXXX', and Maharashtra uses 'PXXXXXXXXXXX'.",
        "Where to Find the RERA Number|The RERA registration number must be displayed in all marketing materials, advertisements, brochures, and the builder's website.|It should be prominently mentioned in the buyer-builder agreement. If a builder refuses to share this number, it's a major red flag.",
        "How to Verify Online|Visit the respective state RERA portal (haryanarera.gov.in, erera.co.in, up-rera.in, maharera.maharashtra.gov.in) and enter the RERA number in the search field.|Or simply search on ReraPedia — we aggregate data from all state portals and show you the trust score, builder history, and compliance status in one place.",
        "Red Flags to Watch For|Project not found on any RERA portal|RERA number format doesn't match the state pattern|Registration has expired or been revoked|Builder has multiple complaints on other projects",
      ]),
  },
  {
    title: "Dwarka Expressway Projects RERA Status — Complete List",
    slug: "dwarka-expressway-projects-rera-status-list",
    category: "rankings",
    tags: ["dwarka-expressway", "gurgaon", "rera", "projects", "rankings"],
    language: "en",
    seoTitle: "Dwarka Expressway Projects RERA Status 2026 | ReraPedia",
    seoDescription: "Complete list of RERA registered projects along Dwarka Expressway, Gurgaon. Trust scores, builder ratings, possession dates, and compliance status for every project.",
    content: makeContent("Dwarka Expressway Projects RERA Status — Complete List",
      "The Dwarka Expressway (Northern Peripheral Road) is one of India's most sought-after real estate corridors, connecting Dwarka in Delhi to NH-8 in Gurgaon.",
      [
        "Why Dwarka Expressway?|With the expressway now operational, property values have seen 40-60% appreciation since 2020.|Multiple metro stations, proximity to IGI Airport, and Diplomatic Enclave make this corridor premium real estate.",
        "RERA Registered Projects|All legitimate projects along the Dwarka Expressway must be registered with Haryana RERA.|On ReraPedia, you can search for all Sector 102-115 Gurugram projects to see their trust scores and compliance status.",
        "Key Projects to Watch|Several major builders have projects here including DLF, Emaar, Godrej, Sobha, and Tata Housing.|Check each project's trust score on ReraPedia before making any booking decision. Look for scores above 60 (Reliable) for safer investments.",
        "How to Verify|Search any project on ReraPedia or visit haryanarera.gov.in directly.|Compare multiple projects using our builder comparison tool to find the most reliable option.",
      ]),
  },
  {
    title: "RERA Rules for Delayed Possession — Your Rights as a Buyer",
    slug: "rera-rules-delayed-possession-buyer-rights",
    category: "guides",
    tags: ["rera", "delayed-possession", "rights", "compensation", "legal"],
    language: "en",
    seoTitle: "RERA Rules for Delayed Possession — Buyer Rights 2026 | ReraPedia",
    seoDescription: "Know your rights when a builder delays possession under RERA. Compensation calculation, complaint process, and how to claim refund with interest.",
    content: makeContent("RERA Rules for Delayed Possession — Your Rights as a Buyer",
      "Delayed possession is the most common complaint in Indian real estate. RERA provides strong protections for buyers facing delays.",
      [
        "Your Legal Rights Under RERA|Under Section 18 of RERA Act 2016, if a builder fails to deliver possession on time, the buyer can demand: (a) Full refund with interest, or (b) Continued interest on the amount paid until possession is delivered.|The interest rate is typically the SBI MCLR rate + 2%, calculated from the date of each payment.",
        "How to Calculate Compensation|If you paid Rs 50 lakhs and possession is delayed by 2 years, at 9.5% interest, your compensation would be approximately Rs 9.5 lakhs.|The builder must pay this monthly until actual possession is given.",
        "Filing a RERA Complaint|Step 1: Gather your allotment letter, payment receipts, and all communication.|Step 2: File online on the state RERA portal.|Step 3: Pay the filing fee (typically Rs 1,000).|Step 4: Attend the hearing when scheduled.",
        "Track Delays on ReraPedia|On ReraPedia, projects with delayed possession have lower trust scores.|Check the project timeline to see if possession dates have been revised. Multiple revisions are a red flag.",
      ]),
  },
  {
    title: "How RERA Protects Home Buyers from Builder Fraud",
    slug: "how-rera-protects-buyers-builder-fraud",
    category: "guides",
    tags: ["rera", "buyer-protection", "fraud", "rights", "legal"],
    language: "en",
    seoTitle: "How RERA Protects Home Buyers from Builder Fraud | ReraPedia",
    seoDescription: "Complete guide on how RERA Act 2016 protects home buyers from builder fraud. Escrow accounts, project registration, penalty provisions, and complaint mechanisms.",
    content: makeContent("How RERA Protects Home Buyers from Builder Fraud",
      "Before RERA, home buyers had almost no legal recourse against fraudulent builders. The RERA Act 2016 changed everything by creating a comprehensive regulatory framework.",
      [
        "Mandatory Project Registration|No builder can advertise or sell any project without RERA registration.|This ensures every project's details are publicly available — including builder identity, project plan, completion timeline, and financial information.",
        "Escrow Account Protection|Builders must deposit 70% of buyer funds in a dedicated escrow account.|This money can only be used for that specific project's construction — preventing diversion of funds to other projects.",
        "No Changes Without Consent|Builders cannot change the project plan, layout, or specifications without getting consent from 2/3rd of buyers.|This protects you from bait-and-switch tactics where promised amenities disappear.",
        "Penalty Provisions|Builders face penalties up to 10% of project cost for non-compliance.|In severe cases, builders can face imprisonment of up to 3 years.|RERA authorities can also revoke project registration.",
        "Use ReraPedia for Due Diligence|Check any builder's trust score before booking. A score below 40 means the builder has compliance issues.|Compare builders side-by-side using our comparison tool to find the most reliable option.",
      ]),
  },
  {
    title: "Top Upcoming RERA Projects Along Dwarka Expressway",
    slug: "upcoming-rera-projects-dwarka-expressway",
    category: "rankings",
    tags: ["dwarka-expressway", "upcoming", "gurgaon", "rera", "new-launches"],
    language: "en",
    seoTitle: "Top Upcoming RERA Projects Along Dwarka Expressway 2026 | ReraPedia",
    seoDescription: "Discover upcoming RERA registered projects along Dwarka Expressway. New launches by top builders with trust scores, expected possession, and price ranges.",
    content: makeContent("Top Upcoming RERA Projects Along Dwarka Expressway",
      "With the Dwarka Expressway now fully operational, several premium projects are launching in Sectors 102 to 115 of Gurugram.",
      [
        "Why Invest Now?|Property prices along the expressway have risen significantly but still offer value compared to Golf Course Road and MG Road.|The upcoming Global City project and new metro connectivity will further boost prices.",
        "New Launches to Watch|Several builders are launching new phases of existing projects.|Check ReraPedia for the latest registrations — new Haryana RERA registrations appear on our platform within 24 hours of registration.",
        "Due Diligence Checklist|Verify RERA registration on ReraPedia or haryanarera.gov.in|Check the builder's trust score across all their projects|Verify the possession date is realistic|Read the complaint history — zero complaints is ideal|Check if the builder has completed projects on time before",
      ]),
  },
  {
    title: "How to File RERA Complaint Online in Haryana",
    slug: "file-rera-complaint-online-haryana",
    category: "guides",
    tags: ["rera", "complaint", "haryana", "online", "process"],
    language: "en",
    seoTitle: "How to File RERA Complaint Online in Haryana — Step by Step | ReraPedia",
    seoDescription: "Step-by-step guide to file a RERA complaint online in Haryana. Required documents, fees, timelines, and what to expect at the hearing.",
    content: makeContent("How to File RERA Complaint Online in Haryana",
      "Haryana RERA (HRERA) handles complaints for Gurugram, Faridabad, Panchkula, and all other Haryana districts. Here's your complete guide to filing a complaint.",
      [
        "Who Can File?|Any homebuyer, allottee, or association of allottees can file a complaint.|The project must be registered under RERA or should have been required to be registered.",
        "Step-by-Step Process|Step 1: Visit haryanarera.gov.in and click on 'File Complaint'|Step 2: Create an account with your email and phone number|Step 3: Fill the complaint form with project details, RERA number, and nature of complaint|Step 4: Upload supporting documents (allotment letter, receipts, correspondence)|Step 5: Pay the filing fee of Rs 1,000 (for individual) or Rs 5,000 (for association)|Step 6: Submit and note your complaint number for tracking",
        "Required Documents|Builder-buyer agreement or allotment letter|All payment receipts and bank statements|Marketing materials showing promises made|Any correspondence with the builder|Photos of construction status (if applicable)",
        "What Happens Next|HRERA typically schedules a hearing within 30-60 days|Both parties present their case|The authority passes an order — which could include refund, compensation, or project completion directive|The order is enforceable like a civil court decree",
        "Check Before Filing|Before filing, check the builder's complaint history on ReraPedia. If others have filed similar complaints, your case is stronger.|A builder with multiple unresolved complaints will have a lower trust score on our platform.",
      ]),
  },
  {
    title: "Understanding Carpet Area vs Super Built-Up Area Under RERA",
    slug: "carpet-area-vs-super-built-up-area-rera",
    category: "guides",
    tags: ["rera", "carpet-area", "super-built-up", "pricing", "guide"],
    language: "en",
    seoTitle: "Carpet Area vs Super Built-Up Area Under RERA Explained | ReraPedia",
    seoDescription: "RERA mandates pricing based on carpet area, not super built-up area. Understand the difference, how it affects your purchase, and how to calculate true cost per sqft.",
    content: makeContent("Understanding Carpet Area vs Super Built-Up Area Under RERA",
      "One of the most important changes RERA brought was mandating that property prices must be calculated on carpet area, not the inflated super built-up area.",
      [
        "What is Carpet Area?|Carpet area is the net usable floor area of an apartment — the area enclosed within the walls, excluding the thickness of inner walls.|Under RERA Section 4, this is the only area on which a builder can quote the price.",
        "What is Super Built-Up Area?|Super built-up area includes carpet area + wall thickness + proportionate share of common areas (lobby, staircase, lift area, gym, pool area).|Before RERA, builders would quote prices on super built-up area, which could be 30-40% more than carpet area. A '1500 sqft' apartment might have only 900-1000 sqft of actual usable space.",
        "How RERA Changed This|Under RERA, builders must disclose and sell based on carpet area only.|If a builder quotes Rs 10,000 per sqft on carpet area basis, and your apartment is 1,000 sqft carpet, you pay Rs 1 Crore.|Previously, the same apartment might have been quoted as 1,400 sqft super built-up at Rs 7,000 per sqft — same price, but misleading.",
        "How to Verify on ReraPedia|When you check a project on ReraPedia, we show the carpet area range as reported to RERA.|Compare the carpet area with what the builder is advertising. Any discrepancy should be questioned.",
      ]),
  },
  {
    title: "Is It Safe to Buy Under Construction Property? RERA Checklist",
    slug: "safe-to-buy-under-construction-property-rera-checklist",
    category: "guides",
    tags: ["under-construction", "rera", "checklist", "safety", "home-buying"],
    language: "en",
    seoTitle: "Is It Safe to Buy Under Construction Property? RERA Checklist | ReraPedia",
    seoDescription: "Comprehensive RERA checklist for buying under-construction property safely. 15 verification steps every buyer must complete before booking.",
    content: makeContent("Is It Safe to Buy Under Construction Property? RERA Checklist",
      "Under-construction properties offer better prices but carry risks. RERA has significantly reduced these risks, but you still need to do your homework.",
      [
        "The 15-Point RERA Checklist|1. Verify RERA registration number on state portal or ReraPedia|2. Check builder's trust score (aim for 60+ on ReraPedia)|3. Verify possession date is realistic|4. Check if the builder has delivered previous projects on time|5. Read the RERA-registered agreement carefully|6. Verify carpet area matches what's being advertised|7. Check complaint history on ReraPedia|8. Verify the builder's escrow account details|9. Check QPR (Quarterly Progress Report) submissions|10. Verify land title and approvals|11. Check construction progress vs timeline|12. Compare with similar projects in the locality|13. Verify the builder isn't facing NCLT/insolvency proceedings|14. Check if the project has adequate environmental clearances|15. Get a lawyer to review the agreement before signing",
        "When to Avoid|Builder trust score below 40 on ReraPedia|Multiple complaints without resolution|Possession date has been revised more than once|Builder has projects under NCLT proceedings|No QPR submissions for more than 2 quarters",
        "Use ReraPedia for Verification|Search any project to see its trust score breakdown across 8 dimensions.|Compare the builder's track record across ALL their projects, not just the one you're interested in.|Set up alerts to get notified if the project's status changes.",
      ]),
  },
  {
    title: "Builder Trust Score: How ReraPedia Calculates It",
    slug: "builder-trust-score-how-gharscore-calculates",
    category: "analysis",
    tags: ["trust-score", "methodology", "scoring", "transparency"],
    language: "en",
    seoTitle: "How ReraPedia Calculates Builder Trust Scores | Methodology",
    seoDescription: "Detailed explanation of ReraPedia's 8-dimension trust scoring methodology. How we rate projects and builders from 0-100 using RERA data and external signals.",
    content: makeContent("Builder Trust Score: How ReraPedia Calculates It",
      "ReraPedia's Trust Score is a proprietary 0-100 rating that evaluates every RERA-registered project and builder across 8 carefully weighted dimensions.",
      [
        "The 8 Scoring Dimensions|1. Delivery Track Record (25 points) — completion percentage, deadline adherence, phase delivery|2. Document Compliance (15 points) — required documents uploaded, QPR submissions|3. Legal Risk (15 points) — complaints filed, resolution rate, RERA orders|4. Financial Transparency (10 points) — bank account verification, financial statements|5. Registration Quality (10 points) — timely renewals, information accuracy|6. Builder History (10 points) — track record across ALL projects (unique to ReraPedia)|7. Neighbourhood Quality (10 points) — metro proximity, schools, hospitals, AQI|8. Market Confidence (5 points) — agent network, search interest, price trends",
        "Score Tiers|85-100: Excellent — top-tier compliance and track record|60-84: Reliable — good compliance with minor issues|45-59: Average — some concerns, investigate further|30-44: Concerning — significant red flags present|0-29: High Risk — avoid unless you understand the risks",
        "What Makes Us Different from RERAScore|RERAScore uses 6 dimensions. ReraPedia adds two unique dimensions: Builder History (cross-project analysis) and Neighbourhood Quality (external data).|We also cover Haryana and Delhi which RERAScore doesn't, giving complete NCR coverage.",
        "Data Sources|All scoring data comes from official state RERA portals, scraped and updated regularly.|We never accept payment from builders to influence scores. The scoring is 100% algorithmic and data-driven.",
      ]),
  },
  {
    title: "Complete List of RERA Registered Projects in Sector 150 Noida",
    slug: "rera-registered-projects-sector-150-noida",
    category: "rankings",
    tags: ["noida", "sector-150", "rera", "projects", "list"],
    language: "en",
    seoTitle: "RERA Registered Projects in Sector 150 Noida — Complete List | ReraPedia",
    seoDescription: "All RERA registered projects in Sector 150, Noida with trust scores, builder ratings, possession dates, and price ranges. Updated 2026 data.",
    content: makeContent("Complete List of RERA Registered Projects in Sector 150 Noida",
      "Sector 150, Noida is one of the fastest-growing residential corridors in NCR, located along the Noida-Greater Noida Expressway.",
      [
        "Why Sector 150?|Strategic location between Noida and Greater Noida|Proximity to Yamuna Expressway and upcoming Jewar Airport|Several established and upcoming sports facilities (Gautam Buddha University nearby)|Growing social infrastructure with schools, hospitals, and malls",
        "RERA Registered Projects|All projects in Sector 150 must be registered with UP RERA.|Search 'Sector 150' on ReraPedia to see the complete list with trust scores.|Major builders with projects here include Tata Housing, ATS, Godrej, and several others.",
        "Price Range and Investment Potential|Prices range from Rs 45 lakhs to Rs 2+ crore depending on configuration.|The upcoming Jewar Airport and metro extension are expected to drive significant appreciation.",
        "How to Verify|Search any project on ReraPedia by name or RERA number|Check the builder's overall trust score across all their projects|Verify the possession date and construction progress|Compare with projects in adjacent sectors for value",
      ]),
  },
  {
    title: "RERA Delhi: Everything You Need to Know in 2026",
    slug: "rera-delhi-everything-you-need-know-2026",
    category: "guides",
    tags: ["rera", "delhi", "guide", "2026", "registration"],
    language: "en",
    seoTitle: "RERA Delhi — Complete Guide 2026 | ReraPedia",
    seoDescription: "Everything about Delhi RERA in 2026. Registration process, complaint mechanism, project search, builder verification, and how to protect your property investment.",
    content: makeContent("RERA Delhi: Everything You Need to Know in 2026",
      "Delhi RERA (Real Estate Regulatory Authority for NCT of Delhi) regulates all real estate projects in Delhi. Here's your comprehensive guide.",
      [
        "Delhi RERA Overview|Delhi RERA was established under the RERA Act 2016 and operates through the erera.co.in portal.|As of 2026, Delhi has 100+ registered projects covering residential, commercial, and mixed-use developments.|The authority handles project registrations, agent registrations, and buyer complaints.",
        "How to Search Projects|Visit erera.co.in or search directly on ReraPedia for Delhi projects.|On ReraPedia, you get additional data like trust scores, builder history, and comparison tools that the official portal doesn't provide.",
        "Filing Complaints in Delhi|Delhi RERA accepts online complaints through erera.co.in|Filing fee: Rs 1,000 for buyers, Rs 5,000 for associations|Typical resolution timeline: 60-90 days|Orders are enforceable like civil court decrees",
        "Key Differences from Other States|Delhi has a separate authority from Haryana and UP, so NCR buyers may need to deal with multiple authorities depending on project location.|Gurgaon projects fall under Haryana RERA, Noida under UP RERA, and Delhi projects under Delhi RERA.|ReraPedia aggregates all three, so you can search across NCR in one place.",
      ]),
  },
  {
    title: "Top 10 RERA Compliant Builders in Noida 2026",
    slug: "top-10-rera-compliant-builders-noida-2026",
    category: "rankings",
    tags: ["noida", "builders", "rera", "rankings", "2026"],
    language: "en",
    seoTitle: "Top 10 RERA Compliant Builders in Noida 2026 | ReraPedia",
    seoDescription: "Ranked list of most RERA-compliant builders in Noida and Greater Noida. Data-driven rankings based on trust scores, delivery record, and complaint history.",
    content: makeContent("Top 10 RERA Compliant Builders in Noida 2026",
      "Noida and Greater Noida are home to hundreds of real estate projects. Choosing the right builder is critical to a safe investment.",
      [
        "How We Rank|Rankings are based on ReraPedia's Trust Score system, which evaluates builders across 8 dimensions.|We analyze ALL registered projects by each builder — not just marketing claims.|Builders with higher scores have better delivery track records, fewer complaints, and stronger financial transparency.",
        "Key Factors We Analyze|On-time delivery record across all Noida projects|Number of RERA complaints and resolution rate|QPR submission regularity|Financial transparency (escrow account compliance)|Builder history across UP and other states",
        "Important Observations|Some well-known brand names have surprisingly low scores due to delayed projects or complaint volumes.|Smaller, focused builders sometimes score higher than large corporates because they deliver on time consistently.",
        "How to Use These Rankings|Visit rerapedia.com and search by builder name to see detailed trust scores|Use the comparison tool to compare any 2-5 builders side by side|Check the specific project you're interested in, not just the builder's average|Set alerts to get notified if a builder's score changes",
      ]),
  },
  {
    title: "How to File RERA Complaint Online in UP",
    slug: "file-rera-complaint-online-up",
    category: "guides",
    tags: ["rera", "complaint", "uttar-pradesh", "up", "online", "process"],
    language: "en",
    seoTitle: "How to File RERA Complaint Online in UP — Step by Step | ReraPedia",
    seoDescription: "Complete guide to filing a RERA complaint in Uttar Pradesh. Online process, required documents, fees, and what to expect. Covers Noida, Greater Noida, and all UP districts.",
    content: makeContent("How to File RERA Complaint Online in UP",
      "UP RERA is one of India's most active regulatory authorities, handling thousands of complaints annually. Here's how to file yours.",
      [
        "UP RERA Complaint Portal|Visit up-rera.in and navigate to the Complaint section.|UP RERA handles complaints for ALL UP districts including Noida, Greater Noida, Ghaziabad, Lucknow, Agra, and more.",
        "Step-by-Step Filing Process|Step 1: Register on the UP RERA portal with your Aadhaar/PAN details|Step 2: Select 'File Complaint' and choose the project from the dropdown|Step 3: Describe your complaint in detail (delayed possession, quality issues, false promises)|Step 4: Upload all supporting documents|Step 5: Pay the filing fee online|Step 6: Note your complaint number for tracking",
        "Required Documents|Allotment letter or builder-buyer agreement|Payment receipts and bank statements|Correspondence with the builder (emails, letters)|Project brochure or marketing material|Photos of construction progress (if applicable)|Any previous complaints filed (if applicable)",
        "What to Expect|UP RERA typically schedules hearings within 30-45 days|Both parties present their case with documents|The authority can order: refund with interest, compensation, or project completion|UP RERA orders are enforceable — non-compliance can lead to arrest",
        "Check on ReraPedia First|Before filing, check the project's complaint history on ReraPedia.|If other buyers have filed similar complaints, your case becomes stronger.|A project with many complaints will have a lower trust score, which can support your case.",
      ]),
  },
];

async function main() {
  console.log("Seeding Phase 3 blog posts...\n");

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) { console.log("No admin user found"); return; }

  let created = 0;
  for (const post of POSTS) {
    const exists = await prisma.blogPost.findFirst({ where: { slug: post.slug } });
    if (exists) {
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
        authorId: admin.id,
        publishedAt: new Date(),
      },
    });
    console.log(`  Created: ${post.title}`);
    created++;
  }

  const total = await prisma.blogPost.count({ where: { status: "PUBLISHED" } });
  console.log(`\nCreated ${created} new posts. Total published: ${total}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
