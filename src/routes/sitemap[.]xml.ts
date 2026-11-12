import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { pub, backendCircuitOpen } from "@/lib/backend-client";
import { LOCAL_EV_MODELS, LOCAL_POSTS } from "@/lib/local-data";
import type { Database } from "@/integrations/supabase/types";

const BASE_URL = "https://banglaev.com";

type SitemapEntry = {
  path: string;
  lastmod?: string;
  changefreq: string;
  priority: string;
};

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let models: { slug: string; brand: string }[] | null = null;
        let posts: { slug: string; published_at: string | null }[] | null = null;

        if (!backendCircuitOpen()) {
          const supa = pub();
          if (supa) {
            try {
              const [m, p] = await Promise.all([
                supa.from("ev_models").select("slug,brand"),
                supa.from("posts").select("slug,published_at").eq("published", true),
              ]);
              if (m.error || p.error) throw new Error(m.error?.message || p.error?.message);
              models = (m.data as { slug: string; brand: string }[] | null) ?? null;
              posts = (p.data as { slug: string; published_at: string | null }[] | null) ?? null;
            } catch {
              // fall back to local catalogue below
            }
          }
        }
        if (!models) {
          models = LOCAL_EV_MODELS.map((m) => ({ slug: m.slug, brand: m.brand }));
        }
        if (!posts) {
          posts = LOCAL_POSTS.map((p) => ({ slug: p.slug, published_at: p.published_at }));
        }

        const staticPaths: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/models", changefreq: "weekly", priority: "0.9" },
          { path: "/byd", changefreq: "weekly", priority: "0.9" },
          { path: "/compare", changefreq: "weekly", priority: "0.8" },
          { path: "/calculator", changefreq: "monthly", priority: "0.8" },
          { path: "/charging", changefreq: "monthly", priority: "0.7" },
          {
            path: "/guide/best-electric-bikes-bangladesh",
            changefreq: "monthly",
            priority: "0.7",
          },
          { path: "/news", changefreq: "daily", priority: "0.8" },
          { path: "/about", changefreq: "yearly", priority: "0.4" },
          { path: "/privacy", changefreq: "yearly", priority: "0.2" },
          { path: "/terms", changefreq: "yearly", priority: "0.2" },
        ];

        const bydPaths: SitemapEntry[] = models
          .filter((m) => m.brand === "BYD")
          .map((m) => ({ path: `/byd/${m.slug}`, changefreq: "monthly", priority: "0.8" }));

        const modelPaths: SitemapEntry[] = models
          .filter((m) => m.brand !== "BYD")
          .map((m) => ({ path: `/models/${m.slug}`, changefreq: "monthly", priority: "0.7" }));

        const brandPaths: SitemapEntry[] = Array.from(
          new Set(models.filter((m) => m.brand !== "BYD").map((m) => m.brand.toLowerCase())),
        ).map((b) => ({ path: `/brands/${b}`, changefreq: "weekly", priority: "0.7" }));

        const postPaths: SitemapEntry[] = posts.map((p) => ({
          path: `/news/${p.slug}`,
          lastmod: p.published_at ?? undefined,
          changefreq: "monthly",
          priority: "0.6",
        }));

        const all = [...staticPaths, ...bydPaths, ...modelPaths, ...brandPaths, ...postPaths];

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
          ...all.map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE_URL}${e.path}</loc>`,
              `    <xhtml:link rel="alternate" hreflang="bn" href="${BASE_URL}${e.path}"/>`,
              `    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}${e.path}?lang=en"/>`,
              e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
              `    <changefreq>${e.changefreq}</changefreq>`,
              `    <priority>${e.priority}</priority>`,
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n"),
          ),
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
