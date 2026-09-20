/**
 * পেনশন নির্ধারণ — চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬
 *
 *  • অনুচ্ছেদ ৮(১)(ক): পেনশন ও গ্র্যাচুইটি বা আনুতোষিক এর বিদ্যমান হার অপরিবর্তিত থাকিবে।
 *  • অনুচ্ছেদ ৮(১)(খ) সারণি: ১ জুলাই ২০২৬ তারিখের অব্যবহিত পূর্বে বিদ্যমান মাসিক নিট
 *    পেনশনকে ভিত্তি ধরিয়া সর্বোচ্চ ও সর্বনিম্ন সীমাসহ নিট পেনশন নির্ধারণ।
 *  • শর্ত: যে সকল অবসরভোগী ইতোমধ্যে ৭০২০০ টাকার অতিরিক্ত নিট পেনশন উত্তোলন করিতেছেন,
 *    তিনি পরবর্তী বার্ষিক বৃদ্ধি (১ জুলাই ২০২৭) এর পূর্ব পর্যন্ত বিদ্যমান নিট পেনশন পাইবেন।
 *  • অনুচ্ছেদ ৮(২): নিট পেনশন নির্ধারণ করিয়া ১ জুলাই ২০২৬ তারিখে ১টি বার্ষিক বৃদ্ধি প্রদেয়।
 *  • অনুচ্ছেদ ১(৩)(ঙ): ১ জুলাই ২০২৬ – ৩১ ডিসেম্বর ২০২৬ — পেনশনবৃদ্ধির
 *    ৪০% (বিদ্যমান নিট পেনশন স্ল্যাব ২০০০১ টাকা ও তদূর্ধ্ব) / ৫০% (স্ল্যাব ১–২০০০০ টাকা)।
 *  • অনুচ্ছেদ ১(৩)(চ): ১ জানুয়ারি ২০২৭ – ৩০ জুন ২০২৭ — ৭০% / ৭৫%।
 *  • অনুচ্ছেদ ১(৩)(ছ): ১ জুলাই ২০২৭ হইতে বার্ষিক বৃদ্ধিসহ নিট পেনশন শতভাগ।
 *  • অনুচ্ছেদ ১৭(২): নিট পেনশনের সমপরিমাণ হারে বৎসরে ২(দুই)টি উৎসব ভাতা।
 *  • অনুচ্ছেদ ১৪(২): নিট পেনশনকে ভিত্তি ধরিয়া বাংলা নববর্ষ ভাতা (১৫%)।
 */

import { BOISHAKHI_RATE, medicalForPensioner } from './allowances';

export type PensionSlab = {
  min: number;
  max: number;
  label: string;
  rate: number;
  floor: number;
  ceiling: number;
};

/** অনুচ্ছেদ ৮(১)(খ) এর সারণি */
export const PENSION_SLABS: PensionSlab[] = [
  { min: 0, max: 9000, label: 'সর্বনিম্ন–৯০০০ টাকা', rate: 100, floor: 10000, ceiling: 18000 },
  { min: 9001, max: 20000, label: '৯০০১–২০০০০ টাকা', rate: 75, floor: 18001, ceiling: 35000 },
  { min: 20001, max: 30000, label: '২০০০১–৩০০০০ টাকা', rate: 65, floor: 35001, ceiling: 49000 },
  { min: 30001, max: 40000, label: '৩০০০১–৪০০০০ টাকা', rate: 60, floor: 49001, ceiling: 62000 },
  { min: 40001, max: Infinity, label: '৪০০০১ ও তদূর্ধ্ব', rate: 55, floor: 62001, ceiling: 70200 },
];

export const PENSION_ABSOLUTE_CEILING = 70200;

/** এই আদেশে পেনশনের বার্ষিক বৃদ্ধির হার উল্লেখ নাই; বিদ্যমান প্রচলিত হার ৫% ধরা হইয়াছে */
export const DEFAULT_PENSION_INCREMENT_RATE = 5;

export function findPensionSlab(netPension: number): PensionSlab {
  return (
    PENSION_SLABS.find((s) => netPension >= s.min && netPension <= s.max) ??
    PENSION_SLABS[PENSION_SLABS.length - 1]
  );
}

export type PensionInput = {
  /** ৩০ জুন ২০২৬ তারিখে প্রাপ্ত মাসিক নিট পেনশন */
  currentNetPension: number;
  /** অনুচ্ছেদ ৮(২) অনুযায়ী ১ জুলাই ২০২৬ তারিখের ১টি বার্ষিক বৃদ্ধি প্রয়োগ */
  applyJuly2026Increment: boolean;
  /** বার্ষিক বৃদ্ধির হার (%) — বিদ্যমান প্রচলিত হার ৫% */
  incrementRate: number;
  /** অবসরভোগীর বয়স (চিকিৎসা ভাতার জন্য) */
  age: number;
};

