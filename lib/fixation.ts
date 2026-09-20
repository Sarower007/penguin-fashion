/**
 * জাতীয় বেতনস্কেল, ২০২৬ এ বেতন নির্ধারণ (Pay Fixation)
 *
 * বিধিসূত্র — চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ (এস.আর.ও. নং ৩৪৭-আইন/২০২৬):
 *  • অনুচ্ছেদ ৫(ক): বর্তমান বেতনস্কেলের প্রারম্ভিক ধাপে বেতন আহরণকারীর বেতন
 *                   জাতীয় বেতনস্কেল, ২০২৬ এর অনুরূপ স্কেলের প্রারম্ভিক ধাপেই নির্ধারিত হইবে।
 *  • অনুচ্ছেদ ৫(খ): মূল বেতন প্রারম্ভিক ধাপের উচ্চতর হইলে — পার্থক্য নির্ণয় করিয়া উহা
 *                   অনুরূপ স্কেলের (২০২৬) প্রারম্ভিক ধাপের সহিত যোগ করিতে হইবে;
 *                   (অ) যোগফল কোনও ধাপের সমান হইলে ঐ ধাপেই; (আ) সমান কোনও ধাপ না থাকিলে
 *                   পরবর্তী উচ্চতর ধাপে বেতন নির্ধারিত হইবে।
 *  • অনুচ্ছেদ ৫(গ): ১৭২০০০, ১৬৪০০০ ও ১৫৬০০০ টাকায় নির্ধারিত পদের ক্ষেত্রে (ক) ও (খ) প্রযোজ্য নহে।
 *  • অনুচ্ছেদ ৯(১): বার্ষিক বেতনবৃদ্ধির তারিখ প্রতি অর্থবৎসর শুরুর প্রথম দিবস (১ জুলাই)।
 *  • অনুচ্ছেদ ৯(২): অনুচ্ছেদ ৫ মোতাবেক বেতন নির্ধারণ করিয়া ১ জুলাই ২০২৬ তারিখে
 *                   ১টি বার্ষিক বেতনবৃদ্ধি প্রদেয় হইবে।
 *  • অনুচ্ছেদ ১(৩)(ক)(খ)(গ): বেতনবৃদ্ধি ধাপে ধাপে প্রদান —
 *      ১ জুলাই ২০২৬ – ৩১ ডিসেম্বর ২০২৬ : পার্থক্যের ৪০% (১ম–৯ম গ্রেড) / ৫০% (১০ম–২০তম গ্রেড)
 *      ১ জানুয়ারি ২০২৭ – ৩০ জুন ২০২৭  : পার্থক্যের ৭০% (১ম–৯ম গ্রেড) / ৭৫% (১০ম–২০তম গ্রেড)
 *      ১ জুলাই ২০২৭ হইতে              : বার্ষিক বেতনবৃদ্ধিসহ মূল বেতন শতভাগ।
 */

import type { GradeNo } from './scales';
import {
  SCALE_2015,
  SCALE_2026,
  FIXED_PAY_POSTS,
  scaleMax,
  scaleMin,
} from './scales';

export type SpecialPostId = (typeof FIXED_PAY_POSTS)[number]['id'];

export type FixationInput = {
  grade: GradeNo;
  /** ৩০ জুন ২০২৬ তারিখে আহরিত বা প্রাপ্য মূল বেতন */
  currentBasic: number;
  /** অনুচ্ছেদ ৩(২) এর নির্ধারিত বেতনের পদ (প্রযোজ্য হইলে) */
  specialPost?: SpecialPostId | null;
  /** অনুচ্ছেদ ৯(২) অনুযায়ী ১ জুলাই ২০২৬ তারিখে ১টি বার্ষিক বেতনবৃদ্ধি */
  applyJuly2026Increment: boolean;
};

export type StepLanding = {
  pay: number;
  index: number;
  exact: boolean;
  aboveMax: boolean;
};

/** প্রদত্ত অঙ্ককে স্কেলের ধাপে বসানো — সমান ধাপ না থাকিলে পরবর্তী উচ্চতর ধাপ */
export function landOnStep(scale: number[], amount: number): StepLanding {
  const exactIdx = scale.findIndex((s) => s === amount);
  if (exactIdx >= 0) {
    return { pay: scale[exactIdx], index: exactIdx, exact: true, aboveMax: false };
  }
  const nextIdx = scale.findIndex((s) => s > amount);
  if (nextIdx >= 0) {
    return { pay: scale[nextIdx], index: nextIdx, exact: false, aboveMax: false };
  }
  const last = scale.length - 1;
  return { pay: scale[last], index: last, exact: false, aboveMax: true };
}

