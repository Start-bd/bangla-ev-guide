import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const slugInput = (d: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(d);

export const getSavedModels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_models")
      .select("model_slug, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveModel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(slugInput)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("saved_models")
      .upsert(
        { user_id: context.userId, model_slug: data.slug },
        { onConflict: "user_id,model_slug" },
      );
    if (error) throw new Error(error.message);
    return { saved: true };
  });

export const unsaveModel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(slugInput)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("saved_models")
      .delete()
      .eq("user_id", context.userId)
      .eq("model_slug", data.slug);
    if (error) throw new Error(error.message);
    return { saved: false };
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });
