/**
 * AI Project Summary Generator
 *
 * Generates plain-English summaries for project pages using structured data.
 * No external API needed — pure algorithmic generation from database fields.
 * Reads like an AI-written analysis but is deterministic and free.
 */

interface ProjectData {
  name: string;
  reraNumber: string;
  builderName: string | null;
  city: string | null;
  locality: string | null;
  state: string;
  status: string;
  type: string;
  trustScore: number | null;
  totalUnits: number | null;
  completionPercentage: number | null;
  possessionDate: Date | null;
  registrationDate: Date | null;
  expiryDate: Date | null;
  complaintCount: number;
  timelineEventCount: number;
}

function getScoreVerdict(score: number): string {
  if (score >= 80) return "excellent compliance record";
  if (score >= 60) return "reliable track record";
  if (score >= 45) return "average compliance standing";
  if (score >= 30) return "some compliance concerns";
  return "significant risk factors";
}

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    REGISTERED: "registered with RERA",
    UNDER_CONSTRUCTION: "currently under construction",
    COMPLETED: "completed and ready for possession",
    LAPSED: "has a lapsed RERA registration",
    REVOKED: "has its RERA registration revoked",
    EXTENDED: "has received a registration extension",
  };
  return map[status] ?? "registered";
}

function formatDateHuman(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(date));
}

export function generateProjectSummary(data: ProjectData): string {
  const parts: string[] = [];

  // Opening sentence
  const builder = data.builderName ?? "an unnamed promoter";
  const location = [data.locality, data.city, data.state].filter(Boolean).join(", ");
  parts.push(
    `${data.name} is a ${data.type.toLowerCase().replace(/_/g, " ")} project by ${builder}` +
    (location ? ` located in ${location}` : "") +
    `. The project is ${getStatusText(data.status)}.`
  );

  // Trust score analysis
  if (data.trustScore !== null) {
    const score = data.trustScore;
    parts.push(
      `Our analysis gives this project a Trust Score of ${score} out of 100, indicating ${getScoreVerdict(score)}.` +
      (score >= 60
        ? " This is above the platform average, suggesting the builder has maintained good regulatory compliance."
        : score >= 40
          ? " Buyers should conduct additional due diligence before making a decision."
          : " We recommend caution — verify all details directly with the RERA authority before proceeding.")
    );
  }

  // Project details
  if (data.totalUnits) {
    parts.push(`The project comprises ${data.totalUnits.toLocaleString("en-IN")} units.`);
  }

  if (data.completionPercentage !== null && data.completionPercentage > 0) {
    parts.push(`Construction progress stands at ${data.completionPercentage}% completion.`);
  }

  // Timeline / possession
  if (data.possessionDate) {
    const possDate = formatDateHuman(data.possessionDate);
    const isPast = new Date(data.possessionDate) < new Date();
    if (data.status === "COMPLETED") {
      parts.push(`The project has been completed and possession has been offered.`);
    } else if (isPast) {
      parts.push(`The original possession date of ${possDate} has passed. Buyers should verify the revised timeline with the builder.`);
    } else {
      parts.push(`Possession is expected by ${possDate}.`);
    }
  }

  // Registration info
  if (data.registrationDate) {
    parts.push(`The project was registered with ${data.state} RERA in ${formatDateHuman(data.registrationDate)}.`);
  }
  if (data.expiryDate) {
    const isExpired = new Date(data.expiryDate) < new Date();
    if (isExpired) {
      parts.push(`Note: The RERA registration expired in ${formatDateHuman(data.expiryDate)}. This is a significant red flag — the builder should have renewed the registration.`);
    } else {
      parts.push(`The registration is valid until ${formatDateHuman(data.expiryDate)}.`);
    }
  }

  // Complaints
  if (data.complaintCount > 0) {
    parts.push(
      `There ${data.complaintCount === 1 ? "is 1 complaint" : `are ${data.complaintCount} complaints`} filed against this project on the RERA portal.` +
      (data.complaintCount >= 5
        ? " A high number of complaints is a warning sign — review the complaint details before investing."
        : " Review the complaint details on this page for more information.")
    );
  } else {
    parts.push(`No complaints have been filed against this project on the RERA portal, which is a positive indicator.`);
  }

  // Closing recommendation
  if (data.trustScore !== null && data.trustScore >= 60) {
    parts.push(`Overall, ${data.name} appears to be a relatively safe investment based on available RERA data. However, always verify details independently and consult a legal advisor before making any purchase decision.`);
  } else if (data.trustScore !== null && data.trustScore < 40) {
    parts.push(`Based on available data, this project carries elevated risk. We strongly recommend thorough independent verification, including a site visit and legal review, before considering any investment.`);
  } else {
    parts.push(`As with any real estate investment, we recommend verifying all information independently with the ${data.state} RERA authority before making a purchase decision.`);
  }

  return parts.join(" ");
}

/**
 * Generate a short 1-2 line summary for cards/previews.
 */
export function generateShortSummary(data: {
  name: string;
  builderName: string | null;
  city: string | null;
  trustScore: number | null;
  status: string;
}): string {
  const score = data.trustScore;
  const builder = data.builderName ?? "Unknown builder";
  const city = data.city ?? "India";

  if (score === null) {
    return `${data.name} by ${builder} in ${city}. ${getStatusText(data.status)}.`;
  }

  return `${data.name} by ${builder} in ${city} has a Trust Score of ${score}/100 (${getScoreVerdict(score)}). The project is ${getStatusText(data.status)}.`;
}
