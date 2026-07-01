import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { ssrLog } from "@/lib/ssr-logger";

function pub() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const getPosts = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ limit: z.number().int().min(1).max(50).optional() }).parse(d ?? {}))
  .handler(async ({ data }) => {
    try {
      const { data: rows, error } = await pub()
        .from("posts")
        .select("id, slug, title_bn, title_en, excerpt_bn, category, cover_url, author, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(data.limit ?? 20);
      if (error) throw new Error(error.message);
      return rows ?? [];
    } catch (e) {
      ssrLog.error({ scope: "server-fn", event: "db_read_failed", fn: "getPosts" }, e);
      return [];
    }
  });

export const getPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const { data: row, error } = await pub()
        .from("posts")
        .select("*")
        .eq("slug", data.slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return row;
    } catch (e) {
      ssrLog.error({ scope: "server-fn", event: "db_read_failed", fn: "getPostBySlug", slug: data.slug }, e);
      return null;
    }
  });
