import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"]! });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  console.log("Seeding database...");

  // ──────────────────────────────────────────────────────────────────────────
  // STATES
  // ──────────────────────────────────────────────────────────────────────────
  const haryana = await prisma.state.upsert({
    where: { slug: "haryana" },
    update: {},
    create: {
      name: "Haryana",
      slug: "haryana",
      reraWebsiteUrl: "https://haryanarera.gov.in",
      scrapeConfigJson: {
        baseUrl: "https://haryanarera.gov.in",
        searchEndpoint: "/projectdetailsearch",
        rateLimit: 2,
        requiresPlaywright: true,
      },
    },
  });

  const delhi = await prisma.state.upsert({
    where: { slug: "delhi" },
    update: {},
    create: {
      name: "Delhi",
      slug: "delhi",
      reraWebsiteUrl: "https://rera.delhi.gov.in",
      scrapeConfigJson: {
        baseUrl: "https://rera.delhi.gov.in",
        searchEndpoint: "/projectSearch",
        rateLimit: 2,
        requiresPlaywright: false,
      },
    },
  });

  console.log(`  Created states: ${haryana.name}, ${delhi.name}`);

  // ──────────────────────────────────────────────────────────────────────────
  // BUILDERS
  // ──────────────────────────────────────────────────────────────────────────
  const dlf = await prisma.builder.upsert({
    where: { slug: "dlf-limited" },
    update: {},
    create: {
      name: "DLF Limited",
      slug: "dlf-limited",
      gstin: "06AABCD1234F1ZP",
      registeredAddress: "DLF Centre, Sansad Marg, New Delhi 110001",
      website: "https://www.dlf.in",
      phone: "+91-124-4571100",
      email: "contact@dlf.in",
      description:
        "DLF Limited is India's largest real estate developer with over 75 years of experience. Known for luxury residential and commercial projects across NCR.",
      totalProjects: 2,
    },
  });

  const emaar = await prisma.builder.upsert({
    where: { slug: "emaar-india" },
    update: {},
    create: {
      name: "Emaar India",
      slug: "emaar-india",
      gstin: "06AABCE5678G2ZQ",
      registeredAddress: "Emaar Business Park, Sector 65, Gurgaon 122018",
      website: "https://www.emaar-india.com",
      phone: "+91-124-4688888",
      email: "info@emaar-india.com",
      description:
        "Emaar India is the Indian subsidiary of Emaar Properties, a leading global real estate developer headquartered in Dubai.",
      totalProjects: 2,
    },
  });

  const godrej = await prisma.builder.upsert({
    where: { slug: "godrej-properties" },
    update: {},
    create: {
      name: "Godrej Properties",
      slug: "godrej-properties",
      gstin: "07AABCG9012H3ZR",
      registeredAddress: "Godrej One, Pirojshanagar, Vikhroli East, Mumbai 400079",
      website: "https://www.godrejproperties.com",
      phone: "+91-22-67272727",
      email: "contact@godrejproperties.com",
      description:
        "Godrej Properties is the real estate arm of the Godrej Group. Active in Gurgaon and Delhi NCR with premium residential projects.",
      totalProjects: 1,
    },
  });

  console.log(`  Created builders: ${dlf.name}, ${emaar.name}, ${godrej.name}`);

  // ──────────────────────────────────────────────────────────────────────────
  // PROJECTS
  // ──────────────────────────────────────────────────────────────────────────
  const projects = [
    {
      stateId: haryana.id,
      builderId: dlf.id,
      reraRegNumber: "HRERA-GRG-PROJ-0001-2023",
      name: "DLF The Arbour",
      slug: "dlf-the-arbour-sector-63-gurgaon",
      status: "UNDER_CONSTRUCTION" as const,
      type: "RESIDENTIAL" as const,
      locality: "Sector 63",
      city: "Gurgaon",
      district: "Gurgaon",
      pincode: "122018",
      lat: parseFloat("28.4128"),
      lng: parseFloat("77.0425"),
      totalUnits: 1000,
      carpetAreaMin: parseFloat("2500.00"),
      carpetAreaMax: parseFloat("4500.00"),
      priceMinPaise: BigInt(500000000),  // ₹50 lakh = 50,000,000 paise
      priceMaxPaise: BigInt(1200000000), // ₹1.2 crore
      possessionDateOriginal: new Date("2027-12-31"),
      reraRegistrationDate: new Date("2023-06-15"),
      reraExpiryDate: new Date("2028-06-15"),
      completionPercentage: parseFloat("35.50"),
      trustScore: parseFloat("78.40"),
      trustScoreJson: {
        delivery: 20,
        documents: 12,
        legalRisk: 13,
        financial: 8,
        registration: 9,
        builderHistory: 8,
        neighbourhood: 5,
        marketConfidence: 3.4,
      },
      seoTitle: "DLF The Arbour Sector 63 Gurgaon - RERA Status, Trust Score & Complaints",
      seoDescription:
        "Check DLF The Arbour RERA registration status, trust score 78/100, timeline, complaints, and possession date. Sector 63, Gurgaon.",
    },
    {
      stateId: haryana.id,
      builderId: emaar.id,
      reraRegNumber: "HRERA-GRG-PROJ-0045-2022",
      name: "Emaar Digi Homes",
      slug: "emaar-digi-homes-sector-62-gurgaon",
      status: "UNDER_CONSTRUCTION" as const,
      type: "RESIDENTIAL" as const,
      locality: "Sector 62",
      city: "Gurgaon",
      district: "Gurgaon",
      pincode: "122011",
      lat: parseFloat("28.4195"),
      lng: parseFloat("77.0530"),
      totalUnits: 632,
      carpetAreaMin: parseFloat("1400.00"),
      carpetAreaMax: parseFloat("2200.00"),
      priceMinPaise: BigInt(300000000),  // ₹30 lakh
      priceMaxPaise: BigInt(750000000),  // ₹75 lakh
      possessionDateOriginal: new Date("2026-06-30"),
      possessionDateRevised: new Date("2027-03-31"),
      reraRegistrationDate: new Date("2022-03-20"),
      reraExpiryDate: new Date("2027-03-20"),
      completionPercentage: parseFloat("62.00"),
      trustScore: parseFloat("65.20"),
      trustScoreJson: {
        delivery: 15,
        documents: 11,
        legalRisk: 10,
        financial: 7,
        registration: 8,
        builderHistory: 7,
        neighbourhood: 4.2,
        marketConfidence: 3,
      },
      seoTitle: "Emaar Digi Homes Sector 62 Gurgaon - RERA Status, Trust Score & Reviews",
      seoDescription:
        "Check Emaar Digi Homes RERA status, trust score 65/100, possession delay, complaints. Sector 62, Gurgaon.",
    },
    {
      stateId: haryana.id,
      builderId: dlf.id,
      reraRegNumber: "HRERA-GRG-PROJ-0112-2024",
      name: "DLF Privana West",
      slug: "dlf-privana-west-sector-77-gurgaon",
      status: "UNDER_CONSTRUCTION" as const,
      type: "RESIDENTIAL" as const,
      locality: "Sector 77",
      city: "Gurgaon",
      district: "Gurgaon",
      pincode: "122004",
      lat: parseFloat("28.3890"),
      lng: parseFloat("77.0620"),
      totalUnits: 795,
      carpetAreaMin: parseFloat("2700.00"),
      carpetAreaMax: parseFloat("5000.00"),
      priceMinPaise: BigInt(700000000),  // ₹70 lakh
      priceMaxPaise: BigInt(2000000000), // ₹2 crore
      possessionDateOriginal: new Date("2028-12-31"),
      reraRegistrationDate: new Date("2024-01-10"),
      reraExpiryDate: new Date("2029-01-10"),
      completionPercentage: parseFloat("12.00"),
      trustScore: parseFloat("82.10"),
      trustScoreJson: {
        delivery: 22,
        documents: 14,
        legalRisk: 14,
        financial: 9,
        registration: 10,
        builderHistory: 8,
        neighbourhood: 3,
        marketConfidence: 2.1,
      },
      seoTitle: "DLF Privana West Sector 77 Gurgaon - RERA Status & Trust Score",
      seoDescription:
        "Check DLF Privana West RERA registration, trust score 82/100, construction progress. Sector 77, Gurgaon.",
    },
    {
      stateId: delhi.id,
      builderId: emaar.id,
      reraRegNumber: "DLRERA-2023-0089",
      name: "Emaar Urban Oasis",
      slug: "emaar-urban-oasis-dwarka-delhi",
      status: "REGISTERED" as const,
      type: "RESIDENTIAL" as const,
      locality: "Dwarka",
      city: "New Delhi",
      district: "South West Delhi",
      pincode: "110075",
      lat: parseFloat("28.5823"),
      lng: parseFloat("77.0500"),
      totalUnits: 450,
      carpetAreaMin: parseFloat("1100.00"),
      carpetAreaMax: parseFloat("1800.00"),
      priceMinPaise: BigInt(400000000),  // ₹40 lakh
      priceMaxPaise: BigInt(900000000),  // ₹90 lakh
      possessionDateOriginal: new Date("2028-06-30"),
      reraRegistrationDate: new Date("2023-09-01"),
      reraExpiryDate: new Date("2028-09-01"),
      completionPercentage: parseFloat("5.00"),
      trustScore: parseFloat("71.50"),
      trustScoreJson: {
        delivery: 18,
        documents: 12,
        legalRisk: 12,
        financial: 7,
        registration: 9,
        builderHistory: 7,
        neighbourhood: 4.5,
        marketConfidence: 2,
      },
      seoTitle: "Emaar Urban Oasis Dwarka Delhi - RERA Status & Trust Score",
      seoDescription:
        "Check Emaar Urban Oasis RERA registration status, trust score 72/100. Dwarka, New Delhi.",
    },
    {
      stateId: delhi.id,
      builderId: godrej.id,
      reraRegNumber: "DLRERA-2024-0023",
      name: "Godrej Aristocrat",
      slug: "godrej-aristocrat-sector-49-gurgaon",
      status: "UNDER_CONSTRUCTION" as const,
      type: "RESIDENTIAL" as const,
      locality: "Sector 49",
      city: "New Delhi",
      district: "South Delhi",
      pincode: "110049",
      lat: parseFloat("28.5245"),
      lng: parseFloat("77.1855"),
      totalUnits: 340,
      carpetAreaMin: parseFloat("1800.00"),
      carpetAreaMax: parseFloat("3200.00"),
      priceMinPaise: BigInt(800000000),  // ₹80 lakh
      priceMaxPaise: BigInt(2500000000), // ₹2.5 crore
      possessionDateOriginal: new Date("2029-03-31"),
      reraRegistrationDate: new Date("2024-04-15"),
      reraExpiryDate: new Date("2029-04-15"),
      completionPercentage: parseFloat("8.00"),
      trustScore: parseFloat("85.30"),
      trustScoreJson: {
        delivery: 23,
        documents: 13,
        legalRisk: 14,
        financial: 9,
        registration: 10,
        builderHistory: 9,
        neighbourhood: 5,
        marketConfidence: 2.3,
      },
      seoTitle: "Godrej Aristocrat New Delhi - RERA Status, Trust Score & Reviews",
      seoDescription:
        "Check Godrej Aristocrat RERA registration, trust score 85/100. Premium project in New Delhi.",
    },
  ];

  for (const projectData of projects) {
    await prisma.project.upsert({
      where: {
        stateId_reraRegNumber: {
          stateId: projectData.stateId,
          reraRegNumber: projectData.reraRegNumber,
        },
      },
      update: {},
      create: projectData,
    });
  }

  console.log(`  Created ${projects.length} projects`);

  // ──────────────────────────────────────────────────────────────────────────
  // LOCALITIES
  // ──────────────────────────────────────────────────────────────────────────
  const localities = [
    {
      stateId: haryana.id,
      name: "Sector 63",
      slug: "sector-63",
      city: "Gurgaon",
      lat: parseFloat("28.4128"),
      lng: parseFloat("77.0425"),
      avgPriceSqftPaise: 1500000, // ₹15,000/sqft
      totalProjects: 8,
      description: "Sector 63 is a prime residential area in Gurgaon along the Golf Course Extension Road.",
    },
    {
      stateId: haryana.id,
      name: "Sector 62",
      slug: "sector-62",
      city: "Gurgaon",
      lat: parseFloat("28.4195"),
      lng: parseFloat("77.0530"),
      avgPriceSqftPaise: 1200000, // ₹12,000/sqft
      totalProjects: 5,
      description: "Sector 62 is an emerging residential hub in Gurgaon with excellent connectivity to NH-48.",
    },
    {
      stateId: delhi.id,
      name: "Dwarka",
      slug: "dwarka",
      city: "New Delhi",
      lat: parseFloat("28.5823"),
      lng: parseFloat("77.0500"),
      avgPriceSqftPaise: 800000, // ₹8,000/sqft
      totalProjects: 12,
      description: "Dwarka is a well-planned sub-city in South West Delhi with metro connectivity and proximity to IGI Airport.",
    },
  ];

  for (const localityData of localities) {
    await prisma.locality.upsert({
      where: {
        stateId_city_slug: {
          stateId: localityData.stateId,
          city: localityData.city,
          slug: localityData.slug,
        },
      },
      update: {},
      create: localityData,
    });
  }

  console.log(`  Created ${localities.length} localities`);

  // ──────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION PLANS
  // ──────────────────────────────────────────────────────────────────────────
  const plans = [
    {
      name: "Investor Premium",
      slug: "investor-premium",
      targetRole: "BUYER" as const,
      priceMonthlyPaise: 99900,    // ₹999
      priceAnnualPaise: 999900,    // ₹9,999
      featuresJson: {
        savedProjectsLimit: -1,
        alertsSms: true,
        alertsEmail: true,
        builderComparison: true,
        portfolioTracker: true,
        pdfReports: true,
        adFree: true,
        apiCallsPerDay: 100,
      },
      sortOrder: 1,
    },
    {
      name: "Builder Silver",
      slug: "builder-silver",
      targetRole: "BUILDER" as const,
      priceMonthlyPaise: 500000,   // ₹5,000
      priceAnnualPaise: 5000000,   // ₹50,000
      featuresJson: {
        respondToReviews: true,
        projectGalleries: true,
        leadDashboard: true,
        verifiedBadge: true,
        basicAnalytics: true,
        leadCreditsPerMonth: 0,
      },
      sortOrder: 2,
    },
    {
      name: "Builder Gold",
      slug: "builder-gold",
      targetRole: "BUILDER" as const,
      priceMonthlyPaise: 1500000,  // ₹15,000
      priceAnnualPaise: 15000000,  // ₹1,50,000
      featuresJson: {
        respondToReviews: true,
        projectGalleries: true,
        leadDashboard: true,
        verifiedBadge: true,
        featuredPlacement: true,
        sponsoredListings: true,
        advancedAnalytics: true,
        leadCreditsPerMonth: 20,
        apiAccess: true,
        customPdfReports: true,
      },
      sortOrder: 3,
    },
    {
      name: "Broker Plan",
      slug: "broker-plan",
      targetRole: "BROKER" as const,
      priceMonthlyPaise: 299900,   // ₹2,999
      priceAnnualPaise: 2999900,   // ₹29,999
      featuresJson: {
        verifiedAgentProfile: true,
        leadMarketplace: true,
        savedSearchAlerts: true,
        clientCrm: true,
        marketIntelligence: true,
        coBrandedReports: true,
      },
      sortOrder: 4,
    },
  ];

  for (const planData of plans) {
    await prisma.plan.upsert({
      where: { slug: planData.slug },
      update: {},
      create: planData,
    });
  }

  console.log(`  Created ${plans.length} subscription plans`);

  console.log("\nSeed completed successfully!");
}

main()
  .catch((e: Error) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
