/** বাংলা সংখ্যা ও টাকা ফরম্যাট সংক্রান্ত সহায়ক ফাংশন */

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/** ইংরেজি অঙ্ককে বাংলা অঙ্কে রূপান্তর */
export function toBn(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

/** বাংলা অঙ্ককে ইংরেজি অঙ্কে রূপান্তর (ইনপুট ফিল্ডে ব্যবহারের জন্য) */
export function toEn(value: string): string {
  return value.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

/** ১২৩৪৫৬ → "১,২৩,৪৫৬" (দক্ষিণ এশীয় অঙ্কবিন্যাস) */
export function bnNumber(n: number, fractionDigits = 0): string {
  const rounded = Number.isFinite(n) ? n : 0;
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(rounded);
  return toBn(formatted);
}

/** টাকার অঙ্ক — "৳ ১,২৩,৪৫৬" */
export function bnTaka(n: number, fractionDigits = 0): string {
  return `৳ ${bnNumber(n, fractionDigits)}`;
}

/** শতাংশ — "৪০%" */
export function bnPercent(n: number): string {
  return `${toBn(n)}%`;
}

/** ইনপুট স্ট্রিং থেকে সংখ্যা (বাংলা/ইংরেজি উভয় অঙ্ক, কমা ও স্পেস উপেক্ষা) */
export function parseAmount(raw: string): number | null {
  const cleaned = toEn(raw).replace(/[,\s৳]/g, '').trim();
  if (cleaned === '') return null;
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

const BN_ORDINAL: Record<number, string> = {
  1: '১ম', 2: '২য়', 3: '৩য়', 4: '৪র্থ', 5: '৫ম', 6: '৬ষ্ঠ', 7: '৭ম',
  8: '৮ম', 9: '৯ম', 10: '১০ম', 11: '১১তম', 12: '১২তম', 13: '১৩তম',
  14: '১৪তম', 15: '১৫তম', 16: '১৬তম', 17: '১৭তম', 18: '১৮তম',
  19: '১৯তম', 20: '২০তম',
};

/** ১ → "১ম", ১০ → "১০ম" */
export function bnOrdinal(n: number): string {
  return BN_ORDINAL[n] ?? `${toBn(n)}তম`;
}

/** টাকার অঙ্ক পূর্ণসংখ্যায় (সরকারি হিসাবে ভগ্নাংশ পরবর্তী পূর্ণসংখ্যায় উন্নীত হয় না — নিকটতম পূর্ণসংখ্যা) */
export function round(n: number): number {
  return Math.round(n);
}
