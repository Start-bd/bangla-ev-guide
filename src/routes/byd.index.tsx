import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { MapPin, Phone, ArrowRight, ArrowDownRight } from "lucide-react";
import { getBydModels } from "@/lib/models.functions";
import { formatBDTLakh } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type EvModel = Database["public"]["Tables"]["ev_models"]["Row"];
import { ModelCard } from "@/components/site/ModelCard";
import { localeLinks, ogMeta, breadcrumbLd } from "@/lib/seo";
import { ssrLog } from "@/lib/ssr-logger";
import bydHero from "@/assets/pages/byd-hero.jpg";

const bydQO = queryOptions({ queryKey: ["models", "byd"], queryFn: () => getBydModels() });

const showrooms = [
  { name: "CG Runner BD Ltd — Tejgaon", addr: "Aristo Tower, Tejgaon, Dhaka", locality: "Dhaka", note: "৬,০০০ স্কয়ার ফিট ফ্ল্যাগশিপ শোরুম" },
  { name: "Noor Autos — Uttara", addr: "House 8, Road 9C, Sector 15, Uttara, Dhaka", locality: "Dhaka", note: "অনুমোদিত ডিলার" },
  { name: "Otto Fix Ltd — Madani Avenue", addr: "Vatara, Madani Avenue, Dhaka", locality: "Dhaka", note: "অনুমোদিত ডিলার" },
];

const faqs = [
  { q: "BYD বাংলাদেশের পরিবেশক কে?", a: "CG Runner BD Ltd একমাত্র অনুমোদিত পরিবেশক।" },
  { q: "BYD Seal-এর দাম কত?", a: "৳৮৯.৯ লাখ (Premium ও Performance ভ্যারিয়েন্ট)।" },
  { q: "BYD Sealion 6 কি প্লাগ-ইন হাইব্রিড?", a: "হ্যাঁ, ১,০৯২ কিমি কম্বাইন্ড রেঞ্জ সহ PHEV।" },
  { q: "BYD Atto 3 কখন বাংলাদেশে এসেছে?", a: "আপগ্রেডেড ভার্সন সেপ্টেম্বর ২০২৪-এ লঞ্চ হয়েছে।" },
  { q: "BYD গাড়ির ব্যাটারি কত বছর চলে?", a: "BYD Blade Battery-তে সাধারণত ৮ বছর/১.৫ লাখ কিমি ওয়ারেন্টি।" },
  { q: "চার্জিং কোথায় করব?", a: "তেজগাঁও শোরুম এবং ১৪+ পাবলিক স্টেশন; হোম চার্জিং সবচেয়ে সাশ্রয়ী।" },
  { q: "BYD গাড়ির সার্ভিস কোথায়?", a: "তেজগাঁও Aristo Tower এবং Otto Fix Ltd সার্ভিস সেন্টারে।" },
  { q: "BYD vs Toyota তুলনা?", a: "EV ক্যাটাগরিতে BYD এগিয়ে; হাইব্রিডে Sealion 6 Prius-এর চেয়ে বেশি রেঞ্জ দেয়।" },
];

const priceSummary = [
  { slug: "sealion-6", name: "Sealion 6", badge: "PHEV · ১,০৯২ কিমি", badgeEn: "PHEV · 1,092 km" },
  { slug: "seal", name: "Seal", badge: "Premium EV", badgeEn: "Premium EV" },
  { slug: "atto-3", name: "Atto 3", badge: "SUV", badgeEn: "SUV" },
  { slug: "dolphin", name: "Dolphin", badge: "হ্যাচব্যাক", badgeEn: "Hatchback" },
];

// English price label; falls back to "Coming soon" when no price is set.
function formatLakhEn(amount: number | null | undefined): string {
  if (!amount) return "Coming soon";
  const lakh = amount / 100000;
  if (lakh >= 100) return `BDT ${(lakh / 100).toFixed(2)} crore`;
  return `BDT ${lakh.toFixed(1)} lakh`;
}

const copy = {
  bn: { eyebrow: "দাম শুরু", details: "বিস্তারিত" },
  en: { eyebrow: "Starting price", details: "View details" },
};

