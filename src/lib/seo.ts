export const SITE_URL = "https://banglaev.com";

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
