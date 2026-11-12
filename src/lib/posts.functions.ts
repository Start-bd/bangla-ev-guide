import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { LOCAL_POSTS } from "@/lib/local-data";
import { pub, backendCircuitOpen, noteBackendFailure } from "@/lib/backend-client";
import { ssrLog } from "@/lib/ssr-logger";

export const getPosts = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z.object({ limit: z.number().int().min(1).max(50).optional() }).parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const limit = data.limit ?? 20;
    if (backendCircuitOpen()) return LOCAL_POSTS.slice(0, limit);
    const client = pub();
    if (!client) return LOCAL_POSTS.slice(0, limit);
    try {
      const { data: rows, error } = await client
        .from("posts")
        .select(
          "id, slug, title_bn, title_en, excerpt_bn, category, cover_url, author, published_at",
        )
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      return rows ?? [];
    } catch (e) {
      noteBackendFailure();
      ssrLog.error({ scope: "server-fn", event: "db_read_failed", fn: "getPosts" }, e);
      return LOCAL_POSTS.slice(0, limit);
    }
  });

export const getPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    if (backendCircuitOpen()) {
      return LOCAL_POSTS.find((p) => p.slug === data.slug) ?? null;
    }
    const client = pub();
    if (!client) return LOCAL_POSTS.find((p) => p.slug === data.slug) ?? null;
    try {
      const { data: row, error } = await client
        .from("posts")
        .select("*")
        .eq("slug", data.slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return row;
    } catch (e) {
      noteBackendFailure();
      ssrLog.error(
        { scope: "server-fn", event: "db_read_failed", fn: "getPostBySlug", slug: data.slug },
        e,
      );
      return LOCAL_POSTS.find((p) => p.slug === data.slug) ?? null;
    }
  });
