import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getModelsByBrand } from "@/lib/models.functions";
import { ModelCard } from "@/components/site/ModelCard";
import { localeLinks, ogMeta, breadcrumbLd } from "@/lib/seo";

const brandQO = (brand: string) =>
  queryOptions({
    queryKey: ["models", "brand", brand.toLowerCase()],
    queryFn: async () => {
      const rows = await getModelsByBrand({ data: { brand } });
      if (!rows || rows.length === 0) throw notFound();
      return rows;
    },
  });

const BRAND_NAMES: Record<string, string> = {
  mg: "MG",
  byd: "BYD",
  hyundai: "Hyundai",
  kia: "Kia",
  tesla: "Tesla",
  zeekr: "Zeekr",
  neta: "Neta",
  wuling: "Wuling",
  deepal: "Deepal",
  dongfeng: "Dongfeng",
};

const BRAND_BLURBS: Record<string, string> = {
  mg: "MG Motor — ব্রিটিশ ঐতিহ্যের চীনা EV ব্র্যান্ড। MG 4, ZS EV, Marvel R ও Cyberster বাংলাদেশে জনপ্রিয়।",
  hyundai:
    "Hyundai — কোরিয়ার শীর্ষ প্রস্তুতকারক। E-GMP প্ল্যাটফর্মে Ioniq 5, Ioniq 6 ও Kona Electric।",
  kia: "Kia — Hyundai Motor Group-এর প্রিমিয়াম শাখা। EV6 ও Niro EV উচ্চ-পারফরম্যান্স মডেল।",
  tesla:
    "Tesla — বিশ্বের শীর্ষ EV ব্র্যান্ড। বাংলাদেশে অনানুষ্ঠানিক আমদানি; Model 3 ও Model Y সবচেয়ে বেশি দেখা যায়।",
  neta: "Neta Auto — চীনের সাশ্রয়ী EV নির্মাতা। শহুরে কম্প্যাক্ট মডেলের জন্য পরিচিত।",
  wuling: "Wuling — GM-SAIC জয়েন্ট ভেঞ্চার। বিশ্বের বেস্ট-সেলিং মাইক্রো EV নির্মাতা।",
  zeekr: "Zeekr — Geely-এর প্রিমিয়াম EV ব্র্যান্ড। ৮০০V আর্কিটেকচার ও প্রিমিয়াম ইন্টিরিয়র।",
  deepal: "Deepal — Changan Automobile-এর নতুন EV সাব-ব্র্যান্ড। প্রিমিয়াম প্রযুক্তি।",
  dongfeng: "Dongfeng — চীনের অন্যতম বড় প্রস্তুতকারক। সাশ্রয়ী পরিবারিক EV।",
};

export const Route = createFileRoute("/brands/$brand")({
  beforeLoad: ({ params }) => {
    if (params.brand.toLowerCase() === "byd") {
      throw redirect({ to: "/byd" });
    }
  },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(brandQO(params.brand)),
  head: ({ params, loaderData }) => {
    const b = params.brand;
    const display = BRAND_NAMES[b.toLowerCase()] ?? (b.charAt(0).toUpperCase() + b.slice(1));
    const t = `${display} Electric Cars in Bangladesh 2026 | Price & Specs — BanglaEV`;
    const d = `${display} EV লাইনআপ বাংলাদেশে — সকল মডেলের দাম, রেঞ্জ, ব্যাটারি ও স্পেসিফিকেশন।`;
    const firstImage = loaderData?.find((m) => m.image_url)?.image_url ?? null;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        ...ogMeta({ title: t, description: d, path: `/brands/${b}`, image: firstImage }),
      ],
      links: localeLinks(`/brands/${b}`),
      scripts: [
        breadcrumbLd([
          { name: "হোম", path: "/" },
          { name: "মডেল", path: "/models" },
          { name: display, path: `/brands/${b}` },
        ]),
      ],
    };
  },
  component: BrandHub,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-3xl font-bold">এই ব্র্যান্ড পাওয়া যায়নি</h1>
      <Link to="/models" className="mt-4 inline-block text-primary underline">
        সব মডেল ব্রাউজ করুন
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

function BrandHub() {
  const { brand } = Route.useParams();
  const { data: models } = useSuspenseQuery(brandQO(brand));
  const display = models[0]?.brand ?? brand;
  const blurb =
    BRAND_BLURBS[brand.toLowerCase()] ??
    `${display} — বাংলাদেশে উপলব্ধ ইলেকট্রিক গাড়ির সম্পূর্ণ তালিকা।`;

  return (
    <>
      <section className="hero-gradient text-white">
        <div className="container-page py-16 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {display} বাংলাদেশ
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl">
            {display} — সকল মডেল ও দাম
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">{blurb}</p>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="mb-8 text-3xl font-bold">{display} লাইনআপ</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => (
            <ModelCard key={m.id} {...m} />
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            to="/models"
            className="inline-flex rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-accent"
          >
            ← সকল ব্র্যান্ড ব্রাউজ করুন
          </Link>
          <Link
            to="/compare"
            className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            অন্য ব্র্যান্ডের সাথে তুলনা →
          </Link>
        </div>
      </section>
    </>
  );
}