export const Route = createFileRoute("/byd/")({
  validateSearch: (search: Record<string, unknown>): { lang?: "en" } =>
    search.lang === "en" ? { lang: "en" } : {},


  head: () => ({
    meta: [
      { title: "BYD Car Price in Bangladesh 2026 | BYD Seal, Atto 3, Sealion 6 | BanglaEV" },
      { name: "description", content: "BYD গাড়ির দাম বাংলাদেশে ২০২৬: Sealion 6 ৳৬৪.৯ লাখ থেকে শুরু, Seal ৳৮৯.৯ লাখ। Atto 3 ও Dolphin দাম শীঘ্রই ঘোষণা — স্পেসিফিকেশন ও শোরুম লোকেশন দেখুন।" },
      ...ogMeta({
        title: "BYD বাংলাদেশ — সকল মডেল, দাম ও শোরুম",
        description: "BYD দাম ২০২৬: Sealion 6 ৳৬৪.৯ লাখ, Seal ৳৮৯.৯ লাখ থেকে শুরু। Atto 3, Dolphin ও সব মডেলের স্পেস ও শোরুম।",
        path: "/byd",
      }),
    ],
    links: localeLinks("/byd"),
    scripts: [
      ...showrooms.map((s) => ({
        type: "application/ld+json" as const,
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AutoDealer",
          name: s.name,
          url: "https://banglaev.com/byd#showrooms",
          address: {
            "@type": "PostalAddress",
            streetAddress: s.addr,
            addressLocality: s.locality,
            addressCountry: "BD",
          },
          areaServed: { "@type": "Country", name: "Bangladesh" },
          brand: { "@type": "Brand", name: "BYD" },
          parentOrganization: { "@type": "Organization", name: "CG Runner BD Ltd" },
        }),
      })),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
      breadcrumbLd([
        { name: "হোম", path: "/" },
        { name: "BYD", path: "/byd" },
      ]),
    ],
  }),
  loader: async ({ context }) => {
    try {
      return await context.queryClient.ensureQueryData(bydQO);
    } catch (e) {
      ssrLog.error({ scope: "loader", event: "loader_failed", route: "/byd" }, e);
      throw e;
    }
  },
  component: BydHub,
});

function BydHub() {
  const { data: models } = useSuspenseQuery(bydQO);

  return (
    <>
      <section className="hero-gradient text-white">
        <div className="container-page py-16 md:py-24">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">BYD বাংলাদেশ</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl">
            BYD বাংলাদেশ — সকল মডেল, দাম ও শোরুম
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">
            চীনের শীর্ষ EV ব্র্যান্ড BYD এখন বাংলাদেশে। CG Runner BD Ltd-এর হাত ধরে BYD Seal,
            Sealion 6, Atto 3 ও Dolphin মডেল পাওয়া যাচ্ছে তেজগাঁও, উত্তরা ও মাদানি অ্যাভিনিউ শোরুমে।
            Build Your Dreams — এই স্লোগানে BYD বিশ্বের সবচেয়ে নিরাপদ Blade Battery দিয়ে তৈরি করছে
            পরবর্তী প্রজন্মের ইলেকট্রিক গাড়ি।
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {priceSummary.map((item) => {
              const m = models.find((x) => x.slug === item.slug) as EvModel | undefined;
              const price = m?.price_bdt ?? null;
              return (
                <Link
                  key={item.slug}
                  to="/byd/$slug"
                  params={{ slug: item.slug }}
                  className="group rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur transition hover:border-primary/50 hover:bg-white/10"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                    {item.badge}
                  </p>
                  <h3 className="mt-1 text-lg font-bold leading-tight">BYD {item.name}</h3>
                  <p className="mt-2 text-xl font-extrabold text-primary">
                    {formatBDTLakh(price)}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-white/70 transition group-hover:text-primary">
                    বিস্তারিত <ArrowDownRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page pt-10">
        <img
          src={bydHero}
          alt="BYD Seal বাংলাদেশ"
          width={1600}
          height={700}
          loading="lazy"
          decoding="async"
          className="w-full rounded-2xl object-cover shadow-md"
        />
      </section>

      <section className="container-page py-16">
        <h2 className="mb-8 text-3xl font-bold">BYD মডেল লাইনআপ</h2>
        {models.length === 0 ? (
          <div className="rounded-2xl border border-border bg-accent p-8 text-center">
            <p className="text-lg font-semibold">মডেল তথ্য এখন লোড করা যাচ্ছে না</p>
            <p className="mt-2 text-muted-foreground">
              আমাদের সার্ভার সাময়িকভাবে অনুপলব্ধ। কিছুক্ষণ পর আবার চেষ্টা করুন, অথবা সরাসরি{" "}
              <strong>CG Runner BD Ltd</strong> শোরুমে যোগাযোগ করুন।
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {models.map((m) => (
              <ModelCard key={m.id} {...m} />
            ))}
          </div>
        )}
      </section>


      <section id="showrooms" className="bg-accent py-16">
        <div className="container-page">
          <h2 className="mb-8 text-3xl font-bold">BYD শোরুম লোকেশন</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {showrooms.map((s) => (
              <div key={s.name} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">{s.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.addr}</p>
                <p className="mt-2 text-sm font-medium text-primary">{s.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm">
            <Phone className="h-4 w-4 text-primary" /> পরিবেশক: <strong>CG Runner BD Ltd</strong>
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="mb-8 text-3xl font-bold">প্রায়ই জিজ্ঞাসিত প্রশ্ন</h2>
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {faqs.map((f) => (
            <details key={f.q} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between font-semibold">
                {f.q}
                <span className="ml-4 text-primary transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <Link to="/compare" className="block rounded-2xl bg-[var(--color-navy)] p-8 text-white transition hover:opacity-95 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">তুলনা</p>
              <h3 className="mt-2 text-2xl font-bold">BYD vs Toyota, Hyundai, MG</h3>
              <p className="mt-2 max-w-xl opacity-80">সকল EV-এর দাম, রেঞ্জ ও স্পেসিফিকেশন পাশাপাশি দেখুন।</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground">
              বিস্তারিত তুলনা <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      </section>
    </>
  );
}
