import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSavedModels, unsaveModel } from "@/lib/saved.functions";
import { getAllModels } from "@/lib/models.functions";
import { ModelCard } from "@/components/site/ModelCard";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({
    meta: [
      { title: "সেভ করা EV — BanglaEV" },
      { name: "description", content: "আপনার সেভ করা ইলেকট্রিক গাড়ির তালিকা।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const saved = useQuery({ queryKey: ["saved-models"], queryFn: () => getSavedModels() });
  const models = useQuery({ queryKey: ["models", "all"], queryFn: () => getAllModels() });

  const remove = useMutation({
    mutationFn: (slug: string) => unsaveModel({ data: { slug } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-models"] }),
  });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  const savedSlugs = new Set((saved.data ?? []).map((r) => r.model_slug));
  const savedModels = (models.data ?? []).filter((m) => savedSlugs.has(m.slug));
  const isLoading = saved.isLoading || models.isLoading;

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">সেভ করা EV</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            আপনার পছন্দের ইলেকট্রিক গাড়িগুলো এক জায়গায়।
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 rounded-full border border-input px-4 py-2 text-sm font-semibold hover:bg-accent"
        >
          <LogOut className="h-4 w-4" /> সাইন আউট
        </button>
      </div>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">লোড হচ্ছে…</p>
      ) : savedModels.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
          <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            এখনো কোনো গাড়ি সেভ করা হয়নি।
          </p>
          <Link
            to="/models"
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            সকল EV দেখুন
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {savedModels.map((m) => (
            <div key={m.slug} className="flex flex-col gap-3">
              <ModelCard model={m} />
              <button
                onClick={() => remove.mutate(m.slug)}
                disabled={remove.isPending}
                className="self-start rounded-full border border-input px-4 py-2 text-xs font-semibold hover:bg-accent disabled:opacity-60"
              >
                তালিকা থেকে সরান
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
