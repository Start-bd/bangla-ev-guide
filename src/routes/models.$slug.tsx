import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Battery, Gauge, Zap, Shield, ArrowRight } from "lucide-react";
import { getModelBySlug, getModelsByBrand } from "@/lib/models.functions";
import { formatBDTLakh, formatKm, toBnDigits } from "@/lib/format";
import { ModelCard } from "@/components/site/ModelCard";
import { localeLinks, ogMeta } from "@/lib/seo";

const modelQO = (slug: string) =>
  queryOptions({
    queryKey: ["model", slug],
    queryFn: async () => {
      const m = await getModelBySlug({ data: { slug } });
      if (!m) throw notFound();
      return m;
    },
  });

const siblingsQO = (brand: string) =>
  queryOptions({
    queryKey: ["models", "brand", brand.toLowerCase()],
    queryFn: () => getModelsByBrand({ data: { brand } }),
  });

export const Route = createFileRoute("/models/$slug")({
  beforeLoad: async ({ params, context }) => {
    // BYD models have their own dedicated hub URL — send /models/<byd-slug> there.
    const m = await context.queryClient.ensureQueryData(modelQO(params.slug));
    if (m.brand.toLowerCase() === "byd") {
      throw redirect({ to: "/byd/$slug", params: { slug: m.slug } });
    }
    await context.queryClient.ensureQueryData(siblingsQO(m.brand));
    return { brand: m.brand };
  },
  loader: async ({ params, context }) => {
    const m = await context.queryClient.ensureQueryData(modelQO(params.slug));
    return {
      brand: m.brand,
      model: m.model,
      image_url: m.image_url ?? null,
    };
  },
  head: ({ params, loaderData }) => {
    const slug = params.slug;
    const label = loaderData
      ? `${loaderData.brand} ${loaderData.model}`
      : slug.replace(/-/g, " ");
    const t = `${label} — Price in Bangladesh 2026 | BanglaEV`;
    const d = `${label} বাংলাদেশে — রেঞ্জ, ব্যাটারি, দাম ও সম্পূর্ণ স্পেসিফিকেশন।`;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        ...ogMeta({
          title: t,
          description: d,
          path: `/models/${slug}`,
          type: "product",
          image: loaderData?.image_url,
        }),
      ],
      links: localeLinks(`/models/${slug}`),
    };
  },
  component: ModelDetail,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-3xl font-bold">মডেল পাওয়া যায়নি</h1>
      <Link to="/models" className="mt-4 inline-block text-primary underline">
        সকল মডেল দেখুন
      </Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="container-page py-24 text-center">
      <p>লোড করতে সমস্যা হয়েছে।</p>
      <button
        onClick={reset}
        className="mt-3 rounded-full bg-primary px-4 py-2 text-primary-foreground"
      >
        আবার চেষ্টা
      </button>
    </div>
  ),
});

