export const SITE_URL = "https://banglaev.com";

// Branded default social share card (1200x630) used when a route has no
// meaningful image of its own. Uploaded via lovable-assets — served from CDN.
export const DEFAULT_OG_IMAGE =
  "https://banglaev.com/__l5e/assets-v1/23d5e77a-1b4d-4c52-bf25-9c4dcfa80119/og-default.jpg";

/**
 * Build canonical + bn/en/x-default hreflang link entries for a route path.
 * Pass a path starting with "/", e.g. "/about" or `/byd/${slug}`.
 */
export function localeLinks(path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const bn = `${SITE_URL}${clean}`;
  const en = `${SITE_URL}${clean}${clean.includes("?") ? "&" : "?"}lang=en`;
  return [
    { rel: "canonical", href: bn },
    { rel: "alternate", hrefLang: "bn", href: bn },
    { rel: "alternate", hrefLang: "en", href: en },
    { rel: "alternate", hrefLang: "x-default", href: bn },
  ];
}

export function absUrl(path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
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
  return `${SITE_URL}${src.startsWith("/") ? src : `/${src}`}`;
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