/** পরবর্তী ধাপ (বার্ষিক ইনক্রিমেন্ট); সর্বোচ্চ ধাপে থাকিলে অপরিবর্তিত */
export function nextStep(scale: number[], pay: number): { pay: number; atMax: boolean } {
  const idx = scale.findIndex((s) => s === pay);
  if (idx >= 0) {
    if (idx === scale.length - 1) return { pay, atMax: true };
    return { pay: scale[idx + 1], atMax: false };
  }
  const landed = landOnStep(scale, pay);
  if (landed.aboveMax) return { pay: landed.pay, atMax: true };
  return { pay: landed.pay, atMax: false };
}

export type FixationResult = {
  grade: GradeNo;
  currentBasic: number;
  scale2015: number[];
  scale2026: number[];
  /** ২০১৫ স্কেলে বর্তমান ধাপ (০-ভিত্তিক), না মিলিলে -1 */
  currentStepIndex: number;
  atInitialStep: boolean;
  /** বর্তমান বেতন − বর্তমান স্কেলের প্রারম্ভিক ধাপ (অনুচ্ছেদ ৫(খ)) */
  difference: number;
  /** ২০২৬ স্কেলের প্রারম্ভিক ধাপ + পার্থক্য */
  provisional: number;
  /** অনুচ্ছেদ ৫ অনুযায়ী নির্ধারিত বেতন */
  fixedPay: number;
  fixedStepIndex: number;
  fixedExactMatch: boolean;
  /** অনুচ্ছেদ ৯(২) অনুযায়ী ১ জুলাই ২০২৬ এর ইনক্রিমেন্ট প্রয়োগ হইয়াছে কি না */
  incrementApplied: boolean;
  /** জাতীয় বেতনস্কেল, ২০২৬ এ চূড়ান্ত নির্ধারিত মূল বেতন */
  newBasic: number;
  newStepIndex: number;
  /** নির্ধারিত বেতন − বর্তমান বেতন (বেতনবৃদ্ধি বাবদ মোট অঙ্ক) */
  increase: number;
  increasePercent: number;
  phase1Percent: number;
  phase2Percent: number;
  /** ১ জুলাই ২০২৬ – ৩১ ডিসেম্বর ২০২৬ এ প্রদেয় মূল বেতন */
  phase1Pay: number;
  /** ১ জানুয়ারি ২০২৭ – ৩০ জুন ২০২৭ এ প্রদেয় মূল বেতন */
  phase2Pay: number;
  /** ১ জুলাই ২০২৭ হইতে প্রদেয় মূল বেতন (ঐ বৎসরের ইনক্রিমেন্টসহ, শতভাগ) */
  phase3Pay: number;
  phase3AtMax: boolean;
  isSpecialFixed: boolean;
  specialPostLabel?: string;
  warnings: string[];
  notes: string[];
};

