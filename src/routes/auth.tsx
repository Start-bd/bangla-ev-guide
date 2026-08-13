import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { GoogleSignInButton } from "@/components/site/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { localeLinks, ogMeta } from "@/lib/seo";

const TITLE = "সাইন ইন — BanglaEV";
const DESC = "Google দিয়ে সাইন ইন করে আপনার পছন্দের ইলেকট্রিক গাড়িগুলো সেভ করে রাখুন।";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "noindex" },
      ...ogMeta({ title: TITLE, description: DESC, path: "/auth", type: "website" }),
    ],
    links: localeLinks("/auth"),
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;
    const stored = sessionStorage.getItem("postAuthRedirect");
    sessionStorage.removeItem("postAuthRedirect");
    const target = stored && stored.startsWith("/") ? stored : "/saved";
    void navigate({ to: target, replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">সাইন ইন করুন</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Google অ্যাকাউন্ট দিয়ে সাইন ইন করে আপনার পছন্দের EV গুলো সেভ করে রাখুন।
        </p>

        <div className="mt-8">
          <GoogleSignInButton redirectPath="/saved" />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          সাইন ইন করলে আপনি আমাদের{" "}
          <Link to="/terms" className="underline">শর্তাবলি</Link> ও{" "}
          <Link to="/privacy" className="underline">প্রাইভেসি পলিসি</Link> মেনে নিচ্ছেন।
        </p>
      </div>
    </div>
  );
}
