import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { MapPin, Phone, ArrowRight } from "lucide-react";
import { getBydModels } from "@/lib/models.functions";
import { ModelCard } from "@/components/site/ModelCard";
import { localeLinks, ogMeta } from "@/lib/seo";
import { ssrLog } from "@/lib/ssr-logger";

const bydQO = queryOptions({ queryKey: ["models", "byd"], queryFn: () => getBydModels() });

const showrooms = [
  { name: "BYD Tejgaon Flagship", addr: "Aristo Tower, Tejgaon, Dhaka", note: "৬,০০০ স্কয়ার ফিট ফ্ল্যাগশিপ শোরুম" },
  { name: "Noor Autos — Uttara", addr: "House 8, Road 9C, Sector 15, Uttara, Dhaka", note: "অনুমোদিত ডিলার" },
  { name: "Otto Fix Ltd — Madani Avenue", addr: "Vatara, Dhaka", note: "অনুমোদিত ডিলার" },
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

export const Route = createFileRoute("/byd/")({
  head: () => ({
    meta: [
      { title: "BYD Car Price in Bangladesh 2026 | BYD Seal, Atto 3, Sealion 6 | BanglaEV" },
      { name: "description", content: "BYD Bangladesh-এর সকল গাড়ির দাম, স্পেসিফিকেশন ও শোরুম লোকেশন। BYD Seal ৳৮৯.৯ লাখ, Sealion 6 ৳৬৪.৯ লাখ, Atto 3 দাম ২০২৬।" },
      ...ogMeta({
        title: "BYD বাংলাদেশ — সকল মডেল, দাম ও শোরুম",
        description: "BYD Seal, Sealion 6, Atto 3, Dolphin — সব মডেলের দাম ও শোরুম এক জায়গায়।",
        path: "/byd",
      }),
    ],
    links: localeLinks("/byd"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "BYD Bangladesh",
          url: "https://banglaev.com/byd",
          description: "BYD Bangladesh authorised distributor CG Runner BD Ltd",
          address: showrooms.map((s) => ({
            "@type": "PostalAddress",
            streetAddress: s.addr,
            addressCountry: "BD",
          })),
        }),
      },
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
        </div>
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
