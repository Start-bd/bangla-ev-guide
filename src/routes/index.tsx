import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Zap, Leaf, Wrench, ArrowRight, Calculator } from "lucide-react";
import { getFeaturedModels } from "@/lib/models.functions";
import { getPosts } from "@/lib/posts.functions";
import { ModelCard } from "@/components/site/ModelCard";
import { CostCalculator } from "@/components/site/CostCalculator";
import { localeLinks, ogMeta } from "@/lib/seo";
import heroCar from "@/assets/hero-car.jpg";
import whyEv from "@/assets/why-ev.jpg";
import news1 from "@/assets/news/news-1.jpg";
import news2 from "@/assets/news/news-2.jpg";
import news3 from "@/assets/news/news-3.jpg";
import news4 from "@/assets/news/news-4.jpg";
import bikesGuide from "@/assets/guides/electric-bikes-bangladesh.jpg";
const NEWS_FALLBACKS = [news1, news2, news3, news4];


const featuredQO = queryOptions({ queryKey: ["models", "featured"], queryFn: () => getFeaturedModels() });
const postsQO = queryOptions({ queryKey: ["posts", 4], queryFn: () => getPosts({ data: { limit: 4 } }) });

const HOME_TITLE = "BanglaEV — বাংলাদেশের ইলেকট্রিক গাড়ির গাইড";
const HOME_DESC = "বাংলাদেশে ইলেকট্রিক গাড়ি কিনুন: BYD, MG, Hyundai, Kia, Tesla, Neta, Zeekr — সকল EV-এর দাম, রিভিউ ও তুলনা এক জায়গায়।";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESC },
      ...ogMeta({ title: HOME_TITLE, description: HOME_DESC, path: "/", type: "website" }),
    ],
    links: [
      ...localeLinks("/"),
      { rel: "preload", as: "image", href: heroCar, fetchpriority: "high", media: "(min-width: 768px)" },
    ],
  }),

  loader: ({ context }) => {
    context.queryClient.ensureQueryData(featuredQO);
    context.queryClient.ensureQueryData(postsQO);
  },
  component: HomePage,
});

