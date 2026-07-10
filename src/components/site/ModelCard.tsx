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
import zeekrXSrc from "@/assets/models/zeekr-x.webp?w=480;800;1280&format=webp&as=srcset";
import deepalS07Src from "@/assets/models/deepal-s07.webp?w=480;800;1280&format=webp&as=srcset";
import dongfengNanoBoxSrc from "@/assets/models/dongfeng-nano-box.webp?w=480;800;1280&format=webp&as=srcset";
import sealImg from "@/assets/models/seal.webp?w=800&format=webp";
import sealion6Img from "@/assets/models/sealion-6.webp?w=800&format=webp";
import atto3Img from "@/assets/models/atto-3.webp?w=800&format=webp";
import dolphinImg from "@/assets/models/dolphin.webp?w=800&format=webp";
import mg4Img from "@/assets/models/mg-4.webp?w=800&format=webp";
import ioniq5Img from "@/assets/models/ioniq-5.webp?w=800&format=webp";
import zeekrXImg from "@/assets/models/zeekr-x.webp?w=800&format=webp";
import deepalS07Img from "@/assets/models/deepal-s07.webp?w=800&format=webp";
import dongfengNanoBoxImg from "@/assets/models/dongfeng-nano-box.webp?w=800&format=webp";

export const MODEL_IMAGES: Record<string, { src: string; srcSet: string }> = {
  seal: { src: sealImg, srcSet: sealSrc },
  "sealion-6": { src: sealion6Img, srcSet: sealion6Src },
  "atto-3": { src: atto3Img, srcSet: atto3Src },
  dolphin: { src: dolphinImg, srcSet: dolphinSrc },
  "mg-4": { src: mg4Img, srcSet: mg4Src },
  "ioniq-5": { src: ioniq5Img, srcSet: ioniq5Src },
  "hyundai-ioniq-5": { src: ioniq5Img, srcSet: ioniq5Src },
  "zeekr-x": { src: zeekrXImg, srcSet: zeekrXSrc },
  "deepal-s07": { src: deepalS07Img, srcSet: deepalS07Src },
  "dongfeng-nano-box": { src: dongfengNanoBoxImg, srcSet: dongfengNanoBoxSrc },
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


const BRAND_TINTS: Record<string, string> = {
  BYD: "from-[#0b3d91] to-[#1a1a2e]",
  MG: "from-[#c8102e] to-[#3a0a12]",
  Hyundai: "from-[#002c5f] to-[#0a1a33]",
  Kia: "from-[#05141f] to-[#1a2833]",
  Tesla: "from-[#111111] to-[#3a0000]",
  Neta: "from-[#0e7c66] to-[#0a1a33]",
  Wuling: "from-[#1e40af] to-[#0b1f3a]",
  Zeekr: "from-[#1e293b] to-[#0f172a]",
  Deepal: "from-[#0f3d2e] to-[#0a1a1f]",
  Dongfeng: "from-[#7c2d12] to-[#1a0a05]",
};

interface ModelCardProps {
  brand: string;
  model: string;
  slug: string;
  type: string | null;
  price_bdt: number | null;
  range_km: number | null;
  battery_kwh: number | null;
  zero_to_hundred: number | null;
  hrefBase?: string;
}

export function ModelCard(p: ModelCardProps) {
  const isByd = p.brand.toLowerCase() === "byd";
  const img = MODEL_IMAGES[p.slug];
  if (!img) warnFallback(p.slug, p.brand, p.model);
  const tint = BRAND_TINTS[p.brand] ?? "from-[var(--color-navy)] to-[oklch(0.3_0.05_275)]";

  const Inner = (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${tint}`}>
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
            <div className="text-center">
              <Zap className="mx-auto h-12 w-12 text-white/25" strokeWidth={1.5} />
              <p className="mt-3 font-display text-2xl font-black tracking-tight text-white/85">
                {p.brand}
              </p>
              <p className="text-sm font-medium text-white/60">{p.model}</p>
            </div>
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

  // BYD keeps its dedicated hub URL (SEO); other brands route through /models/$slug.
  return isByd ? (
    <Link to="/byd/$slug" params={{ slug: p.slug }} className="block h-full">
      {Inner}
    </Link>
  ) : (
    <Link to="/models/$slug" params={{ slug: p.slug }} className="block h-full">
      {Inner}
    </Link>
  );
}