function ModelDetail() {
  const { slug } = Route.useParams();
  const { data: m } = useSuspenseQuery(modelQO(slug));
  const { data: siblings } = useSuspenseQuery(siblingsQO(m.brand));

  const specs = (m.specs ?? {}) as Record<string, unknown>;
  const others = siblings.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: `${m.brand} ${m.model}`,
            brand: { "@type": "Brand", name: m.brand },
            description: `${m.brand} ${m.model} — ${m.type ?? "EV"} with ${m.range_km ?? "—"} km range.`,
            ...(m.price_bdt
              ? {
                  offers: {
                    "@type": "Offer",
                    priceCurrency: "BDT",
                    price: m.price_bdt,
                    availability: "https://schema.org/InStock",
                    url: `https://bangla-ev-guide.lovable.app/models/${m.slug}`,
                  },
                }
              : {}),
          }),
        }}
      />

      <section className="hero-gradient text-white">
        <div className="container-page grid items-center gap-10 py-16 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              {m.brand} · {m.type ?? "EV"}
            </p>
            <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">
              {m.brand} {m.model}
            </h1>
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
                {formatBDTLakh(m.price_bdt)}
              </span>
              <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur">
                {formatKm(m.range_km)} রেঞ্জ
              </span>
              {m.zero_to_hundred && (
                <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur">
                  ০-১০০: {toBnDigits(String(m.zero_to_hundred))}s
                </span>
              )}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/brands/$brand"
                params={{ brand: m.brand.toLowerCase() }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground"
              >
                {m.brand} মডেল দেখুন <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/compare"
                className="inline-flex rounded-full border border-white/30 bg-white/5 px-5 py-3 font-semibold backdrop-blur hover:bg-white/15"
              >
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
                  <SpecRow
                    label="ব্যাটারি"
                    value={m.battery_kwh ? `${toBnDigits(String(m.battery_kwh))} kWh` : "—"}
                  />
                  <SpecRow label="রেঞ্জ" value={formatKm(m.range_km)} />
                  <SpecRow
                    label="০-১০০ কিমি/ঘণ্টা"
                    value={
                      m.zero_to_hundred
                        ? `${toBnDigits(String(m.zero_to_hundred))} সেকেন্ড`
                        : "—"
                    }
                  />
                  <SpecRow
                    label="টপ স্পিড"
                    value={
                      specs.top_speed_kmh
                        ? `${toBnDigits(String(specs.top_speed_kmh))} কিমি/ঘণ্টা`
                        : "—"
                    }
                  />
                  <SpecRow label="প্ল্যাটফর্ম" value={(specs.platform as string) ?? "—"} />
                  <SpecRow label="সেফটি" value={(specs.safety as string) ?? "—"} />
                  <SpecRow
                    label="এয়ারব্যাগ"
                    value={specs.airbags ? toBnDigits(String(specs.airbags)) : "—"}
                  />
                  <SpecRow
                    label="দ্রুত চার্জ"
                    value={
                      m.charging_time_min
                        ? `৩০%→৮০% মাত্র ${toBnDigits(m.charging_time_min)} মিনিটে`
                        : "—"
                    }
                  />
                </tbody>
              </table>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {m.pros && m.pros.length > 0 && (
                <div className="rounded-2xl border border-primary/30 bg-accent p-5">
                  <h4 className="mb-2 font-bold text-primary">সুবিধা</h4>
                  <ul className="space-y-1 text-sm">
                    {m.pros.map((p) => (
                      <li key={p}>✓ {p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {m.cons && m.cons.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h4 className="mb-2 font-bold">অসুবিধা</h4>
                  <ul className="space-y-1 text-sm">
                    {m.cons.map((c) => (
                      <li key={c}>✗ {c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-[var(--color-navy)] p-6 text-white">
              <Shield className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-bold">নিরাপত্তা ও ওয়ারেন্টি</h3>
              <p className="mt-2 text-sm opacity-90">
                {(specs.safety as string) ?? "সেফটি রেটিং ব্র্যান্ড থেকে যাচাই করুন।"} বাংলাদেশে
                অনানুষ্ঠানিক আমদানির ক্ষেত্রে ওয়ারেন্টি সীমিত হতে পারে।
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <Battery className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-bold">চার্জিং</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                হোম চার্জিং সবচেয়ে সাশ্রয়ী। দেশে ১৪+ পাবলিক DC স্টেশন সমর্থিত।
              </p>
              <Link to="/charging" className="mt-3 inline-flex text-sm font-semibold text-primary">
                চার্জিং গাইড →
              </Link>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <Gauge className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-bold">চলার খরচ</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                বাংলাদেশে EV-তে প্রতি কিমি খরচ ~৳৩; পেট্রোলের চেয়ে ৫ গুণ সস্তা।
              </p>
              <Link
                to="/calculator"
                className="mt-3 inline-flex text-sm font-semibold text-primary"
              >
                সাশ্রয় হিসাব →
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section className="bg-muted/40 py-16">
          <div className="container-page">
            <h2 className="mb-8 text-2xl font-bold">অন্য {m.brand} মডেল</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => (
                <ModelCard key={o.id} {...o} />
              ))}
            </div>
          </div>
        </section>
      )}
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
