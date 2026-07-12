import { createFileRoute } from "@tanstack/react-router";
import { Zap, Home, MapPin } from "lucide-react";
import { localeLinks, ogMeta, breadcrumbLd } from "@/lib/seo";
import chargingHero from "@/assets/pages/charging-hero.jpg";

const CHG_TITLE = "EV Charging Stations in Bangladesh 2026 | BanglaEV";
const CHG_DESC = "বাংলাদেশে EV চার্জিং স্টেশন: ১৪+ পাবলিক স্টেশন, ২০২৬-এর লক্ষ্য ১,২০০। হোম চার্জিং, BERC ট্যারিফ ৳৭.৬৪/kWh — সম্পূর্ণ গাইড।";

const CHG_FAQS = [
  { q: "বাসায় চার্জ করা যাবে?", a: "হ্যাঁ। ৭kW ওয়ালবক্স দিয়ে সারারাতে ফুল চার্জ।" },
  { q: "কত সময় লাগে?", a: "AC: ৬-৮ ঘণ্টা। DC ফাস্ট: ৩০-৪৫ মিনিট (৩০→৮০%)।" },
  { q: "এক চার্জে খরচ কত?", a: "BYD Atto 3 (~৬০ kWh) ফুল চার্জে ~৳৪৬০ (BERC রেটে)।" },
];

export const Route = createFileRoute("/charging")({
  head: () => ({
    meta: [
      { title: CHG_TITLE },
      { name: "description", content: CHG_DESC },
      ...ogMeta({ title: CHG_TITLE, description: CHG_DESC, path: "/charging" }),
    ],
    links: localeLinks("/charging"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: CHG_FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
      breadcrumbLd([
        { name: "হোম", path: "/" },
        { name: "চার্জিং গাইড", path: "/charging" },
      ]),
    ],
  }),
  component: ChargingPage,
});

const stations = [
  "BYD Tejgaon (Aristo Tower)",
  "Gulshan Sheraton",
  "Banani 11",
  "Bashundhara R/A",
  "Uttara Sector 7",
  "Mirpur DOHS",
  "Dhanmondi 27",
  "Mohakhali DOHS",
];

function ChargingPage() {
  return (
    <>
      <section className="hero-gradient text-white">
        <div className="container-page py-16">
          <h1 className="text-4xl font-extrabold md:text-5xl">বাংলাদেশে EV চার্জিং — কোথায়, কিভাবে</h1>
          <p className="mt-3 max-w-2xl text-white/80">
            ২০২৫-এ ১৪+ পাবলিক স্টেশন। ২০২৬-এর সরকারি লক্ষ্য: ১,২০০ স্টেশন।
          </p>
        </div>
      </section>

      <section className="container-page pt-10">
        <img
          src={chargingHero}
          alt="বাংলাদেশে EV চার্জিং স্টেশন"
          width={1600}
          height={700}
          loading="lazy"
          decoding="async"
          className="w-full rounded-2xl object-cover shadow-md"
        />
      </section>

      <section className="container-page grid gap-10 py-16 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <Home className="h-6 w-6 text-primary" />
          <h2 className="mt-3 text-2xl font-bold">হোম চার্জিং</h2>
          <p className="mt-3 text-muted-foreground">
            সবচেয়ে সাশ্রয়ী উপায়। একটি ৭-১১ kW AC ওয়ালবক্স ইনস্টল করলে সারারাতে গাড়ি ফুল চার্জ হয়ে যায়।
            BERC-এর EV ট্যারিফ <strong>৳৭.৬৪/kWh</strong> — ৬০ কিমি/দিন চালালে মাসে ~৳২,৫০০।
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <Zap className="h-6 w-6 text-primary" />
          <h2 className="mt-3 text-2xl font-bold">DC ফাস্ট চার্জিং</h2>
          <p className="mt-3 text-muted-foreground">
            পাবলিক স্টেশনে ৫০-১২০ kW DC ফাস্ট চার্জার থাকে। বেশিরভাগ EV ৩০%→৮০% মাত্র ৩০ মিনিটে চার্জ হয়।
            লং ট্রিপের জন্য আদর্শ।
          </p>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="container-page">
          <h2 className="mb-6 text-2xl font-bold">ঢাকার পরিচিত চার্জিং লোকেশন</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {stations.map((s) => (
              <div key={s} className="flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm">
                <MapPin className="h-4 w-4 text-primary" /> {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="mb-6 text-2xl font-bold">প্রশ্ন ও উত্তর</h2>
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {CHG_FAQS.map((f) => (
            <details key={f.q} className="group p-6">
              <summary className="cursor-pointer font-semibold">{f.q}</summary>
              <p className="mt-3 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
