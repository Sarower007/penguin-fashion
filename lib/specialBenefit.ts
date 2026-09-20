/**
 * বিশেষ সুবিধা (Special Benefit) — বিলুপ্তি ও সমন্বয়
 *
 * ▍বিদ্যমান প্রজ্ঞাপন (৩০ জুন ২০২৬ পর্যন্ত কার্যকর)
 * অর্থ বিভাগ, অর্থ মন্ত্রণালয়ের প্রজ্ঞাপন অনুযায়ী ১ জুলাই ২০২৫ তারিখ হইতে
 * প্রতি বৎসর ১ জুলাই তারিখে প্রাপ্য মূল বেতনের উপর —
 *   • গ্রেড-১ (ও তদূর্ধ্ব) হইতে গ্রেড-৯ পর্যন্ত  : ১০% হারে
 *   • গ্রেড-১০ হইতে গ্রেড-২০ পর্যন্ত             : ১৫% হারে
 *   • চাকরিরত কর্মচারীর ন্যূনতম মাসিক           : ১৫০০ টাকা
 *   • পেনশনভোগী/অবসরভোগীর ন্যূনতম মাসিক        : ৭৫০ টাকা (নিট পেনশনের ভিত্তিতে)
 * প্রযোজ্য: জাতীয় বেতনস্কেলভুক্ত সরকারি-বেসামরিক, স্বশাসিত ও রাষ্ট্রায়ত্ত
 * প্রতিষ্ঠান, ব্যাংক, বীমা, আর্থিক প্রতিষ্ঠান, বর্ডার গার্ড বাংলাদেশ ও পুলিশ
 * বাহিনীতে নিয়োজিত কর্মচারী এবং পেনশনভোগীগণ।
 *
 * ▍বিলুপ্তি — চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬
 *   • অনুচ্ছেদ ১(৩)(ট): জাতীয় বেতনস্কেল, ২০২৬ কার্যকর হইবার তারিখ হইতে বিশেষ
 *     সুবিধা বিলুপ্ত হইয়াছে বলিয়া গণ্য হইবে এবং ১ জুলাই ২০২৬ তারিখ হইতে এই আদেশ
 *     জারির তারিখ পর্যন্ত আহরিত বিশেষ সুবিধা দফা (ঘ) এবং দফা (জ) এর অধীন প্রাপ্য
 *     বকেয়ার সহিত সমন্বয় করিতে হইবে।
 *   • অনুচ্ছেদ ১(৩)(ঠ): ১ জুলাই ২০২৬ তারিখে যে কর্মচারী অবসর-উত্তর ছুটিতে (পিআরএল)
 *     রহিয়াছেন তিনি ৩০ জুন ২০২৬ তারিখে যে হারে বিশেষ সুবিধা পাইতেন, অবসর-উত্তর ছুটি
 *     শেষ না হওয়া পর্যন্ত সেই হারেই প্রাপ্য হইবেন।
 *   • অনুচ্ছেদ ৮(১)(গ): নিট পেনশনপ্রাপ্ত অবসরভোগী ও আজীবন পারিবারিক পেনশনভোগীর
 *     ক্ষেত্রেও জাতীয় বেতনস্কেল, ২০২৬ কার্যকর হইবার তারিখ হইতে বিশেষ সুবিধা বিলুপ্ত।
 */

import type { GradeNo } from './scales';

/** ১ জুলাই ২০২৫ হইতে কার্যকর বিশেষ সুবিধার হার ও ন্যূনতম সীমা */
export const SPECIAL_BENEFIT = {
  effectiveFrom: '১ জুলাই ২০২৫',
  /** গ্রেড-১ (ও তদূর্ধ্ব) হইতে গ্রেড-৯ */
  rateUpperGrades: 10,
  /** গ্রেড-১০ হইতে গ্রেড-২০ */
  rateLowerGrades: 15,
  /** চাকরিরত কর্মচারীর ন্যূনতম মাসিক অঙ্ক */
  employeeMinimum: 1500,
  /** পেনশনভোগীর হার (নিট পেনশনের উপর) */
  pensionerRate: 15,
  /** পেনশনভোগীর ন্যূনতম মাসিক অঙ্ক */
  pensionerMinimum: 750,
} as const;

export type SpecialBenefit = {
  rate: number;
  /** হার প্রয়োগে প্রাপ্ত অঙ্ক (ন্যূনতম সীমা প্রয়োগের পূর্বে) */
  calculated: number;
  /** ন্যূনতম সীমা প্রয়োগের পর প্রকৃত মাসিক অঙ্ক */
  amount: number;
  minimumApplied: boolean;
};

/** চাকরিরত কর্মচারীর ৩০ জুন ২০২৬ তারিখে আহরিত বিশেষ সুবিধা */
export function specialBenefitForEmployee(
  grade: GradeNo,
  basic: number,
): SpecialBenefit {
  const rate =
    grade <= 9
      ? SPECIAL_BENEFIT.rateUpperGrades
      : SPECIAL_BENEFIT.rateLowerGrades;
  const calculated = Math.round((basic * rate) / 100);
  const amount = Math.max(calculated, SPECIAL_BENEFIT.employeeMinimum);
  return {
    rate,
    calculated,
    amount,
    minimumApplied: amount > calculated,
  };
}

/** অবসরভোগী/আজীবন পারিবারিক পেনশনভোগীর ৩০ জুন ২০২৬ তারিখে আহরিত বিশেষ সুবিধা */
export function specialBenefitForPensioner(netPension: number): SpecialBenefit {
  const rate = SPECIAL_BENEFIT.pensionerRate;
  const calculated = Math.round((netPension * rate) / 100);
  const amount = Math.max(calculated, SPECIAL_BENEFIT.pensionerMinimum);
  return {
    rate,
    calculated,
    amount,
    minimumApplied: amount > calculated,
  };
}

/**
 * বিশেষ সুবিধা বিলুপ্তির প্রভাব
 *
 * @param grossIncrease   পর্যায়ভিত্তিক বেতন/পেনশন বৃদ্ধির অঙ্ক (মাসিক)
 * @param specialBenefit  ৩০ জুন ২০২৬ তারিখে আহরিত মাসিক বিশেষ সুবিধা
 * @param months          ১ জুলাই ২০২৬ হইতে আদেশ জারি পর্যন্ত মাস সংখ্যা
 */
export function specialBenefitImpact(
  grossIncrease: number,
  specialBenefit: number,
  months: number,
) {
  const netIncrease = grossIncrease - specialBenefit;
  const grossArrear = grossIncrease * months;
  const adjustment = specialBenefit * months;
  return {
    /** বিশেষ সুবিধা বাদ দিবার পর প্রকৃত মাসিক বৃদ্ধি (ঋণাত্মকও হইতে পারে) */
    netIncrease,
    /** সমন্বয়ের পূর্বে মোট বকেয়া */
    grossArrear,
    /** আহরিত বিশেষ সুবিধা বাবদ সমন্বয়যোগ্য অঙ্ক */
    adjustment,
    /** সমন্বয়ের পর প্রকৃত প্রাপ্য বকেয়া */
    netArrear: grossArrear - adjustment,
  };
}
