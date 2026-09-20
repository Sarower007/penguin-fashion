/**
 * কর্তন ও নিট বেতন
 *
 * বেতন বিল হইতে সাধারণত যে কর্তনসমূহ হয় — সাধারণ ভবিষ্য তহবিল (জিপিএফ) চাঁদা,
 * কল্যাণ তহবিল ও যৌথবীমা, রাজস্ব স্ট্যাম্প, গৃহনির্মাণ ঋণের কিস্তি, আয়কর ইত্যাদি।
 * এই আদেশে কর্তনের হার নির্ধারিত নাই — জিপিএফ চাঁদার হার কর্মচারী নিজে নির্ধারণ
 * করেন (General Provident Fund Rules, 1979 — অনুচ্ছেদ ৭) এবং আয়কর আয়কর আইন,
 * ২০২৩ অনুযায়ী (অনুচ্ছেদ ৩১)। তাই হার ও অঙ্ক ব্যবহারকারীর ইনপুট হইতে লওয়া হয়।
 */

export type DeductionInput = {
  /** মূল বেতনের শতাংশ হিসাবে জিপিএফ চাঁদা */
  gpfPercent: number;
  /** মাসিক অন্যান্য কর্তন (কল্যাণ তহবিল, রাজস্ব স্ট্যাম্প, আয়কর, ঋণের কিস্তি ইত্যাদি) */
  otherDeduction: number;
};

export type PayRow = {
  label: string;
  basic: number;
  allowance: number;
  /** বিলুপ্ত হইবার পূর্বে প্রাপ্য বিশেষ সুবিধা (কেবল ৩০ জুন ২০২৬ পর্যন্ত) */
  specialBenefit: number;
  gross: number;
  gpf: number;
  other: number;
  deduction: number;
  net: number;
};

export function buildPayRow(
  label: string,
  basic: number,
  allowance: number,
  specialBenefit: number,
  d: DeductionInput,
): PayRow {
  const gross = basic + allowance + specialBenefit;
  const gpf = Math.round((basic * Math.max(0, d.gpfPercent)) / 100);
  const other = Math.max(0, Math.round(d.otherDeduction));
  const deduction = gpf + other;
  return {
    label,
    basic,
    allowance,
    specialBenefit,
    gross,
    gpf,
    other,
    deduction,
    net: gross - deduction,
  };
}