const BRANDS: { slug: string; name: string; note: string }[] = [
  { slug: "byd", name: "BYD", note: "Blade Battery • ফ্ল্যাগশিপ" },
  { slug: "mg", name: "MG", note: "ব্রিটিশ-চীনা লাইনআপ" },
  { slug: "hyundai", name: "Hyundai", note: "Ioniq 5 / 6 / Kona" },
  { slug: "kia", name: "Kia", note: "EV6 • Niro EV" },
  { slug: "tesla", name: "Tesla", note: "Model 3 • Model Y" },
  { slug: "zeekr", name: "Zeekr", note: "প্রিমিয়াম চীনা" },
];

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
              বাংলাদেশের সম্পূর্ণ EV গাইড
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">
              BYD, MG, Hyundai, Kia, Tesla, Neta, Zeekr — বাংলাদেশে উপলব্ধ সকল ইলেকট্রিক গাড়ির
              দাম, রিভিউ, তুলনা ও চার্জিং গাইড এক জায়গায়।
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/models" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105">
                সকল EV দেখুন <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/compare" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur hover:bg-white/15">
                দাম তুলনা করুন
              </Link>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute -inset-10 rounded-full bg-primary/20 blur-3xl" />
            <img
              src={heroCar}
              alt="Electric cars in Bangladesh at sunset"
              width={1920}
              height={1088}
              fetchPriority="high"
              className="relative rounded-2xl shadow-2xl shadow-black/40 ring-1 ring-white/10"
            />
          </div>

        </div>
      </section>

      {/* BRAND STRIP */}
      <section className="border-b border-border bg-card">
        <div className="container-page py-10">
          <div className="mb-6 flex flex-col items-start justify-between gap-2 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">ব্র্যান্ড</p>
              <h2 className="mt-1 text-2xl font-bold">ব্র্যান্ড অনুযায়ী ব্রাউজ করুন</h2>
            </div>
            <Link to="/models" className="text-sm font-semibold text-primary hover:underline">
              সব মডেল →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {BRANDS.map((b) =>
              b.slug === "byd" ? (
                <Link
                  key={b.slug}
                  to="/byd"
                  className="group rounded-2xl border border-border bg-background p-4 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                >
                  <div className="font-display text-lg font-black tracking-tight">{b.name}</div>
                  <div className="text-xs text-muted-foreground">{b.note}</div>
                </Link>
              ) : (
                <Link
                  key={b.slug}
                  to="/brands/$brand"
                  params={{ brand: b.slug }}
                  className="group rounded-2xl border border-border bg-background p-4 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                >
                  <div className="font-display text-lg font-black tracking-tight">{b.name}</div>
                  <div className="text-xs text-muted-foreground">{b.note}</div>
                </Link>
              ),
            )}
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
          <Link to="/models" className="text-sm font-semibold text-primary hover:underline">
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
          <div className="grid gap-10 md:grid-cols-[1.1fr,1fr] md:items-center">
            <img
              src={whyEv}
              alt="Red electric car beside green Bangladesh landscape with wind turbines"
              width={1400}
              height={900}
              loading="lazy"
              className="rounded-2xl shadow-xl ring-1 ring-border"
            />
            <div className="grid gap-4">
              {[
                { icon: Zap, t: "জ্বালানি সাশ্রয়", v: "৳৩/কিমি", s: "পেট্রোলে ৳১৫/কিমি — মাসে হাজার টাকা সাশ্রয়" },
                { icon: Leaf, t: "পরিবেশ বান্ধব", v: "৭৭% কম কার্বন", s: "শূন্য টেইলপাইপ ইমিশন, পরিচ্ছন্ন বাতাস" },
                { icon: Wrench, t: "কম রক্ষণাবেক্ষণ", v: "৫০% সাশ্রয়", s: "ইঞ্জিন অয়েল, স্পার্ক প্লাগ — কিছুই লাগে না" },
              ].map((c) => (
                <div key={c.t} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <c.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{c.t}</h3>
                    <p className="text-xl font-extrabold text-primary">{c.v}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{c.s}</p>
                  </div>
                </div>
              ))}
            </div>
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
            {posts.map((p, i) => {
              const cover = p.cover_url || NEWS_FALLBACKS[i % NEWS_FALLBACKS.length];
              return (
              <Link key={p.id} to="/news/$slug" params={{ slug: p.slug }} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={cover}
                    alt={p.title_bn}
                    width={1280}
                    height={800}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-xs font-semibold uppercase text-primary">{p.category}</span>
                  <h3 className="mt-2 line-clamp-3 font-display text-lg font-bold leading-snug group-hover:text-primary">{p.title_bn}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt_bn}</p>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* GUIDE TEASER */}
      <section className="container-page py-16">
        <Link
          to="/guide/best-electric-bikes-bangladesh"
          className="group grid gap-6 overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg sm:grid-cols-[320px_1fr]"
        >
          <div className="aspect-[16/10] overflow-hidden bg-muted sm:aspect-auto">
            <img
              src={bikesGuide}
              alt="বাংলাদেশে সেরা ইলেকট্রিক বাইক গাইড"
              width={1400}
              height={800}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col justify-center p-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">নতুন গাইড</span>
            <h2 className="mt-2 font-display text-2xl font-bold group-hover:text-primary">
              বাংলাদেশে সেরা ইলেকট্রিক বাইক (২০২৬)
            </h2>
            <p className="mt-2 text-muted-foreground">
              দাম, রেঞ্জ, ব্যাটারি ও চার্জিং খরচ — কেনার আগে যা জানা দরকার, এক গাইডে।
            </p>
            <span className="mt-4 text-sm font-semibold text-primary">গাইড পড়ুন →</span>
          </div>
        </Link>
      </section>
    </>

  );
}
