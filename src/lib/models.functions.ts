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

async function safeQuery<T>(fn: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (e) {
    ssrLog.error({ scope: "server-fn", event: "db_read_failed", fn }, e);
    return fallback;
  }
}

export const getAllModels = createServerFn({ method: "GET" }).handler(() =>
  safeQuery("getAllModels", async () => {
    const { data, error } = await pub()
      .from("ev_models")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  }, []),
);

export const getFeaturedModels = createServerFn({ method: "GET" }).handler(() =>
  safeQuery("getFeaturedModels", async () => {
    const { data, error } = await pub()
      .from("ev_models")
      .select("*")
      .eq("is_featured", true)
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  }, []),
);

export const getBydModels = createServerFn({ method: "GET" }).handler(() =>
  safeQuery("getBydModels", async () => {
    const { data, error } = await pub()
      .from("ev_models")
      .select("*")
      .eq("brand", "BYD")
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  }, []),
);

export const getModelBySlug = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string() }).parse(d))
  .handler(({ data }) =>
    safeQuery(`getModelBySlug(${data.slug})`, async () => {
      const { data: row, error } = await pub()
        .from("ev_models")
        .select("*")
        .eq("slug", data.slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return row;
    }, null),
  );
