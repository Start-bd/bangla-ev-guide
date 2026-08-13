import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Battery, Gauge, Zap, Shield, Palette, ArrowRight, Award } from "lucide-react";
import { getModelBySlug, getBydModels } from "@/lib/models.functions";
import { formatBDTLakh, formatKm, toBnDigits, formatBnDate } from "@/lib/format";
import { ModelCard } from "@/components/site/ModelCard";
import { localeLinks, ogMeta, breadcrumbLd, absUrl, ogImage } from "@/lib/seo";

const modelQO = (slug: string) =>
  queryOptions({
    queryKey: ["model", slug],
    queryFn: async () => {
      const m = await getModelBySlug({ data: { slug } });
      if (!m) throw notFound();
      return m;
    },
  });
const siblingsQO = queryOptions({ queryKey: ["models", "byd"], queryFn: () => getBydModels() });

export const Route = createFileRoute("/byd/$slug")({
  loader: async ({ context, params }) => {
    const [model] = await Promise.all([
      context.queryClient.ensureQueryData(modelQO(params.slug)),
      context.queryClient.ensureQueryData(siblingsQO),
    ]);
    // Return a slim, serialisable snapshot for head() — full model still comes
    // from the query cache in the component via useSuspenseQuery.
    return {
      image_url: model.image_url ?? null,
      brand: model.brand,
      model: model.model,
      type: model.type ?? null,
      range_km: model.range_km ?? null,
      battery_kwh: model.battery_kwh ?? null,
      zero_to_hundred: model.zero_to_hundred ?? null,
      charging_time_min: model.charging_time_min ?? null,
      price_bdt: model.price_bdt ?? null,
    };
  },

  head: ({ params, loaderData }) => {
    const slug = params.slug;
    const titles: Record<string, { t: string; d: string }> = {
      seal: {
        t: "BYD Seal Price in Bangladesh 2026 — স্পেক্স, রিভিউ | BanglaEV",
        d: "BYD Seal-এর দাম বাংলাদেশে ৳৮৯.৯ লাখ। রেঞ্জ ৫৭০ কিমি, ০-১০০ কিমি/ঘণ্টা ৩.৮ সেকেন্ড। সম্পূর্ণ স্পেক্স ও রিভিউ।",
      },
      "sealion-6": {
        t: "BYD Sealion 6 Price Bangladesh 2026 — Hybrid SUV ৳৬৪.৯ লাখ | BanglaEV",
        d: "BYD Sealion 6 হাইব্রিড SUV-এর দাম ৳৬৪.৯ লাখ। ১,০৯২ কিমি রেঞ্জ, ১৫.৬ ইঞ্চি টাচস্ক্রিন। বাংলাদেশের সবচেয়ে বেশি বিক্রিত প্লাগ-ইন হাইব্রিড।",
      },
      "atto-3": {
        t: "BYD Atto 3 Price Bangladesh 2026 — Electric SUV স্পেক্স | BanglaEV",
        d: "BYD Atto 3 — কম্প্যাক্ট ইলেকট্রিক SUV। Blade Battery, ৫-স্টার Euro NCAP, ৩০ মিনিটে দ্রুত চার্জ।",
      },
      dolphin: {
        t: "BYD Dolphin Price Bangladesh 2026 — Compact EV | BanglaEV",
        d: "BYD Dolphin — কম্প্যাক্ট হ্যাচব্যাক ইলেকট্রিক গাড়ি। শহরের জন্য আদর্শ, সাশ্রয়ী দাম।",
      },
    };
    const meta = titles[slug] ?? { t: `${slug} | BanglaEV`, d: "EV মডেল বিস্তারিত।" };
    const modelName = meta.t.split(" —")[0].split(" Price")[0].trim();
    return {
      meta: [
        { title: meta.t },
        { name: "description", content: meta.d },
        ...ogMeta({
          title: meta.t,
          description: meta.d,
          path: `/byd/${slug}`,
          type: "product",
          image: loaderData?.image_url,
          imageAlt: `${modelName} — BanglaEV`,
        }),
      ],
      links: localeLinks(`/byd/${slug}`),
      scripts: [
        breadcrumbLd([
          { name: "হোম", path: "/" },
          { name: "BYD", path: "/byd" },
          { name: modelName, path: `/byd/${slug}` },
        ]),
      ],
    };
  },
  component: ModelPage,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-3xl font-bold">মডেল পাওয়া যায়নি</h1>
      <Link to="/byd" className="mt-4 inline-block text-primary underline">BYD হাবে ফিরে যান</Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="container-page py-24 text-center">
      <p>লোড করতে সমস্যা হয়েছে।</p>
      <button onClick={reset} className="mt-3 rounded-full bg-primary px-4 py-2 text-primary-foreground">আবার চেষ্টা</button>
    </div>
  ),
});

