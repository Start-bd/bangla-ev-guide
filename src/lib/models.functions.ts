import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { LOCAL_EV_MODELS } from "@/lib/local-data";
import { pub, backendCircuitOpen, noteBackendFailure } from "@/lib/backend-client";
import { ssrLog } from "@/lib/ssr-logger";

let warnedUnreachable = false;
function logFallback(source: string, e: unknown) {
  if (warnedUnreachable) return;
  warnedUnreachable = true;
  ssrLog.warn({ scope: "server-fn", event: "backend_unreachable_using_local_data", source }, e);
}

async function withBackend<T>(
  source: string,
  run: (client: NonNullable<ReturnType<typeof pub>>) => Promise<T>,
  fallback: T,
): Promise<T> {
  if (backendCircuitOpen()) return fallback;
  const client = pub();
  if (!client) return fallback;
  try {
    const result = await run(client);
    return result;
  } catch (e) {
    noteBackendFailure();
    logFallback(source, e);
    return fallback;
  }
}

export const getAllModels = createServerFn({ method: "GET" }).handler(() =>
  withBackend(
    "getAllModels",
    async (client) => {
      const { data, error } = await client
        .from("ev_models")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    LOCAL_EV_MODELS,
  ),
);

export const getFeaturedModels = createServerFn({ method: "GET" }).handler(() =>
  withBackend(
    "getFeaturedModels",
    async (client) => {
      const { data, error } = await client
        .from("ev_models")
        .select("*")
        .eq("is_featured", true)
        .order("display_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    LOCAL_EV_MODELS.filter((m) => m.is_featured),
  ),
);

export const getBydModels = createServerFn({ method: "GET" }).handler(() =>
  withBackend(
    "getBydModels",
    async (client) => {
      const { data, error } = await client
        .from("ev_models")
        .select("*")
        .eq("brand", "BYD")
        .order("display_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    LOCAL_EV_MODELS.filter((m) => m.brand === "BYD"),
  ),
);

export const getModelsByBrand = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ brand: z.string() }).parse(d))
  .handler(({ data }) =>
    withBackend(
      `getModelsByBrand(${data.brand})`,
      async (client) => {
        const { data: rows, error } = await client
          .from("ev_models")
          .select("*")
          .ilike("brand", data.brand)
          .order("display_order", { ascending: true });
        if (error) throw new Error(error.message);
        return rows ?? [];
      },
      LOCAL_EV_MODELS.filter((m) => m.brand.toLowerCase() === data.brand.toLowerCase()),
    ),
  );

export const getModelBySlug = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string() }).parse(d))
  .handler(({ data }) =>
    withBackend(
      `getModelBySlug(${data.slug})`,
      async (client) => {
        const { data: row, error } = await client
          .from("ev_models")
          .select("*")
          .eq("slug", data.slug)
          .maybeSingle();
        if (error) throw new Error(error.message);
        return row;
      },
      LOCAL_EV_MODELS.find((m) => m.slug === data.slug) ?? null,
    ),
  );
