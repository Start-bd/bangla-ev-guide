import { createFileRoute } from "@tanstack/react-router";
import { ogMeta, localeLinks, carLd } from "@/lib/seo";

export const Route = createFileRoute("/byd/$slug")({
  loader: async ({ params, context }) => {
    // Minimal loader: attempt to fetch model data from the same API used elsewhere.
    // Keep this optional — pages render even if loader fails.
    try {
      const res = await fetch(`${process.env.API_BASE || ""}/api/models/${params.slug}`);
      if (!res.ok) return { model: null };
      const model = await res.json();
      return { model };
    } catch (e) {
      return { model: null };
    }
  },
  head: ({ params, loaderData }) => {
    const model = loaderData?.model ?? null;
    const title = model ? `${model.brand} ${model.model} — BYD | BanglaEV` : `BYD ${params.slug} — Coming soon`;
    const desc = model
      ? `পূর্বদর্শী ডিটেইল: ${model.brand} ${model.model} — দাম ও স্পেসিফিকেশন ।` 
      : "এই পৃষ্ঠাটি অস্থায়ী। বিস্তারিত শীঘ্রই যুক্ত করা হবে।";

    const scripts = model
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify(
              carLd(
                {
                  brand: model.brand,
                  model: model.model,
                  slug: model.slug,
                  type: model.type,
                  image_url: model.image_url,
                  range_km: model.range_km,
                  battery_kwh: model.battery_kwh,
                  zero_to_hundred: model.zero_to_hundred,
                  price_bdt: model.price_bdt,
                  model_year: model.model_year,
                  price_valid_until: model.price_valid_until,
                },
                `/byd/${params.slug}`,
              ),
            ),
          },
        ]
      : [];

    return {
      meta: [
        { title },
        { name: "description", content: desc },
        ...ogMeta({ title, description: desc, path: `/byd/${params.slug}`, image: model?.image_url ?? null }),
      ],
      links: localeLinks(`/byd/${params.slug}`),
      scripts,
    };
  },
  component: function BYDModelRoute() {
    return (
      <div className="container-page py-12">
        <h1 className="text-3xl font-bold">BYD model — পৃষ্ঠা শীঘ্রই আসছে</h1>
        <p className="mt-4">এই পৃষ্ঠায় শীঘ্রই বিস্তারিত স্পেস, দাম ও ছবি যোগ করা হবে।</p>
        <hr className="my-6" />
        <h2 className="text-2xl font-semibold">Quick English</h2>
        <p className="mt-2">This is a placeholder page for BYD model {`/byd/${":slug"}`}. Full content will be published soon.</p>
      </div>
    );
  },
});
