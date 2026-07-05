import { Link } from "@tanstack/react-router";
import { Battery, Gauge, Zap } from "lucide-react";
import { formatBDTLakh, formatKm, toBnDigits } from "@/lib/format";
import { ssrLog } from "@/lib/ssr-logger";
import sealSrc from "@/assets/models/seal.webp?w=480;800;1280&format=webp&as=srcset";
import sealion6Src from "@/assets/models/sealion-6.webp?w=480;800;1280&format=webp&as=srcset";
import atto3Src from "@/assets/models/atto-3.webp?w=480;800;1280&format=webp&as=srcset";
import dolphinSrc from "@/assets/models/dolphin.webp?w=480;800;1280&format=webp&as=srcset";
import mg4Src from "@/assets/models/mg-4.webp?w=480;800;1280&format=webp&as=srcset";
import ioniq5Src from "@/assets/models/ioniq-5.webp?w=480;800;1280&format=webp&as=srcset";
import sealImg from "@/assets/models/seal.webp?w=800&format=webp";
import sealion6Img from "@/assets/models/sealion-6.webp?w=800&format=webp";
import atto3Img from "@/assets/models/atto-3.webp?w=800&format=webp";
import dolphinImg from "@/assets/models/dolphin.webp?w=800&format=webp";
import mg4Img from "@/assets/models/mg-4.webp?w=800&format=webp";
import ioniq5Img from "@/assets/models/ioniq-5.webp?w=800&format=webp";

const MODEL_IMAGES: Record<string, { src: string; srcSet: string }> = {
  seal: { src: sealImg, srcSet: sealSrc },
  "sealion-6": { src: sealion6Img, srcSet: sealion6Src },
  "atto-3": { src: atto3Img, srcSet: atto3Src },
  dolphin: { src: dolphinImg, srcSet: dolphinSrc },
  "mg-4": { src: mg4Img, srcSet: mg4Src },
  "ioniq-5": { src: ioniq5Img, srcSet: ioniq5Src },
  "hyundai-ioniq-5": { src: ioniq5Img, srcSet: ioniq5Src },
};

const WIDTH_RE = /\s\d+w(?:,|$)/;
const EXPECTED_WIDTHS = [480, 800, 1280];

function assertValidMapping(slug: string, entry: { src: string; srcSet: string }): boolean {
  const missingWidths = EXPECTED_WIDTHS.filter((w) => !entry.srcSet.includes(`${w}w`));
  if (!entry.src || !entry.srcSet || !WIDTH_RE.test(entry.srcSet) || missingWidths.length > 0) {
    ssrLog.error(
      { scope: "model-card", event: "invalid_srcset_mapping", slug, missingWidths },
      new Error(`ModelCard mapping for slug "${slug}" is missing srcset widths`),
    );
    return false;
  }
  return true;
}

const warnedSlugs = new Set<string>();
function warnFallback(slug: string, brand: string, model: string) {
  if (warnedSlugs.has(slug)) return;
  warnedSlugs.add(slug);
  ssrLog.error(
    { scope: "model-card", event: "fallback_image_used", slug, brand, model },
    new Error(`ModelCard has no srcset image for slug "${slug}" — falling back to placeholder icon`),
  );
}

// Validate every registered mapping once at module load.
for (const [slug, entry] of Object.entries(MODEL_IMAGES)) {
  assertValidMapping(slug, entry);
}


interface ModelCardProps {
  brand: string;
  model: string;
  slug: string;
  type: string | null;
  price_bdt: number | null;
  range_km: number | null;
  battery_kwh: number | null;
  zero_to_hundred: number | null;
  hrefBase?: string; // default "/byd/" for BYD; else compose by brand
}

export function ModelCard(p: ModelCardProps) {
  const isByd = p.brand.toLowerCase() === "byd";
  const to = isByd ? "/byd/$slug" : null;

  const img = MODEL_IMAGES[p.slug];
  const Inner = (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[var(--color-navy)] to-[oklch(0.3_0.05_275)]">
        {img ? (
          <img
            src={img.src}
            srcSet={img.srcSet}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            alt={`${p.brand} ${p.model}`}
            width={1280}
            height={800}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Zap className="h-16 w-16 text-white/15" />
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-primary/95 px-3 py-1 text-xs font-semibold text-primary-foreground">
          {p.type ?? "EV"}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-foreground">
          {p.brand}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="font-display text-xl font-bold leading-tight">
            {p.brand} {p.model}
          </h3>
          <p className="mt-1 text-lg font-semibold text-primary">{formatBDTLakh(p.price_bdt)}</p>
        </div>

        <ul className="grid grid-cols-3 gap-2 text-xs">
          <li className="rounded-lg bg-muted px-2 py-2 text-center">
            <Battery className="mx-auto mb-1 h-4 w-4 text-primary" />
            <span className="block font-semibold">{formatKm(p.range_km)}</span>
            <span className="text-muted-foreground">রেঞ্জ</span>
          </li>
          <li className="rounded-lg bg-muted px-2 py-2 text-center">
            <Zap className="mx-auto mb-1 h-4 w-4 text-primary" />
            <span className="block font-semibold">{p.battery_kwh ? `${toBnDigits(String(p.battery_kwh))} kWh` : "—"}</span>
            <span className="text-muted-foreground">ব্যাটারি</span>
          </li>
          <li className="rounded-lg bg-muted px-2 py-2 text-center">
            <Gauge className="mx-auto mb-1 h-4 w-4 text-primary" />
            <span className="block font-semibold">{p.zero_to_hundred ? `${toBnDigits(String(p.zero_to_hundred))}s` : "—"}</span>
            <span className="text-muted-foreground">০-১০০</span>
          </li>
        </ul>

        <div className="mt-auto">
          <span className="inline-flex w-full items-center justify-center rounded-lg bg-foreground/5 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            বিস্তারিত দেখুন →
          </span>
        </div>
      </div>
    </div>
  );

  return to ? (
    <Link to={to} params={{ slug: p.slug }} className="block h-full">
      {Inner}
    </Link>
  ) : (
    <div className="block h-full opacity-90">{Inner}</div>
  );
}
