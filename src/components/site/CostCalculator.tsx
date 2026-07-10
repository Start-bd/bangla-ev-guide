import { useMemo, useState } from "react";
import { Calculator, TrendingDown, Fuel, Zap } from "lucide-react";
import { toBnDigits } from "@/lib/format";

interface Props {
  compact?: boolean;
}

export function CostCalculator({ compact = false }: Props) {
  const [km, setKm] = useState(60);
  const [petrolPrice, setPetrolPrice] = useState(125);
  const [elecRate, setElecRate] = useState(9);
  const [carType, setCarType] = useState<"ICE" | "HEV" | "BEV">("ICE");

  // Assumptions: ICE 12 km/L, HEV 22 km/L, BEV 6 km/kWh
  const monthly = useMemo(() => {
    const monthlyKm = km * 30;
    const iceCost = (monthlyKm / 12) * petrolPrice;
    const hevCost = (monthlyKm / 22) * petrolPrice;
    const bevCost = (monthlyKm / 6) * elecRate;
    const cur = carType === "ICE" ? iceCost : carType === "HEV" ? hevCost : bevCost;
    return {
      iceCost, hevCost, bevCost, cur,
      savingsVsIce: iceCost - bevCost,
      annual: (iceCost - bevCost) * 12,
      fiveYear: (iceCost - bevCost) * 60,
    };
  }, [km, petrolPrice, elecRate, carType]);

  const fmt = (n: number) => "৳" + toBnDigits(Math.round(n).toLocaleString("en-US"));

  return (
    <div className={`rounded-2xl border border-border bg-card p-6 shadow-sm ${compact ? "" : "md:p-8"}`}>
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-bold">EV vs পেট্রোল ক্যালকুলেটর</h2>
      </div>

      <div className="mt-6 space-y-5">
        <RangeRow label={`দৈনিক ড্রাইভিং: ${toBnDigits(km)} কিমি`} min={20} max={200} step={5} value={km} onChange={setKm} />
        <RangeRow label={`পেট্রোলের দাম: ৳${toBnDigits(petrolPrice)}/লিটার`} min={110} max={140} step={1} value={petrolPrice} onChange={setPetrolPrice} />
        <RangeRow label={`বিদ্যুৎ রেট: ৳${toBnDigits(elecRate)}/kWh`} min={7} max={12} step={0.5} value={elecRate} onChange={setElecRate} />

        <div className="flex gap-2">
          {(["ICE", "HEV", "BEV"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setCarType(t)}
              className={`flex-1 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                carType === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground/70 hover:bg-accent"
              }`}
            >
              {t === "ICE" ? "পেট্রোল" : t === "HEV" ? "হাইব্রিড" : "ফুল EV"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Result icon={Fuel} label="মাসিক পেট্রোল খরচ" value={fmt(monthly.iceCost)} />
        <Result icon={Zap} label="মাসিক EV চার্জিং" value={fmt(monthly.bevCost)} accent />
        <Result icon={TrendingDown} label="মাসে সাশ্রয়" value={fmt(monthly.savingsVsIce)} accent />
        <Result icon={TrendingDown} label="৫ বছরে সাশ্রয়" value={fmt(monthly.fiveYear)} big />
      </div>

      {!compact && (
        <p className="mt-5 rounded-xl bg-accent p-4 text-sm text-accent-foreground">
          <strong>BYD Sealion 6</strong> দিয়ে আপনার সাশ্রয়:{" "}
          <strong>{fmt(monthly.savingsVsIce)}</strong>/মাস, বছরে{" "}
          <strong>{fmt(monthly.annual)}</strong>।
        </p>
      )}
    </div>
  );
}

function RangeRow({
  label, min, max, step, value, onChange,
}: { label: string; min: number; max: number; step: number; value: number; onChange: (n: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[oklch(0.66_0.18_148)]"
      />
    </label>
  );
}

function Result({ icon: Icon, label, value, accent, big }: { icon: typeof Calculator; label: string; value: string; accent?: boolean; big?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${accent ? "bg-accent" : "bg-muted"} ${big ? "sm:col-span-2" : ""}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className={`mt-1 font-bold ${big ? "text-2xl text-primary" : "text-lg"}`}>{value}</p>
    </div>
  );
}
