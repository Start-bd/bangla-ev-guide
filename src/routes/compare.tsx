import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getAllModels } from "@/lib/models.functions";
import { formatBDTLakh, formatKm, toBnDigits } from "@/lib/format";
import { useState } from "react";
import { localeLinks, absUrl } from "@/lib/seo";

const allQO = queryOptions({ queryKey: ["models", "all"], queryFn: () => getAllModels() });

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Electric Car Comparison Bangladesh 2026 | BYD vs MG vs Hyundai | BanglaEV" },
      { name: "description", content: "ইলেকট্রিক গাড়ি তুলনা: BYD Seal, Sealion 6, Atto 3, MG 4, Hyundai Ioniq 5 — দাম, রেঞ্জ, ব্যাটারি, স্পেক্স পাশাপাশি।" },
      { property: "og:title", content: "EV Comparison Bangladesh — BYD vs MG vs Hyundai" },
      { property: "og:description", content: "সকল EV-এর দাম ও স্পেক্স তুলনা।" },
      { property: "og:url", content: absUrl("/compare") },
    ],
    links: localeLinks("/compare"),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(allQO),
  component: ComparePage,
});

function ComparePage() {
  const { data: models } = useSuspenseQuery(allQO);
  const [selected, setSelected] = useState<string[]>(["seal", "sealion-6", "atto-3"]);
  const picked = selected.map((s) => models.find((m) => m.slug === s)).filter(Boolean) as typeof models;

  const toggle = (slug: string) =>
    setSelected((cur) =>
      cur.includes(slug) ? cur.filter((s) => s !== slug) : cur.length >= 3 ? [...cur.slice(1), slug] : [...cur, slug],
    );

  return (
    <>
      <section className="hero-gradient text-white">
        <div className="container-page py-16">
          <h1 className="text-4xl font-extrabold md:text-5xl">ইলেকট্রিক গাড়ি তুলনা — বাংলাদেশ ২০২৬</h1>
          <p className="mt-3 max-w-2xl text-white/80">সর্বোচ্চ ৩টি গাড়ি পাশাপাশি তুলনা করুন।</p>
        </div>
      </section>

      <section className="container-page py-12">
        <h2 className="mb-4 text-lg font-bold">গাড়ি বাছুন</h2>
        <div className="flex flex-wrap gap-2">
          {models.map((m) => (
            <button
              key={m.slug}
              onClick={() => toggle(m.slug)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                selected.includes(m.slug) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent"
              }`}
            >
              {m.brand} {m.model}
            </button>
          ))}
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">স্পেক</th>
                {picked.map((m) => (
                  <th key={m.id} className="px-4 py-3 text-left">{m.brand} {m.model}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <CRow label="দাম" picked={picked} get={(m) => formatBDTLakh(m.price_bdt)} />
              <CRow label="রেঞ্জ" picked={picked} get={(m) => formatKm(m.range_km)} />
              <CRow label="ব্যাটারি" picked={picked} get={(m) => (m.battery_kwh ? `${toBnDigits(String(m.battery_kwh))} kWh` : "—")} />
              <CRow label="০-১০০" picked={picked} get={(m) => (m.zero_to_hundred ? `${toBnDigits(String(m.zero_to_hundred))}s` : "—")} />
              <CRow label="দ্রুত চার্জ" picked={picked} get={(m) => (m.charging_time_min ? `${toBnDigits(m.charging_time_min)} মিনিট` : "—")} />
              <CRow label="টাইপ" picked={picked} get={(m) => m.type ?? "—"} />
              <CRow label="সেফটি" picked={picked} get={(m) => ((m.specs as Record<string, unknown> | null)?.safety as string) ?? "—"} />
            </tbody>
          </table>
        </div>
      </section>

      <section className="container-page pb-20">
        <h2 className="mb-6 text-2xl font-bold">জনপ্রিয় তুলনা</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: "BYD Seal vs Hyundai Ioniq 5", a: "seal", b: "hyundai-ioniq-5" },
            { t: "BYD Sealion 6 vs Toyota Prius", a: "sealion-6", b: null },
            { t: "BYD Atto 3 vs MG ZS EV", a: "atto-3", b: "mg-4" },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-bold">{c.t}</h3>
              <Link to="/compare" className="mt-3 inline-flex text-sm font-semibold text-primary">বিস্তারিত তুলনা →</Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function CRow<T extends { id: string }>({ label, picked, get }: { label: string; picked: T[]; get: (m: T) => string }) {
  return (
    <tr>
      <td className="bg-muted/40 px-4 py-3 font-medium">{label}</td>
      {picked.map((m) => (
        <td key={m.id} className="px-4 py-3">{get(m)}</td>
      ))}
    </tr>
  );
}
