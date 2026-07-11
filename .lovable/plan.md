## Goal

Address the high-impact items in the SEO audit for BanglaEV. Scope confirmed:
- Domain: rewrite all canonical/og:url/sitemap/robots to `https://banglaev.com`.
- Prices: use audit figures (Atto 3 Extended ৳55.90 lakh / Standard ৳49.90 lakh) with a visible "সর্বশেষ আপডেট" date.
- Skip static /compare/x-vs-y pages, /guide/ev-tax-registration, /charging directory rebuild, expanded news articles, and BYD price-list hub (deferred).

## What ships

1. **Domain switch to banglaev.com**
   - `src/lib/seo.ts`: `SITE_URL = "https://banglaev.com"`.
   - `src/routes/__root.tsx`: WebSite JSON-LD `url` and SearchAction target → banglaev.com.
   - `src/routes/sitemap[.]xml.ts`: `BASE_URL` → banglaev.com.
   - `public/robots.txt`: `Sitemap:` → banglaev.com.
   - `src/routes/byd.index.tsx`, `byd.$slug.tsx`, `models.$slug.tsx`: any remaining hardcoded hosts → banglaev.com.
   - `scripts/check-seo-head.ts`: update `SITE_URL` so the SSR head test still passes against the new host.
   - Note to user: the DNS/verification step in Project Settings → Domains is on them; canonicals will 404 in preview until DNS resolves. We deploy the code change now so it's ready.

2. **Real prices on placeholder model pages** (`ev_models` table via a migration)
   - Update `byd-atto-3` → `5590000` BDT, add variant note "Standard Range ৳49.90 lakh" in the model's description/notes column (whichever field the page renders).
   - Update `byd-dolphin` → mark as "সর্বশেষ আপডেট" pending official; if audit's price is uncertain, leave placeholder but ADD `last_price_update` date so `format.ts` no longer prints "শীঘ্রই ঘোষণা" alone.
   - Add `last_price_update` column (date) to `ev_models`; render a "সর্বশেষ আপডেট: DD MMM YYYY" line under the price in `models.$slug.tsx` and `byd.$slug.tsx`.

3. **Structured data (JSON-LD)**
   - `models.$slug.tsx` + `byd.$slug.tsx`: `Vehicle` + `Product` schema (name, brand, image, offers with `priceCurrency: "BDT"`, `price`, `availability`), `dateModified` from `last_price_update`, plus `BreadcrumbList` (Home › Brand › Model).
   - `byd.index.tsx`: `FAQPage` from the existing 8-Q FAQ block, `BreadcrumbList`.
   - `charging.tsx`: `FAQPage` from the existing FAQ block (if present), `BreadcrumbList`.
   - `news.$slug.tsx`: `Article` (headline, datePublished, dateModified, author, image), `BreadcrumbList`.
   - Every non-root leaf: `BreadcrumbList`. Extract a small `src/lib/jsonld.ts` helper so each route stays terse.

4. **Meta polish**
   - Trim any meta description over 160 chars (audit L5). Sweep every `head()` in `src/routes/`.
   - Add `og:image:alt` to `ogMeta()` in `src/lib/seo.ts` and thread an `imageAlt` argument.
   - `<html lang="bn">` is already set — verified, no change.

5. **Content/link hygiene**
   - `src/components/site/Footer.tsx`: replace `#` social links with real BanglaEV handles (Facebook + YouTube) — using the same handle convention as the About page email; user can swap URLs later if they own different accounts. Swap Privacy/Terms links to new pages (below).
   - New `src/routes/privacy.tsx` and `src/routes/terms.tsx` — plain bilingual pages (data usage, contact, no-warranty), each with its own head().
   - New `public/llms.txt` describing the site, sitemap, and a per-section pointer list — mirrors robots.txt style.

6. **Verification**
   - Update and run `scripts/check-seo-head.ts` against dev to confirm canonical/hreflang/og:url all resolve to banglaev.com.
   - Run typecheck + `bun run build` implicitly via the harness.

## What we're NOT doing this pass

Per the "high-impact only" scope: no static `/compare/x-vs-y` pages, no `/guide/ev-tax-registration-bangladesh`, no `/charging` directory rebuild, no news-article expansion, no per-model OG images (the "Edit with Lovable" badge is a paid publish setting, not a code change — flagged for the user to toggle in Project Settings).

## Technical details

- Domain URL is centralized in `src/lib/seo.ts::SITE_URL`; changing one constant flows to `localeLinks()` and `ogMeta()` on every route. Only the WebSite JSON-LD in `__root.tsx`, the sitemap `BASE_URL`, and `robots.txt` are separate copies.
- The `ev_models` schema change is additive (new nullable `last_price_update date` column) — safe migration, no data loss. Price updates are `UPDATE` statements in the same migration; publish/anon SELECT policies already allow reads.
- JSON-LD helper lives at `src/lib/jsonld.ts` and returns `{ type: "application/ld+json", children: JSON.stringify(...) }` entries suitable for `head().scripts`. Each schema function takes the loader-data shape it needs so route files stay ~3 lines heavier.
- `og:image:alt` becomes an optional `imageAlt` on `ogMeta({ ... })`; default to the title when omitted so no route regresses.
- `Footer.tsx` social hrefs: `https://facebook.com/banglaev` and `https://youtube.com/@banglaev` as placeholders matching the brand — user can override later; better than dead `#` links per audit L1.
- `check-seo-head.ts` currently hardcodes `SITE_URL` — update to import from `src/lib/seo.ts` to avoid future drift.

## After this ships (user actions, not code)

1. Connect **banglaev.com** in Project Settings → Domains and complete DNS.
2. Verify banglaev.com in Google Search Console and submit `https://banglaev.com/sitemap.xml`.
3. Toggle off the "Edit with Lovable" badge in publish settings (paid plan).
4. Confirm the Atto 3 / Dolphin figures with CG Runner BD Ltd before the next monthly price review.
