import { createFileRoute } from "@tanstack/react-router";
import { CostCalculator } from "@/components/site/CostCalculator";
import { localeLinks, ogMeta } from "@/lib/seo";
import calcHero from "@/assets/pages/calculator-hero.jpg";

const CALC_TITLE = "EV vs Petrol Cost Calculator Bangladesh | BanglaEV";
const CALC_DESC = "ইলেকট্রিক গাড়ি বনাম পেট্রোল — আপনার দৈনিক ড্রাইভিং দিয়ে মাসিক ও বার্ষিক সাশ্রয় হিসাব করুন।";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: CALC_TITLE },
      { name: "description", content: CALC_DESC },
      ...ogMeta({ title: CALC_TITLE, description: CALC_DESC, path: "/calculator" }),
    ],
    links: localeLinks("/calculator"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "BanglaEV Cost Calculator",
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "BDT" },
        }),
      },
    ],
  }),
  component: CalculatorPage,
});

function CalculatorPage() {
  return (
    <>
      <section className="hero-gradient text-white">
        <div className="container-page py-16">
          <h1 className="text-4xl font-extrabold md:text-5xl">EV বনাম পেট্রোল — মাসিক খরচ হিসাব করুন</h1>
          <p className="mt-3 max-w-2xl text-white/80">
            নিচের স্লাইডার ব্যবহার করে আপনার ড্রাইভিং প্যাটার্ন অনুযায়ী সাশ্রয় হিসাব করুন।
          </p>
        </div>
      </section>
      <section className="container-page pt-10">
        <img
          src={calcHero}
          alt="EV বনাম পেট্রোল খরচ তুলনা"
          width={1600}
          height={700}
          loading="lazy"
          decoding="async"
          className="w-full rounded-2xl object-cover shadow-md"
        />
      </section>
      <section className="container-page py-16">
        <CostCalculator />
        <div className="mt-10 grid gap-6 rounded-2xl bg-accent p-8 md:grid-cols-3">
          <Stat n="৭০-৮০%" l="জ্বালানি খরচ সাশ্রয়" />
          <Stat n="৫০%" l="রক্ষণাবেক্ষণে সাশ্রয়" />
          <Stat n="৭৭%" l="কম কার্বন নিঃসরণ" />
        </div>
      </section>
    </>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <p className="text-3xl font-extrabold text-primary">{n}</p>
      <p className="mt-1 text-sm">{l}</p>
    </div>
  );
}
