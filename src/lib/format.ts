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
