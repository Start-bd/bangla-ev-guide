export const SITE_URL = (() => {
  // Resolve SITE_URL from environment in multiple runtimes (Node, Vite). Fall back to prod.
  try {
    // Node.js
    if (typeof process !== "undefined" && process.env?.SITE_URL) return process.env.SITE_URL;
  } catch {}

  try {
    // Vite / browser build-time env (import.meta.env may not be typed here)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof import.meta !== "undefined" && (import.meta as any).env?.SITE_URL) return (import.meta as any).env.SITE_URL;
  } catch {}

  return "https://banglaev.com";
})();

// Branded default social share card (1200x630) used when a route has no
// meaningful image of its own. Uploaded via lovable-assets — served from CDN.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

/**
 * Build canonical + bn/x-default hreflang link entries for a route path.
 * Pass a path starting with "/", e.g. "/about" or `/byd/${"slug"}`.
 * This function safely composes URLs using the WHATWG URL API so it
 * correctly handles incoming paths that already contain query strings.
 *
 * There is deliberately no separate "en" alternate here. Every route is a
 * single URL — English is offered inline (e.g. a "Read in English" detail),
 * not as a distinct page — so a "?lang=en" hreflang alternate would point
 * to a URL whose own canonical self-references the bn URL, which Google's
 * hreflang guidelines treat as an invalid/self-contradicting annotation.
 * If distinct English pages are ever built, give them a real path and add
 * a genuine hreflang="en" alternate pointing at that path.
 */
export function localeLinks(path: string) {
  const url = new URL(path, SITE_URL);
  const bn = url.toString();

  return [
    { rel: "canonical", href: bn },
    { rel: "alternate", hrefLang: "bn", href: bn },
    { rel: "alternate", hrefLang: "x-default", href: bn },
  ];
}

export function absUrl(path: string) {
  const url = new URL(path, SITE_URL);
  return url.toString();
}

/**
 * Resolve any image reference (absolute URL, protocol-relative, or site-relative
 * path) into an absolute https URL suitable for og:image / twitter:image.
 * Returns the branded default card when no image is provided.
 */
export function ogImage(src?: string | null): string {
  if (!src) return DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("//")) return `https:${src}`;
  return absUrl(src.startsWith("/") ? src : `/${src}`);
}

/**
 * Standard Open Graph + Twitter meta entries for a route. Include this in
 * every leaf route's `head().meta` array so social crawlers always find a
 * matching card image.
 */
export function ogMeta(opts: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  imageAlt?: string;
  type?: string; // "website" | "article" | "product" | ...
}) {
  const url = absUrl(opts.path);
  const image = ogImage(opts.image);
  const imageAlt = opts.imageAlt ?? opts.title;
  const type = opts.type ?? "website";
  // Only assert width/height for the one asset we've verified these against
  // (og-default.jpg, actually 1200x640) — every route-specific image (model
  // photos, page heroes, guide covers) has its own, different dimensions, so
  // a hardcoded 1200x630 for those would misdeclare the actual image size.
  const isDefaultImage = image === DEFAULT_OG_IMAGE;
  return [
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: imageAlt },
    ...(isDefaultImage
      ? [
          { property: "og:image:width", content: "1200" },
          { property: "og:image:height", content: "640" },
        ]
      : []),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: opts.description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: imageAlt },
  ];
}

/**
 * BreadcrumbList JSON-LD helper. Pass ordered crumbs — the last item is the
 * current page. Paths are joined to SITE_URL. Returns an object suitable for
 * inclusion in a route's head().scripts array.
 */
export function breadcrumbLd(items: Array<{ name: string; path: string }>) {
  return {
    type: "application/ld+json" as const,
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        item: absUrl(it.path),
      })),
    }),
  };
}

/** Minimal shape of an ev_models row needed for Car JSON-LD. */
export type CarLdModel = {
  brand: string;
  model: string;
  slug: string;
  type?: string | null;
  image_url?: string | null;
  range_km?: number | null;
  battery_kwh?: number | null;
  zero_to_hundred?: number | null;
  price_bdt?: number | null;
  last_price_update?: string | null; // keep as informational, do not reuse for modelYear

  // New explicit fields to avoid overloading last_price_update
  model_year?: string | number | null; // e.g. "2024"
  price_valid_until?: string | null; // ISO date when the listed price is valid until
};

/**
 * Car (Vehicle) JSON-LD for an EV model page. Extends Product via
 * additionalType so Google is eligible to show price/spec rich results.
 * `path` must be the canonical path of the page rendering it, so the
 * structured data self-references the same URL as canonical/og:url.
 */
export function carLd(m: CarLdModel, path: string) {
  const url = absUrl(path);
  const name = `${m.brand} ${m.model}`;

  // Prefer an explicit model_year field for vehicleModelDate
  const vehicleModelDate = m.model_year ? String(m.model_year) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Car",
    "@id": `${url}#vehicle`,
    additionalType: "https://schema.org/Product",
    name,
    brand: { "@type": "Brand", name: m.brand },
    model: m.model,
    manufacturer: { "@type": "Organization", name: m.brand },
    vehicleModelDate: vehicleModelDate,
    bodyType: m.type ?? undefined,
    vehicleConfiguration: m.type ?? undefined,
    fuelType: "Electric",
    vehicleEngine: {
      "@type": "EngineSpecification",
      fuelType: "Electric",
      engineType: "Electric motor",
    },
    inLanguage: "bn-BD",
    itemCondition: "https://schema.org/NewCondition",
    description: `${name} — ${m.type ?? "EV"}${m.range_km ? ` with ${m.range_km} km range` : ""} in Bangladesh.`,
    image: m.image_url ? ogImage(m.image_url) : DEFAULT_OG_IMAGE,
    url,
    mainEntityOfPage: url,
    ...(m.battery_kwh
      ? {
          fuelCapacity: {
            "@type": "QuantitativeValue",
            value: m.battery_kwh,
            unitCode: "KWH",
          },
        }
      : {}),
    ...(m.range_km
      ? {
          mileageFromOdometer: {
            "@type": "QuantitativeValue",
            value: m.range_km,
            unitCode: "KMT",
          },
        }
      : {}),
    ...(m.zero_to_hundred
      ? {
          accelerationTime: {
            "@type": "QuantitativeValue",
            value: m.zero_to_hundred,
            unitCode: "SEC",
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      ...(m.price_bdt ? { price: m.price_bdt } : {}),
      availability: m.price_bdt ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      itemCondition: "https://schema.org/NewCondition",
      url,
      areaServed: { "@type": "Country", name: "Bangladesh" },
      seller: { "@id": `${SITE_URL}/#organization` },
      ...(m.price_valid_until ? { priceValidUntil: m.price_valid_until } : {}),
    },
  };
}

/**
 * Named human author for Article / NewsArticle structured data and the
 * Organization founder. Real person — do not edit these values without
 * confirmation from the author.
 */
export const AUTHOR = {
  name: "Tawhid Hasan",
  jobTitle: "Founder",
  url: "https://www.linkedin.com/in/tawhid03",
} as const;

/**
 * Person JSON-LD node for the site author. Reference via `{ "@id": SITE_URL/#author }`
 * from Article/NewsArticle author fields, or embed directly.
 */
export function authorLd() {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/#author`,
    name: AUTHOR.name,
    jobTitle: AUTHOR.jobTitle,
    url: AUTHOR.url,
    sameAs: [AUTHOR.url],
    worksFor: { "@id": `${SITE_URL}/#organization` },
  };
}
