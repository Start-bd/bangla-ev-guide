# Finish the Electric Bikes Guide — verification fixes and next steps

## What I checked

The guide page shipped and works: `/guide/best-electric-bikes-bangladesh` returns 200, the hero image exists, and the page is listed in `public/sitemap.xml` (with bn/en/x-default alternates) and `public/llms.txt`.

Two gaps remain.

## Gap 1 — The guide is an orphan page

No page on the site links to it. It is not in the header nav, not in the footer, and the planned "related guide" card on the charging page was never added. Search engines discover pages mainly through internal links, so an orphan page ranks poorly even when it is in the sitemap.

Fix:
- Add a "সম্পর্কিত গাইড" card at the bottom of `/charging` linking to the guide (hero thumbnail, title, one-line summary).
- Add a "গাইড" link to the footer's resources column.
- Add a compact guide teaser card to the home page below the news section.

## Gap 2 — Two sitemaps disagree

There is a static `public/sitemap.xml` (48 URLs, includes the guide) and a server-generated `src/routes/sitemap[.]xml.ts` (does not include the guide). Whichever one wins at a given moment, the safe move is to make them agree.

Fix: add the guide path to the `staticPaths` array in the server-generated sitemap route.

## Next steps after these fixes

1. Run the SSR head checker over every sitemap route to confirm the guide's canonical, hreflang, and og:url are all `https://banglaev.com/...`.
2. Publish, so the guide, the updated sitemap, and the Google Search Console verification tag all go live.
3. After publishing: submit the sitemap in Search Console and request indexing for the guide URL.

## Technical details

- Guide route: `src/routes/guide.best-electric-bikes-bangladesh.tsx` — no changes needed; it already emits FAQPage, Article, and BreadcrumbList JSON-LD.
- Internal links use `<Link to="/guide/best-electric-bikes-bangladesh">`, reusing the existing card styling from the news grid.
- Sitemap route edit: one entry in `staticPaths`, `changefreq: "monthly"`, `priority: "0.7"`.
- Verification: `BASE_URL=http://localhost:8080 bun scripts/check-seo-head.ts`.