export type PensionResult = {
  currentNetPension: number;
  slab: PensionSlab;
  rawIncrease: number;
  /** সীমা প্রয়োগের পূর্বে বর্ধিত নিট পেনশন */
  beforeLimits: number;
  floorApplied: boolean;
  ceilingApplied: boolean;
  /** অনুচ্ছেদ ৮(১)(খ) অনুযায়ী নির্ধারিত নিট পেনশন */
  fixedNetPension: number;
  incrementApplied: boolean;
  incrementAmount: number;
  /** ১ জুলাই ২০২৬ এর বার্ষিক বৃদ্ধিসহ চূড়ান্ত নিট পেনশন */
  newNetPension: number;
  increase: number;
  increasePercent: number;
  phase1Percent: number;
  phase2Percent: number;
  phase1Pension: number;
  phase2Pension: number;
  phase3Pension: number;
  /** ৭০২০০ টাকার অতিরিক্ত নিট পেনশন উত্তোলনকারীর ক্ষেত্রে বিশেষ শর্ত প্রযোজ্য কি না */
  aboveAbsoluteCeiling: boolean;
  festivalEach: number;
  festivalTotal: number;
  boishakhi: number;
  medical: number;
  warnings: string[];
  notes: string[];
};

export function calculatePension(input: PensionInput): PensionResult {
  const { currentNetPension, applyJuly2026Increment, incrementRate, age } = input;
  const warnings: string[] = [];
  const notes: string[] = [];

  const slab = findPensionSlab(currentNetPension);
  // অনুচ্ছেদ ১(৩)(ঙ)/(চ): স্ল্যাব ২০০০১ ও তদূর্ধ্ব → ৪০%/৭০%; স্ল্যাব ১–২০০০০ → ৫০%/৭৫%
  const isHigherSlab = currentNetPension >= 20001;
  const phase1Percent = isHigherSlab ? 40 : 50;
  const phase2Percent = isHigherSlab ? 70 : 75;

  const aboveAbsoluteCeiling = currentNetPension > PENSION_ABSOLUTE_CEILING;

  const rawIncrease = Math.round((currentNetPension * slab.rate) / 100);
  const beforeLimits = currentNetPension + rawIncrease;

  let fixedNetPension = beforeLimits;
  let floorApplied = false;
  let ceilingApplied = false;

  if (fixedNetPension < slab.floor) {
    fixedNetPension = slab.floor;
    floorApplied = true;
  }
  if (fixedNetPension > slab.ceiling) {
    fixedNetPension = slab.ceiling;
    ceilingApplied = true;
  }

  notes.push(
    `অনুচ্ছেদ ৮(১)(খ): ৩০ জুন ২০২৬ তারিখে প্রাপ্ত নিট পেনশন ${currentNetPension} টাকা — সারণির "${slab.label}" স্ল্যাবভুক্ত; বৃদ্ধির হার ${slab.rate}%।`,
  );
  notes.push(
    `বৃদ্ধি = ${currentNetPension} × ${slab.rate}% = ${rawIncrease} টাকা; বর্ধিত নিট পেনশন = ${beforeLimits} টাকা।`,
  );
  if (floorApplied) {
    notes.push(
      `সারণির ন্যূনতম সীমা প্রযোজ্য হওয়ায় নিট পেনশন ${slab.floor} টাকায় উন্নীত হইয়াছে।`,
    );
  }
  if (ceilingApplied) {
    notes.push(
      `সারণির সর্বোচ্চ সীমা প্রযোজ্য হওয়ায় নিট পেনশন ${slab.ceiling} টাকায় সীমিত হইয়াছে।`,
    );
  }

  if (aboveAbsoluteCeiling) {
    warnings.push(
      `আপনি ইতোমধ্যে ৭০২০০ টাকার অতিরিক্ত নিট পেনশন উত্তোলন করিতেছেন; অনুচ্ছেদ ৮(১)(খ) এর শর্ত অনুযায়ী পরবর্তী বার্ষিক বৃদ্ধি (১ জুলাই ২০২৭) এর পূর্ব পর্যন্ত বিদ্যমান নিট পেনশনই প্রাপ্য হইবেন।`,
    );
  }

  let newNetPension = fixedNetPension;
  let incrementAmount = 0;
  let incrementApplied = false;
  if (applyJuly2026Increment) {
    incrementAmount = Math.round((fixedNetPension * incrementRate) / 100);
    newNetPension = fixedNetPension + incrementAmount;
    incrementApplied = true;
    notes.push(
      `অনুচ্ছেদ ৮(২): নিট পেনশন নির্ধারণের পর ১ জুলাই ২০২৬ তারিখে ১টি বার্ষিক বৃদ্ধি (${incrementRate}%) = ${incrementAmount} টাকা যোগ করিয়া নিট পেনশন ${newNetPension} টাকা।`,
    );
  }

  const increase = newNetPension - currentNetPension;
  const phase1Pension = Math.round(
    currentNetPension + (increase * phase1Percent) / 100,
  );
  const phase2Pension = Math.round(
    currentNetPension + (increase * phase2Percent) / 100,
  );
  const phase3Pension = Math.round(
    newNetPension + (newNetPension * incrementRate) / 100,
  );

  return {
    currentNetPension,
    slab,
    rawIncrease,
    beforeLimits,
    floorApplied,
    ceilingApplied,
    fixedNetPension,
    incrementApplied,
    incrementAmount,
    newNetPension,
    increase,
    increasePercent:
      currentNetPension > 0 ? (increase / currentNetPension) * 100 : 0,
    phase1Percent,
    phase2Percent,
    phase1Pension,
    phase2Pension,
    phase3Pension,
    aboveAbsoluteCeiling,
    festivalEach: newNetPension,
    festivalTotal: newNetPension * 2,
    boishakhi: Math.round((newNetPension * BOISHAKHI_RATE) / 100),
    medical: medicalForPensioner(age),
    warnings,
    notes,
  };
}
