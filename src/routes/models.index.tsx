import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getAllModels } from "@/lib/models.functions";
import { ModelCard } from "@/components/site/ModelCard";
import { localeLinks, ogMeta, breadcrumbLd } from "@/lib/seo";
import modelsHero from "@/assets/pages/models-hero.jpg";

const allQO = queryOptions({ queryKey: ["models", "all"], queryFn: () => getAllModels() });

const MODELS_TITLE = "Electric Cars in Bangladesh 2026 — Price & Specs | BanglaEV";
const MODELS_DESC = "বাংলাদেশে উপলব্ধ সকল ইলেকট্রিক গাড়ির তালিকা: BYD, MG, Hyundai, Kia, Tesla, Neta, Zeekr, Deepal — দাম, রেঞ্জ ও স্পেসিফিকেশন এক জায়গায়।";

export const Route = createFileRoute("/models/")({
  head: () => ({
    meta: [
      { title: MODELS_TITLE },
      { name: "description", content: MODELS_DESC },
      ...ogMeta({ title: MODELS_TITLE, description: MODELS_DESC, path: "/models" }),
    ],
    links: localeLinks("/models"),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(allQO),
  component: ModelsBrowse,
});

function ModelsBrowse() {
  const { data: models } = useSuspenseQuery(allQO);
  const [brand, setBrand] = useState<string>("all");
  const [type, setType] = useState<string>("all");

  const brands = useMemo(
    () => Array.from(new Set(models.map((m) => m.brand))).sort(),
    [models],
  );
  const types = useMemo(
    () => Array.from(new Set(models.map((m) => m.type).filter(Boolean))) as string[],
    [models],
  );

  const filtered = models.filter(
    (m) =>
      (brand === "all" || m.brand === brand) && (type === "all" || m.type === type),
  );

  return (
    <>
      <section className="hero-gradient text-white">
        <div className="container-page py-16 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            EV ব্রাউজ
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl">
            বাংলাদেশের সকল ইলেকট্রিক গাড়ি
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            BYD থেকে Tesla — বাংলাদেশে উপলব্ধ ও আসন্ন সকল EV-এর দাম, রেঞ্জ ও স্পেসিফিকেশন।
            ব্র্যান্ড বা টাইপ অনুযায়ী ফিল্টার করুন।
          </p>
        </div>
      </section>

      <section className="container-page pt-10">
        <img
          src={modelsHero}
          alt="বাংলাদেশে উপলব্ধ ইলেকট্রিক গাড়ির লাইনআপ"
          width={1600}
          height={700}
          loading="lazy"
          decoding="async"
          className="w-full rounded-2xl object-cover shadow-md"
        />
      </section>

      <section className="container-page py-10">
        <h2 className="mb-6 text-2xl font-bold md:text-3xl">সকল ইলেকট্রিক গাড়ি ব্রাউজ করুন</h2>
        <div className="mb-6 flex flex-wrap gap-2">
          <FilterButton active={brand === "all"} onClick={() => setBrand("all")}>
            সব ব্র্যান্ড
          </FilterButton>
          {brands.map((b) => (
            <FilterButton key={b} active={brand === b} onClick={() => setBrand(b)}>
              {b}
            </FilterButton>
          ))}
        </div>
        <div className="mb-8 flex flex-wrap gap-2">
          <FilterButton active={type === "all"} onClick={() => setType("all")}>
            সব টাইপ
          </FilterButton>
          {types.map((t) => (
            <FilterButton key={t} active={type === t} onClick={() => setType(t)}>
              {t}
            </FilterButton>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-accent p-8 text-center">
            <p className="font-semibold">এই ফিল্টারের জন্য কোনো গাড়ি নেই।</p>
            <button
              className="mt-3 text-sm font-semibold text-primary underline"
              onClick={() => {
                setBrand("all");
                setType("all");
              }}
            >
              ফিল্টার রিসেট করুন
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <ModelCard key={m.id} {...m} />
            ))}
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <strong className="text-foreground">নোট:</strong> কিছু মডেল বাংলাদেশে
          অনানুষ্ঠানিকভাবে আমদানি হয়। অফিশিয়াল দাম না থাকলে "—" দেখানো হয়েছে।
          সঠিক দাম ও উপলব্ধতা যাচাই করতে সংশ্লিষ্ট ব্র্যান্ডের{" "}
          <Link to="/about" className="text-primary underline">
            পরিবেশক
          </Link>{" "}
          সাথে যোগাযোগ করুন।
        </div>
      </section>
    </>
  );
}

function FilterButton({
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
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}
