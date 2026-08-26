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
 * Build canonical + bn/en/x-default hreflang link entries for a route path.
 * Pass a path starting with "/", e.g. "/about" or `/byd/${"slug"}`.
 * This function now safely composes URLs using the WHATWG URL API so it
 * correctly handles incoming paths that already contain query strings.
 */
export function localeLinks(path: string) {
  const url = new URL(path, SITE_URL);
  const bn = url.toString();
  const enUrl = new URL(bn);
  enUrl.searchParams.set("lang", "en");

  return [
    { rel: "canonical", href: bn },
    { rel: "alternate", hrefLang: "bn", href: bn },
    { rel: "alternate", hrefLang: "en", href: enUrl.toString() },
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
  return [
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: imageAlt },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
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
