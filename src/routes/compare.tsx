import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getAllModels } from "@/lib/models.functions";
import { formatBDTLakh, formatKm, toBnDigits } from "@/lib/format";
import { useMemo, useState } from "react";
import { localeLinks, ogMeta } from "@/lib/seo";
import { MODEL_IMAGES } from "@/components/site/ModelCard";
import { Zap, X } from "lucide-react";

const allQO = queryOptions({ queryKey: ["models", "all"], queryFn: () => getAllModels() });

const CMP_TITLE = "Compare Electric Cars Bangladesh 2026 | BYD, MG, Hyundai, Kia, Tesla | BanglaEV";
const CMP_DESC = "যে কোনো ব্র্যান্ডের ইলেকট্রিক গাড়ি পাশাপাশি তুলনা করুন — BYD, MG, Hyundai, Kia, Tesla, Neta, Zeekr। দাম, রেঞ্জ, ব্যাটারি ও স্পেসিফিকেশন।";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: CMP_TITLE },
      { name: "description", content: CMP_DESC },
      ...ogMeta({ title: CMP_TITLE, description: CMP_DESC, path: "/compare" }),
    ],
    links: localeLinks("/compare"),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(allQO),
  component: ComparePage,
});

function ComparePage() {
  const { data: models } = useSuspenseQuery(allQO);

  // Diverse multi-brand default so first view isn't BYD-only.
  const [selected, setSelected] = useState<string[]>(["seal", "hyundai-ioniq-5", "mg-4"]);
  const [brandFilter, setBrandFilter] = useState<string>("all");

  const brands = useMemo(
    () => Array.from(new Set(models.map((m) => m.brand))).sort(),
    [models],
  );

  const picked = selected
    .map((s) => models.find((m) => m.slug === s))
    .filter(Boolean) as typeof models;

  const visible =
    brandFilter === "all" ? models : models.filter((m) => m.brand === brandFilter);

  const toggle = (slug: string) =>
    setSelected((cur) =>
      cur.includes(slug)
        ? cur.filter((s) => s !== slug)
        : cur.length >= 3
          ? [...cur.slice(1), slug]
          : [...cur, slug],
    );

  // Popular multi-brand comparisons.
  const popular: { title: string; slugs: [string, string, string?] }[] = [
    { title: "BYD Seal vs Hyundai Ioniq 5 vs MG 4", slugs: ["seal", "hyundai-ioniq-5", "mg-4"] },
    { title: "Hyundai Ioniq 5 vs Kia EV6", slugs: ["hyundai-ioniq-5", "kia-ev6"] },
    { title: "Tesla Model Y vs BYD Sealion 6", slugs: ["tesla-model-y", "sealion-6"] },
    { title: "MG ZS EV vs Hyundai Kona Electric", slugs: ["mg-zs-ev", "hyundai-kona-electric"] },
    { title: "BYD Atto 3 vs MG 4 vs Neta V", slugs: ["atto-3", "mg-4", "neta-v"] },
    { title: "Tesla Model 3 vs BYD Seal", slugs: ["tesla-model-3", "seal"] },
  ];

  return (
    <>
      <section className="hero-gradient text-white">
        <div className="container-page py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">EV তুলনা</p>
          <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">
            ইলেকট্রিক গাড়ি তুলনা — বাংলাদেশ ২০২৬
          </h1>
          <p className="mt-3 max-w-2xl text-white/80">
            সকল ব্র্যান্ডের মধ্যে সর্বোচ্চ ৩টি গাড়ি পাশাপাশি তুলনা করুন — BYD, MG, Hyundai, Kia, Tesla ও আরও।
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        {/* Selected pills */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">
            নির্বাচিত ({toBnDigits(picked.length)}/৩):
          </span>
          {picked.length === 0 && (
            <span className="text-sm text-muted-foreground">নিচ থেকে গাড়ি বাছুন</span>
          )}
          {picked.map((m) => (
            <button
              key={m.slug}
              onClick={() => toggle(m.slug)}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
            >
              {m.brand} {m.model}
              <X className="h-3 w-3" />
            </button>
          ))}
          {selected.length > 0 && (
            <button
              onClick={() => setSelected([])}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              সব পরিষ্কার
            </button>
          )}
        </div>

        {/* Brand filter */}
        <div className="mb-3 flex flex-wrap gap-2">
          <BrandChip active={brandFilter === "all"} onClick={() => setBrandFilter("all")}>
            সব ব্র্যান্ড
          </BrandChip>
          {brands.map((b) => (
            <BrandChip key={b} active={brandFilter === b} onClick={() => setBrandFilter(b)}>
              {b}
            </BrandChip>
          ))}
        </div>

        <h2 className="mt-6 mb-3 text-lg font-bold">গাড়ি বাছুন</h2>
        <div className="flex flex-wrap gap-2">
          {visible.map((m) => (
            <button
              key={m.slug}
              onClick={() => toggle(m.slug)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                selected.includes(m.slug)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              <span className="opacity-70">{m.brand}</span> {m.model}
            </button>
          ))}
        </div>

        {picked.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border bg-accent p-8 text-center">
            <p className="font-semibold">অন্তত একটি গাড়ি নির্বাচন করুন।</p>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left">স্পেক</th>
                  {picked.map((m) => (
                    <th key={m.id} className="px-4 py-3 text-left">
                      {m.brand} {m.model}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr data-testid="compare-image-row">
                  <td className="bg-muted/40 px-4 py-3 font-medium">ছবি</td>
                  {picked.map((m) => {
                    const img = MODEL_IMAGES[m.slug];
                    return (
                      <td key={m.id} className="px-4 py-3">
                        <div className="relative aspect-[16/10] w-40 overflow-hidden rounded-lg bg-gradient-to-br from-[var(--color-navy)] to-[oklch(0.3_0.05_275)]">
                          {img ? (
                            <img
                              src={img.src}
                              srcSet={img.srcSet}
                              sizes="160px"
                              alt={`${m.brand} ${m.model}`}
                              width={1280}
                              height={800}
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 grid place-items-center text-center">
                              <div>
                                <Zap className="mx-auto h-5 w-5 text-white/25" />
                                <p className="mt-1 text-[10px] font-bold text-white/70">{m.brand}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <CRow label="ব্র্যান্ড" picked={picked} get={(m) => m.brand} />
                <CRow label="দাম" picked={picked} get={(m) => formatBDTLakh(m.price_bdt)} />
                <CRow label="রেঞ্জ" picked={picked} get={(m) => formatKm(m.range_km)} />
                <CRow
                  label="ব্যাটারি"
                  picked={picked}
                  get={(m) => (m.battery_kwh ? `${toBnDigits(String(m.battery_kwh))} kWh` : "—")}
                />
                <CRow
                  label="০-১০০"
                  picked={picked}
                  get={(m) =>
                    m.zero_to_hundred ? `${toBnDigits(String(m.zero_to_hundred))}s` : "—"
                  }
                />
                <CRow
                  label="দ্রুত চার্জ"
                  picked={picked}
                  get={(m) => (m.charging_time_min ? `${toBnDigits(m.charging_time_min)} মিনিট` : "—")}
                />
                <CRow label="টাইপ" picked={picked} get={(m) => m.type ?? "—"} />
                <CRow
                  label="সেফটি"
                  picked={picked}
                  get={(m) =>
                    ((m.specs as Record<string, unknown> | null)?.safety as string) ?? "—"
                  }
                />
                <CRow
                  label="টপ স্পিড"
                  picked={picked}
                  get={(m) => {
                    const s = (m.specs as Record<string, unknown> | null)?.top_speed_kmh;
                    return s ? `${toBnDigits(String(s))} কিমি/ঘণ্টা` : "—";
                  }}
                />
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="container-page pb-20">
        <h2 className="mb-6 text-2xl font-bold">জনপ্রিয় তুলনা</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {popular.map((c) => {
            const valid = c.slugs.filter(
              (s): s is string => !!s && models.some((m) => m.slug === s),
            );
            return (
              <button
                key={c.title}
                type="button"
                onClick={() => setSelected(valid.slice(0, 3))}
                className="group rounded-2xl border border-border bg-card p-6 text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
              >
                <h3 className="font-bold group-hover:text-primary">{c.title}</h3>
                <span className="mt-3 inline-flex text-sm font-semibold text-primary">
                  এই তুলনা লোড করুন →
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/models"
            className="inline-flex rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-accent"
          >
            সকল মডেল ব্রাউজ করুন
          </Link>
        </div>
      </section>
    </>
  );
}

function BrandChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}

function CRow<T extends { id: string }>({
  label,
  picked,
  get,
}: {
  label: string;
  picked: T[];
  get: (m: T) => string;
}) {
  return (
    <tr>
      <td className="bg-muted/40 px-4 py-3 font-medium">{label}</td>
      {picked.map((m) => (
        <td key={m.id} className="px-4 py-3">
          {get(m)}
        </td>
      ))}
    </tr>
  );
}
