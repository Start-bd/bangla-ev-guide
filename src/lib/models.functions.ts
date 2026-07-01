import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function pub() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const getAllModels = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { data, error } = await pub()
      .from("ev_models")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  } catch (e) {
    console.error("getAllModels failed:", e);
    return [];
  }
});

export const getFeaturedModels = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await pub()
    .from("ev_models")
    .select("*")
    .eq("is_featured", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getBydModels = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await pub()
    .from("ev_models")
    .select("*")
    .eq("brand", "BYD")
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getModelBySlug = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await pub()
      .from("ev_models")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });
