// Format BDT bigint to Bengali "৳X.XX লাখ" / "৳X কোটি"
const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export const toBnDigits = (s: string | number) =>
  String(s).replace(/\d/g, (d) => bnDigits[Number(d)]);

export function formatBDTLakh(amount: number | null | undefined): string {
  if (!amount) return "শীঘ্রই ঘোষণা";
  const lakh = amount / 100000;
  if (lakh >= 100) {
    const crore = lakh / 100;
    return `৳${toBnDigits(crore.toFixed(2))} কোটি`;
  }
  return `৳${toBnDigits(lakh.toFixed(1))} লাখ`;
}

export function formatKm(km: number | null | undefined): string {
  if (!km) return "—";
  return `${toBnDigits(km)} কিমি`;
}

// Format an ISO date to a short Bengali label, e.g. "১০ জুলাই ২০২৬".
const bnMonths = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];
export function formatBnDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${toBnDigits(d.getDate())} ${bnMonths[d.getMonth()]} ${toBnDigits(d.getFullYear())}`;
}