export function calculateFixation(input: FixationInput): FixationResult {
  const { grade, currentBasic, specialPost, applyJuly2026Increment } = input;
  const scale2015 = SCALE_2015[grade];
  const scale2026 = SCALE_2026[grade];
  const warnings: string[] = [];
  const notes: string[] = [];

  // ১ম–৯ম গ্রেড ৪০%/৭০%, ১০ম–২০তম গ্রেড ৫০%/৭৫% — অনুচ্ছেদ ১(৩)(ক) ও (খ)
  const isUpperGrade = grade <= 9;
  const phase1Percent = isUpperGrade ? 40 : 50;
  const phase2Percent = isUpperGrade ? 70 : 75;

  const special = specialPost
    ? FIXED_PAY_POSTS.find((p) => p.id === specialPost)
    : undefined;

  // ── অনুচ্ছেদ ৫(গ): নির্ধারিত বেতনের পদ ─────────────────────────────
  if (special || grade === 1) {
    const newBasic = special ? special.pay2026 : scale2026[0]; // ১৫৬০০০
    const currentFixed = special
      ? currentBasic // ২০১৫ স্কেলে সংশ্লিষ্ট নির্ধারিত বেতন (ব্যবহারকারী প্রদত্ত)
      : currentBasic;
    const increase = newBasic - currentFixed;
    notes.push(
      special
        ? `অনুচ্ছেদ ৩(২) অনুযায়ী ${special.label} এর বেতন ${newBasic} টাকা (নির্ধারিত)।`
        : 'অনুচ্ছেদ ৩(১) অনুযায়ী ১ম গ্রেডের বেতন ১৫৬০০০ টাকা (নির্ধারিত)।',
    );
    notes.push(
      'অনুচ্ছেদ ৫(গ) অনুযায়ী নির্ধারিত বেতনের ক্ষেত্রে অনুচ্ছেদ ৫ এর দফা (ক) ও (খ) প্রযোজ্য নহে; ধাপভিত্তিক বেতনবৃদ্ধি (ইনক্রিমেন্ট) প্রযোজ্য নহে।',
    );
    return {
      grade,
      currentBasic: currentFixed,
      scale2015,
      scale2026,
      currentStepIndex: 0,
      atInitialStep: true,
      difference: 0,
      provisional: newBasic,
      fixedPay: newBasic,
      fixedStepIndex: 0,
      fixedExactMatch: true,
      incrementApplied: false,
      newBasic,
      newStepIndex: 0,
      increase,
      increasePercent: currentFixed > 0 ? (increase / currentFixed) * 100 : 0,
      phase1Percent,
      phase2Percent,
      phase1Pay: Math.round(currentFixed + (increase * phase1Percent) / 100),
      phase2Pay: Math.round(currentFixed + (increase * phase2Percent) / 100),
      phase3Pay: newBasic,
      phase3AtMax: true,
      isSpecialFixed: true,
      specialPostLabel: special?.label,
      warnings,
      notes,
    };
  }

  // ── বৈধতা যাচাই ────────────────────────────────────────────────────
  const min2015 = scaleMin(scale2015);
  const max2015 = scaleMax(scale2015);
  if (currentBasic < min2015) {
    warnings.push(
      `প্রদত্ত মূল বেতন ${currentBasic} টাকা ${grade} নং গ্রেডের বর্তমান স্কেলের প্রারম্ভিক ধাপ (${min2015} টাকা) অপেক্ষা কম। গ্রেড ও মূল বেতন পুনরায় যাচাই করুন।`,
    );
  }
  if (currentBasic > max2015) {
    warnings.push(
      `প্রদত্ত মূল বেতন ${currentBasic} টাকা এই গ্রেডের সর্বোচ্চ ধাপ (${max2015} টাকা) অপেক্ষা বেশি। ব্যক্তিগত বেতন বা বিশেষ ক্ষেত্রে হিসাবরক্ষণ অফিসের সহিত যাচাই করুন।`,
    );
  }
  const currentStepIndex = scale2015.findIndex((s) => s === currentBasic);
  if (currentStepIndex < 0 && currentBasic >= min2015 && currentBasic <= max2015) {
    warnings.push(
      'প্রদত্ত মূল বেতন বর্তমান স্কেলের কোনও ধাপের সহিত হুবহু মিলে নাই; তবুও অনুচ্ছেদ ৫(খ) অনুযায়ী পার্থক্য পদ্ধতিতে হিসাব দেখানো হইল।',
    );
  }

  // ── অনুচ্ছেদ ৫(ক)/(খ) ─────────────────────────────────────────────
  const atInitialStep = currentBasic === min2015;
  const difference = currentBasic - min2015;
  const provisional = scaleMin(scale2026) + difference;
  const landed = landOnStep(scale2026, provisional);

  if (atInitialStep) {
    notes.push(
      'অনুচ্ছেদ ৫(ক): বর্তমান বেতনস্কেলের প্রারম্ভিক ধাপে বেতন আহরণ করায় জাতীয় বেতনস্কেল, ২০২৬ এর অনুরূপ স্কেলের প্রারম্ভিক ধাপেই বেতন নির্ধারিত হইয়াছে।',
    );
  } else {
    notes.push(
      `অনুচ্ছেদ ৫(খ): পার্থক্য = ${currentBasic} − ${min2015} = ${difference} টাকা; অনুরূপ স্কেলের প্রারম্ভিক ধাপ + পার্থক্য = ${scaleMin(
        scale2026,
      )} + ${difference} = ${provisional} টাকা।`,
    );
    notes.push(
      landed.exact
        ? `অনুচ্ছেদ ৫(খ)(অ): ${provisional} টাকা অনুরূপ স্কেলের একটি ধাপের সমান হওয়ায় ঐ ধাপেই বেতন নির্ধারিত হইয়াছে।`
        : `অনুচ্ছেদ ৫(খ)(আ): ${provisional} টাকার সমান কোনও ধাপ না থাকায় পরবর্তী উচ্চতর ধাপ ${landed.pay} টাকায় বেতন নির্ধারিত হইয়াছে।`,
    );
  }
  if (landed.aboveMax) {
    warnings.push(
      'যোগফল অনুরূপ স্কেলের সর্বোচ্চ ধাপ অতিক্রম করায় সর্বোচ্চ ধাপেই বেতন দেখানো হইয়াছে; প্রকৃত ক্ষেত্রে হিসাবরক্ষণ অফিসের সিদ্ধান্ত অনুসরণীয়।',
    );
  }

  const fixedPay = landed.pay;

  // ── অনুচ্ছেদ ৯(২): ১ জুলাই ২০২৬ এর ১টি বার্ষিক ইনক্রিমেন্ট ─────────
  let newBasic = fixedPay;
  let incrementApplied = false;
  if (applyJuly2026Increment) {
    const inc = nextStep(scale2026, fixedPay);
    newBasic = inc.pay;
    incrementApplied = !inc.atMax || inc.pay !== fixedPay;
    if (inc.atMax && inc.pay === fixedPay) {
      warnings.push(
        'স্কেলের সর্বোচ্চ ধাপে থাকায় ১ জুলাই ২০২৬ তারিখের বার্ষিক বেতনবৃদ্ধি প্রয়োগ করা সম্ভব হয় নাই।',
      );
    } else {
      notes.push(
        `অনুচ্ছেদ ৯(২): বেতন নির্ধারণের পর ১ জুলাই ২০২৬ তারিখে ১টি বার্ষিক বেতনবৃদ্ধি যোগ করিয়া মূল বেতন ${newBasic} টাকা।`,
      );
    }
  } else {
    notes.push(
      'অনুচ্ছেদ ৯(২) অনুযায়ী প্রাপ্য ১ জুলাই ২০২৬ তারিখের বার্ষিক বেতনবৃদ্ধি এই হিসাবে যোগ করা হয় নাই।',
    );
  }

  const newStepIndex = scale2026.findIndex((s) => s === newBasic);
  const increase = newBasic - currentBasic;

  const phase1Pay = Math.round(currentBasic + (increase * phase1Percent) / 100);
  const phase2Pay = Math.round(currentBasic + (increase * phase2Percent) / 100);
  const july2027 = nextStep(scale2026, newBasic);

  return {
    grade,
    currentBasic,
    scale2015,
    scale2026,
    currentStepIndex,
    atInitialStep,
    difference,
    provisional,
    fixedPay,
    fixedStepIndex: landed.index,
    fixedExactMatch: landed.exact,
    incrementApplied,
    newBasic,
    newStepIndex,
    increase,
    increasePercent: currentBasic > 0 ? (increase / currentBasic) * 100 : 0,
    phase1Percent,
    phase2Percent,
    phase1Pay,
    phase2Pay,
    phase3Pay: july2027.pay,
    phase3AtMax: july2027.atMax,
    isSpecialFixed: false,
    warnings,
    notes,
  };
}

/** বার্ষিক ইনক্রিমেন্ট প্রক্ষেপণ — ১ জুলাই ২০২৭ হইতে বৎসরওয়ারি মূল বেতন */
export function projectIncrements(
  grade: GradeNo,
  startBasic: number,
  years: number,
): { year: number; basic: number; atMax: boolean }[] {
  const scale = SCALE_2026[grade];
  const rows: { year: number; basic: number; atMax: boolean }[] = [];
  let pay = startBasic;
  for (let i = 0; i < years; i++) {
    const year = 2027 + i;
    const step = nextStep(scale, pay);
    pay = step.pay;
    rows.push({ year, basic: pay, atMax: step.atMax });
    if (step.atMax) break;
  }
  return rows;
}
