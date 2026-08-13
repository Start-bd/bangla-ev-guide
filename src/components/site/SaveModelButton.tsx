import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getSavedModels, saveModel, unsaveModel } from "@/lib/saved.functions";

export function SaveModelButton({ slug }: { slug: string }) {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const saved = useQuery({
    queryKey: ["saved-models"],
    queryFn: () => getSavedModels(),
    enabled: Boolean(user),
  });

  const isSaved = (saved.data ?? []).some((r) => r.model_slug === slug);

  const toggle = useMutation({
    mutationFn: () =>
      isSaved ? unsaveModel({ data: { slug } }) : saveModel({ data: { slug } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-models"] }),
  });

  if (loading) return null;

  if (!user) {
    return (
      <Link
        to="/auth"
        className="inline-flex items-center gap-2 rounded-full border border-input px-4 py-2 text-sm font-semibold hover:bg-accent"
      >
        <Heart className="h-4 w-4" /> সেভ করতে সাইন ইন করুন
      </Link>
    );
  }

  return (
    <button
      onClick={() => toggle.mutate()}
      disabled={toggle.isPending}
      aria-pressed={isSaved}
      className="inline-flex items-center gap-2 rounded-full border border-input px-4 py-2 text-sm font-semibold hover:bg-accent disabled:opacity-60"
    >
      <Heart className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
      {isSaved ? "সেভ করা হয়েছে" : "সেভ করুন"}
    </button>
  );
}
