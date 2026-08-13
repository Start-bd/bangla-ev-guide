# Add "Best Electric Bikes in Bangladesh" Guide Page

## Goal

Import the two prepared Markdown guides (English + Bangla) as a single SEO-optimized guide page on banglaev.com, following the site's existing bilingual convention. The content is a buyer's guide for electric bikes in Bangladesh with FAQ schema.

## Decisions (confirmed)

- **URL**: one route at `/guide/best-electric-bikes-bangladesh`, Bengali content primary, English in a collapsible `<details>` "Read in English" toggle — matches the existing news-article pattern. Standard `localeLinks` hreflang with `?lang=en`.
- **Dead links**: remap the Markdown's non-existent routes to real ones:
  - `/shop/electric-bikes` → `/models`
  - `/prices` → `/calculator`
  - `/policy` → `/charging`
  - `/services` → `/about`
  - `/bn/about` → `/about`
  - `/charging` stays `/charging`
- **Content storage**: dedicated static route file.
- **Image**: generate one branded hero (electric bike on a Dhaka street) via imagegen.

## What ships

1. **Hero image** — `imagegen` standard tier, ~1400×800, saved to `src/assets/guides/electric-bikes-bangladesh.jpg`, imported into the route for the page hero and `og:image`.

2. **New route** — `src/routes/guide.best-electric-bikes-bangladesh.tsx`
   - `createFileRoute("/guide/best-electric-bikes-bangladesh")`
   - `head()`:
     - `title`: "বাংলাদেশে সেরা ইলেকট্রিক বাইক (২০২৬) — ক্রয়ের গাইড | BanglaEV" (<60 chars)
     - `description`: the bn `meta_description` (already <160 chars)
     - `ogMeta({ ... path: "/guide/best-electric-bikes-bangladesh", type: "article", image: hero, imageAlt })`
     - `localeLinks("/guide/best-electric-bikes-bangladesh")`
     - JSON-LD scripts:
       - `FAQPage` from the 5 FAQ Q&As (Bengali).
       - `Article` (headline, datePublished 2026-08-13, author Organization BanglaEV, image, inLanguage bn, mainEntityOfPage absUrl).
       - `breadcrumbLd` Home › গাইড › সেরা ইলেকট্রিক বাইক.
   - Component: hero section with generated image; Bengali body (headings + paragraphs + checklist + FAQ) from the bn Markdown, with internal links remapped via `<Link to=...>`. English body in a `<details>` toggle from the en Markdown, links remapped the same way. Uses the existing `prose-bn` styling class and `container-page max-w-3xl` layout like `news.$slug.tsx`.

3. **Sitemap + llms.txt** — add `/guide/best-electric-bikes-bangladesh` (with hreflang alternates + lastmod 2026-08-13) to `public/sitemap.xml` and a pointer line to `public/llms.txt`.

4. **Cross-link** — add a link card to the guide from `/charging` (a "Related guide" CTA) since charging is the most topically adjacent hub. No nav-bar change.

5. **Verify** — run the SSR head checker for the new route (canonical, hreflang, og:url all `https://banglaev.com/...`); typecheck + build via harness.

## Not doing

- No `/bn/` prefixed routes (would break the site's bilingual convention).
- No `posts` table row (guides ≠ news).
- No new top-level nav entry.
- The Markdown's `<script type="application/ld+json">` inline FAQ blocks are replaced by the route's `head().scripts` FAQPage (no raw `<script>` in JSX body).

## Technical details

- Route filename dots→slashes: `guide.best-electric-bikes-bangladesh.tsx` → `createFileRoute("/guide/best-electric-bikes-bangladesh")`.
- Use `<Link to="/models" params={{}}>` style for internal nav; remapped targets are all existing static routes so no `params` needed except none.
- FAQ data: a `const FAQS = [{q, a}, ...]` array drives both the visible FAQ section and the `FAQPage` JSON-LD, keeping them in sync.
- Bengali numerals already in the bn content; keep as-is.
