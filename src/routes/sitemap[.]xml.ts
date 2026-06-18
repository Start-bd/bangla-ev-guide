import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const BASE_URL = "https://banglaev.com";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const supa = createClient<Database>(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
        );
        const [{ data: models }, { data: posts }] = await Promise.all([
          supa.from("ev_models").select("slug,brand"),
          supa.from("posts").select("slug,published_at").eq("published", true),
        ]);

        const staticPaths = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/byd", changefreq: "weekly", priority: "0.9" },
          { path: "/compare", changefreq: "weekly", priority: "0.8" },
          { path: "/calculator", changefreq: "monthly", priority: "0.8" },
          { path: "/charging", changefreq: "monthly", priority: "0.7" },
          { path: "/news", changefreq: "daily", priority: "0.8" },
          { path: "/about", changefreq: "yearly", priority: "0.4" },
        ];

        const bydPaths = (models ?? [])
          .filter((m) => m.brand === "BYD")
          .map((m) => ({ path: `/byd/${m.slug}`, changefreq: "monthly", priority: "0.8" }));

        const postPaths = (posts ?? []).map((p) => ({
          path: `/news/${p.slug}`,
          lastmod: p.published_at ?? undefined,
          changefreq: "monthly",
          priority: "0.6",
        }));

        const all = [...staticPaths, ...bydPaths, ...postPaths];

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
          ...all.map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE_URL}${e.path}</loc>`,
              `    <xhtml:link rel="alternate" hreflang="bn" href="${BASE_URL}${e.path}"/>`,
              `    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}${e.path}?lang=en"/>`,
              "lastmod" in e && e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
              `    <changefreq>${e.changefreq}</changefreq>`,
              `    <priority>${e.priority}</priority>`,
              `  </url>`,
            ].filter(Boolean).join("\n"),
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
