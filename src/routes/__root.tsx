import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">৪০৪</h1>
        <h2 className="mt-4 text-xl font-semibold">পেজটি খুঁজে পাওয়া যায়নি</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          আপনি যে পেজটি খুঁজছেন সেটি আর নেই অথবা সরিয়ে নেওয়া হয়েছে।
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            হোমে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">পেজটি লোড হয়নি</h1>
        <p className="mt-2 text-sm text-muted-foreground">কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            আবার চেষ্টা করুন
          </button>
          <a href="/" className="inline-flex rounded-full border border-input px-4 py-2 text-sm font-semibold">হোম</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BanglaEV — বাংলাদেশের ইলেকট্রিক গাড়ির গাইড" },
      {
        name: "description",
        content:
          "BYD, MG, Hyundai সহ বাংলাদেশে সকল EV-এর দাম, রিভিউ ও তুলনা। চার্জিং স্টেশন, কস্ট ক্যালকুলেটর ও সর্বশেষ খবর এক জায়গায়।",
      },
      { name: "author", content: "BanglaEV" },
      { name: "theme-color", content: "#00A651" },
      { name: "google-site-verification", content: "aYtVVCKYq_a0JYv7vCMiSRjULEP1APY3qIYqtmg-ofI" },
      { property: "og:site_name", content: "BanglaEV" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "bn_BD" },
      { property: "og:locale:alternate", content: "en_US" },
      // og:image / twitter:image are set per-leaf-route via ogMeta() in src/lib/seo.ts.
      // Setting them here would override every child page's share preview.
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "BanglaEV",
          alternateName: "বাংলাইভি",
          url: "https://banglaev.com",
          inLanguage: ["bn-BD", "en"],
          publisher: { "@id": "https://banglaev.com/#organization" },
          potentialAction: {
            "@type": "SearchAction",
            target: "https://banglaev.com/news?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": "https://banglaev.com/#organization",
          name: "BanglaEV",
          alternateName: "বাংলাইভি",
          url: "https://banglaev.com",
          logo: {
            "@type": "ImageObject",
            url: "https://banglaev.com/favicon.png",
          },
          sameAs: [
            "https://facebook.com/banglaev",
            "https://youtube.com/@banglaev",
            "https://instagram.com/banglaev",
          ],
          description:
            "Bangladesh's guide to electric vehicles — BYD, MG, Hyundai prices, reviews, comparisons, charging and cost calculators.",
          areaServed: { "@type": "Country", name: "Bangladesh" },
          knowsLanguage: ["bn", "en"],
        }),
      },
      {
        src: "https://www.googletagmanager.com/gtag/js?id=G-HQRD29M3GS",
        async: true,
      },
      {
        children:
          "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-HQRD29M3GS');",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