function ModelPage() {
  const { slug } = Route.useParams();
  const { data: m } = useSuspenseQuery(modelQO(slug));
  const { data: siblings } = useSuspenseQuery(siblingsQO);

  const specs = (m.specs ?? {}) as Record<string, unknown>;
  const others = siblings.filter((s) => s.slug !== slug).slice(0, 3);

  // Loan EMI (simple): P*r*(1+r)^n / ((1+r)^n - 1), 6% annual, 5 years
  const emi = m.price_bdt
    ? (() => {
        const P = m.price_bdt * 0.8; // 20% downpayment
        const r = 0.06 / 12;
        const n = 60;
        return Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
      })()
    : null;

  return (
    <>
      {/* Car (Vehicle) JSON-LD — extends Product for rich result eligibility */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Car",
            additionalType: "https://schema.org/Product",
            name: `${m.brand} ${m.model}`,
            brand: { "@type": "Brand", name: m.brand },
            model: m.model,
            vehicleModelDate: m.last_price_update ?? undefined,
            bodyType: m.type ?? undefined,
            fuelType: "Electric",
            description: `${m.brand} ${m.model} — ${m.type ?? "EV"}${m.range_km ? ` with ${m.range_km} km range` : ""}.`,
            image: m.image_url ? ogImage(m.image_url) : undefined,
            url: absUrl(`/byd/${m.slug}`),
            ...(m.battery_kwh
              ? {
                  vehicleEngine: {
                    "@type": "EngineSpecification",
                    fuelType: "Electric",
                    engineType: "Electric motor",
                  },
                  fuelCapacity: {
                    "@type": "QuantitativeValue",
                    value: m.battery_kwh,
                    unitCode: "KWH",
                  },
                }
              : {}),
            ...(m.range_km
              ? {
                  mileageFromOdometer: {
                    "@type": "QuantitativeValue",
                    value: m.range_km,
                    unitCode: "KMT",
                  },
                }
              : {}),
            ...(m.zero_to_hundred
              ? {
                  accelerationTime: {
                    "@type": "QuantitativeValue",
                    value: m.zero_to_hundred,
                    unitCode: "SEC",
                  },
                }
              : {}),
            ...(m.price_bdt
              ? {
                  offers: {
                    "@type": "Offer",
                    priceCurrency: "BDT",
                    price: m.price_bdt,
                    availability: "https://schema.org/InStock",
                    url: absUrl(`/byd/${m.slug}`),
                    ...(m.last_price_update ? { priceValidUntil: m.last_price_update } : {}),
                  },
                }
              : {}),
          }),
        }}
      />

      <section className="hero-gradient text-white">
        <div className="container-page grid items-center gap-10 py-16 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">{m.brand} · {m.type}</p>
            <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">{m.brand} {m.model}</h1>
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">{formatBDTLakh(m.price_bdt)}</span>
              <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur">{formatKm(m.range_km)} রেঞ্জ</span>
              {m.zero_to_hundred && (
                <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur">
                  ০-১০০: {toBnDigits(String(m.zero_to_hundred))}s
                </span>
              )}
            </div>
            {m.last_price_update && (
              <p className="mt-3 text-xs text-white/70">সর্বশেষ আপডেট: {formatBnDate(m.last_price_update)}</p>
            )}
            {slug === "sealion-6" && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-yellow-950">
                <Award className="h-4 w-4" /> বাংলাদেশের #১ প্লাগ-ইন হাইব্রিড
              </div>
            )}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/byd" hash="showrooms" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground">
                শোরুমে যোগাযোগ করুন <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/compare" className="inline-flex rounded-full border border-white/30 bg-white/5 px-5 py-3 font-semibold backdrop-blur hover:bg-white/15">
                অন্য গাড়ির সাথে তুলনা
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-3xl bg-white/5 backdrop-blur">
            <div className="absolute inset-0 grid place-items-center">
              <Zap className="h-40 w-40 text-primary/60 animate-bolt" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-10 md:grid-cols-[2fr,1fr]">
          <div>
            <h2 className="mb-6 text-2xl font-bold">সম্পূর্ণ স্পেসিফিকেশন</h2>
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  <SpecRow label="ব্যাটারি" value={m.battery_kwh ? `${toBnDigits(String(m.battery_kwh))} kWh BYD Blade` : "—"} />
                  <SpecRow label="রেঞ্জ" value={formatKm(m.range_km)} />
                  <SpecRow label="০-১০০ কিমি/ঘণ্টা" value={m.zero_to_hundred ? `${toBnDigits(String(m.zero_to_hundred))} সেকেন্ড` : "—"} />
                  <SpecRow label="টপ স্পিড" value={specs.top_speed_kmh ? `${toBnDigits(String(specs.top_speed_kmh))} কিমি/ঘণ্টা` : "—"} />
                  <SpecRow label="প্ল্যাটফর্ম" value={(specs.platform as string) ?? "—"} />
                  <SpecRow label="সেফটি" value={(specs.safety as string) ?? "—"} />
                  <SpecRow label="এয়ারব্যাগ" value={specs.airbags ? toBnDigits(String(specs.airbags)) : "—"} />
                  <SpecRow label="দ্রুত চার্জ" value={m.charging_time_min ? `৩০%→৮০% মাত্র ${toBnDigits(m.charging_time_min)} মিনিটে` : "—"} />
                </tbody>
              </table>
            </div>

            {(specs.variants as Array<{ name: string; range_km: number; zero_to_hundred: number }> | undefined)?.length && (
              <>
                <h3 className="mt-10 mb-4 text-xl font-bold">ভ্যারিয়েন্ট</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(specs.variants as Array<{ name: string; range_km: number; zero_to_hundred: number }>).map((v) => (
                    <div key={v.name} className="rounded-2xl border border-border bg-card p-5">
                      <h4 className="font-bold">{v.name}</h4>
                      <p className="mt-2 text-sm text-muted-foreground">রেঞ্জ: {toBnDigits(v.range_km)} কিমি</p>
                      <p className="text-sm text-muted-foreground">০-১০০: {toBnDigits(String(v.zero_to_hundred))} সেকেন্ড</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {Array.isArray(specs.colors) && (
              <>
                <h3 className="mt-10 mb-4 flex items-center gap-2 text-xl font-bold">
                  <Palette className="h-5 w-5 text-primary" /> উপলব্ধ রঙ
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(specs.colors as string[]).map((c) => (
                    <span key={c} className="rounded-full border border-border px-3 py-1 text-sm">{c}</span>
                  ))}
                </div>
              </>
            )}

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {m.pros && m.pros.length > 0 && (
                <div className="rounded-2xl border border-primary/30 bg-accent p-5">
                  <h4 className="mb-2 font-bold text-primary">সুবিধা</h4>
                  <ul className="space-y-1 text-sm">
                    {m.pros.map((p) => <li key={p}>✓ {p}</li>)}
                  </ul>
                </div>
              )}
              {m.cons && m.cons.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h4 className="mb-2 font-bold">অসুবিধা</h4>
                  <ul className="space-y-1 text-sm">
                    {m.cons.map((c) => <li key={c}>✗ {c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            {emi && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-bold">মাসিক EMI (আনুমানিক)</h3>
                <p className="mt-2 text-3xl font-extrabold text-primary">৳{toBnDigits(emi.toLocaleString("en-US"))}</p>
                <p className="mt-1 text-xs text-muted-foreground">২০% ডাউনপেমেন্ট, ৬% সুদ, ৫ বছর মেয়াদ</p>
              </div>
            )}
            <div className="rounded-2xl bg-[var(--color-navy)] p-6 text-white">
              <Shield className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-bold">নিরাপত্তা</h3>
              <p className="mt-2 text-sm opacity-90">BYD Blade Battery, ৫-স্টার Euro NCAP, ADAS — শিল্পের সর্বোচ্চ মান।</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <Battery className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-bold">চার্জিং</h3>
              <p className="mt-2 text-sm text-muted-foreground">হোম চার্জিং সবচেয়ে সাশ্রয়ী। দেশে ১৪+ পাবলিক স্টেশন।</p>
              <Link to="/charging" className="mt-3 inline-flex text-sm font-semibold text-primary">গাইড দেখুন →</Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="container-page">
          <h2 className="mb-8 text-2xl font-bold">অন্য BYD মডেল</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => <ModelCard key={o.id} {...o} />)}
          </div>
        </div>
      </section>
    </>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="bg-muted/40 px-4 py-3 font-medium">{label}</td>
      <td className="px-4 py-3">{value}</td>
    </tr>
  );
}
