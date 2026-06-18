import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Zap, Leaf, Wrench, ArrowRight, Calculator } from "lucide-react";
import { getFeaturedModels } from "@/lib/models.functions";
import { getPosts } from "@/lib/posts.functions";
import { ModelCard } from "@/components/site/ModelCard";
import { CostCalculator } from "@/components/site/CostCalculator";

const featuredQO = queryOptions({ queryKey: ["models", "featured"], queryFn: () => getFeaturedModels() });
const postsQO = queryOptions({ queryKey: ["posts", 4], queryFn: () => getPosts({ data: { limit: 4 } }) });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BanglaEV — বাংলাদেশের সেরা ইলেকট্রিক গাড়ির গাইড | BYD, MG, Hyundai" },
      { name: "description", content: "বাংলাদেশে ইলেকট্রিক গাড়ি কিনুন: BYD Seal, Sealion 6, Atto 3, MG 4, Hyundai Ioniq 5 — সকল EV-এর দাম, রিভিউ ও তুলনা এক জায়গায়।" },
      { property: "og:title", content: "BanglaEV — বাংলাদেশের সেরা ইলেকট্রিক গাড়ির গাইড" },
      { property: "og:description", content: "BYD, MG, Hyundai সহ সকল EV-এর দাম, রিভিউ ও তুলনা।" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(featuredQO);
    context.queryClient.ensureQueryData(postsQO);
  },
  component: HomePage,
});

function HomePage() {
  const { data: models } = useSuspenseQuery(featuredQO);
  const { data: posts } = useSuspenseQuery(postsQO);

  return (
    <>
      {/* HERO */}
      <section className="hero-gradient relative overflow-hidden text-white">
        <div className="container-page relative z-10 grid gap-10 py-20 md:grid-cols-[1.2fr,1fr] md:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Zap className="h-3.5 w-3.5 text-primary animate-bolt" />
              বাংলাদেশের #১ EV পোর্টাল
            </div>
            <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
              বাংলাদেশে ইলেকট্রিক গাড়ি কিনুন
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">
              BYD, MG, Hyundai Ioniq — সব EV-এর দাম, রিভিউ ও গাইড এক জায়গায়। শোরুম খুঁজুন, খরচ হিসাব করুন,
              বিশেষজ্ঞ রিভিউ পড়ুন।
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/byd" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105">
                BYD গাড়ি দেখুন <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/compare" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur hover:bg-white/15">
                দাম তুলনা করুন
              </Link>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute -inset-10 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative grid h-full place-items-center">
              <Zap className="h-64 w-64 text-primary animate-bolt drop-shadow-[0_0_40px_oklch(0.66_0.18_148/0.6)]" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED MODELS */}
      <section className="container-page py-20">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">ফিচার্ড মডেল</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">জনপ্রিয় EV গাড়ি</h2>
          </div>
          <Link to="/byd" className="text-sm font-semibold text-primary hover:underline">
            সকল মডেল দেখুন →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => (
            <ModelCard key={m.id} {...m} />
          ))}
        </div>
      </section>

      {/* WHY EV */}
      <section className="bg-accent py-20">
        <div className="container-page">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">কেন ইলেকট্রিক গাড়ি?</h2>
            <p className="mt-3 text-muted-foreground">
              পেট্রোলের চেয়ে ৫ গুণ সস্তা, ৭৭% কম কার্বন, ৫০% কম রক্ষণাবেক্ষণ
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Zap, t: "জ্বালানি সাশ্রয়", v: "৳৩/কিমি", s: "পেট্রোলে ৳১৫/কিমি — মাসে হাজার টাকা সাশ্রয়" },
              { icon: Leaf, t: "পরিবেশ বান্ধব", v: "৭৭% কম কার্বন", s: "শূন্য টেইলপাইপ ইমিশন, পরিচ্ছন্ন বাতাস" },
              { icon: Wrench, t: "কম রক্ষণাবেক্ষণ", v: "৫০% সাশ্রয়", s: "ইঞ্জিন অয়েল, স্পার্ক প্লাগ — কিছুই লাগে না" },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <c.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">{c.t}</h3>
                <p className="mt-1 text-2xl font-extrabold text-primary">{c.v}</p>
                <p className="mt-2 text-sm text-muted-foreground">{c.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATOR PREVIEW */}
      <section className="container-page py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">কস্ট ক্যালকুলেটর</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">আপনার মাসিক সাশ্রয় হিসাব করুন</h2>
            <p className="mt-4 text-muted-foreground">
              আপনার দৈনিক ড্রাইভিং, পেট্রোল ও বিদ্যুতের দাম দিন — দেখুন EV-তে শিফট করলে মাসে কত টাকা সাশ্রয় হবে।
            </p>
            <Link to="/calculator" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
              <Calculator className="h-4 w-4" /> পূর্ণ ক্যালকুলেটর খুলুন
            </Link>
          </div>
          <CostCalculator compact />
        </div>
      </section>

      {/* LATEST NEWS */}
      <section className="bg-muted/40 py-20">
        <div className="container-page">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">সর্বশেষ খবর</p>
              <h2 className="mt-2 text-3xl font-bold">EV ও অটো আপডেট</h2>
            </div>
            <Link to="/news" className="text-sm font-semibold text-primary hover:underline">সব দেখুন →</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {posts.map((p) => (
              <Link key={p.id} to="/news/$slug" params={{ slug: p.slug }} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-[16/10] bg-gradient-to-br from-[var(--color-navy)] to-primary/50">
                  <div className="grid h-full place-items-center">
                    <Zap className="h-12 w-12 text-white/30" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-xs font-semibold uppercase text-primary">{p.category}</span>
                  <h3 className="mt-2 line-clamp-3 font-display text-lg font-bold leading-snug group-hover:text-primary">{p.title_bn}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt_bn}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
