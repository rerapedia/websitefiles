/**
 * JSON-LD structured data generators for SEO.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rerapedia.com";
const SITE_NAME = "ReraPedia";

export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function generateFaqJsonLd(
  faqs: Array<{ question: string; answer: string }>,
): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateProductJsonLd(project: {
  name: string;
  slug: string;
  stateSlug: string;
  trustScore: number | null;
  description?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: project.name,
    description: project.description ?? `RERA registered project: ${project.name}`,
    url: `${SITE_URL}/project/${project.stateSlug}/${project.slug}`,
    brand: { "@type": "Brand", name: SITE_NAME },
    ...(project.trustScore != null && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: project.trustScore,
        bestRating: 100,
        worstRating: 0,
        ratingCount: 1,
      },
    }),
  };
}

export function generateOrganizationJsonLd(builder: {
  name: string;
  slug: string;
  description?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: builder.name,
    url: builder.website ?? `${SITE_URL}/builder/${builder.slug}`,
    ...(builder.description && { description: builder.description }),
    ...(builder.email && { email: builder.email }),
    ...(builder.phone && { telephone: builder.phone }),
  };
}

export function JsonLd({ data }: { data: object | object[] }): React.ReactElement {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
