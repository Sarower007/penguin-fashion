/**
 * ভাতাদির হার — চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ এর অনুচ্ছেদ ১২–২৮
 *
 * গুরুত্বপূর্ণ সময়সীমা:
 *  • অনুচ্ছেদ ১(৩)(ঞ) ও ১২(২): এই আদেশের অধীন প্রদেয় অন্যান্য সকল ভাতা (উৎসব ভাতা ও
 *    বাংলা নববর্ষ ভাতাসহ) ৩০ জুন ২০২৬ তারিখ পর্যন্ত প্রাপ্য অঙ্কে ৩১ ডিসেম্বর ২০২৭
 *    তারিখ পর্যন্ত প্রদান করা হইবে।
 *  • অনুচ্ছেদ ১২(১) ও ১৫(৬): ১ জানুয়ারি ২০২৮ তারিখ হইতে এই আদেশে নির্ধারিত হারে
 *    ভাতাদি (বাড়ি ভাড়া ভাতাসহ) প্রদেয় হইবে।
 */

import type { GradeNo } from './scales';

export type AreaId = 'dhaka' | 'cityCorp' | 'other';

export const AREAS: { id: AreaId; label: string; short: string }[] = [
  {
    id: 'dhaka',
    short: 'ঢাকা সিটি কর্পোরেশন',
    label: 'ঢাকা উত্তর ও দক্ষিণ সিটি কর্পোরেশন এলাকা',
  },
  {
    id: 'cityCorp',
    short: 'অন্যান্য সিটি কর্পোরেশন ও সাভার/কক্সবাজার',
    label:
      'খুলনা, রাজশাহী, চট্টগ্রাম, সিলেট, বরিশাল, নারায়ণগঞ্জ, কুমিল্লা, রংপুর, গাজীপুর, ময়মনসিংহ ও বগুড়া সিটি কর্পোরেশন এবং সাভার ও কক্সবাজার পৌর এলাকা',
  },
  { id: 'other', short: 'অন্যান্য স্থান', label: 'অন্যান্য স্থানের জন্য' },
];

/** অনুচ্ছেদ ১৫(৬) সারণি — ১ জানুয়ারি ২০২৮ হইতে প্রযোজ্য মাসিক বাড়ি ভাড়া ভাতার হার */
export const HOUSE_RENT_BANDS: {
  grades: GradeNo[];
  label: string;
  dhaka: number;
  cityCorp: number;
  other: number;
}[] = [
  {
    grades: [16, 17, 18, 19, 20],
    label: 'গ্রেড-২০ এর সর্বনিম্ন ধাপ হইতে গ্রেড-১৬ এর সর্বোচ্চ ধাপ পর্যন্ত',
    dhaka: 60,
    cityCorp: 50,
    other: 45,
  },
  {
    grades: [10, 11, 12, 13, 14, 15],
    label: 'গ্রেড-১৫ এর সর্বনিম্ন ধাপ হইতে গ্রেড-১০ এর সর্বোচ্চ ধাপ পর্যন্ত',
    dhaka: 50,
    cityCorp: 40,
    other: 35,
  },
  {
    grades: [5, 6, 7, 8, 9],
    label: 'গ্রেড-৯ এর সর্বনিম্ন ধাপ হইতে গ্রেড-৫ এর সর্বোচ্চ ধাপ পর্যন্ত',
    dhaka: 45,
    cityCorp: 35,
    other: 30,
  },
  {
    grades: [1, 2, 3, 4],
    label: 'গ্রেড-৪ এর সর্বনিম্ন ধাপ হইতে গ্রেড-১ ও তদূর্ধ্ব',
    dhaka: 40,
    cityCorp: 30,
    other: 25,
  },
];

export function houseRentBand(grade: GradeNo) {
  return (
    HOUSE_RENT_BANDS.find((b) => b.grades.includes(grade)) ??
    HOUSE_RENT_BANDS[HOUSE_RENT_BANDS.length - 1]
  );
}

export function houseRentRate(grade: GradeNo, area: AreaId): number {
  const band = houseRentBand(grade);
  return band[area];
}

/** অনুচ্ছেদ ১৩(১) — কর্মরত কর্মচারীর চিকিৎসা ভাতা */
export const MEDICAL_SERVING = {
  upTo50: 3000,
  after50: 4000,
};

/** অনুচ্ছেদ ১৩(২) — অবসরভোগী ও আজীবন পারিবারিক পেনশনভোগীর চিকিৎসা ভাতা */
export const MEDICAL_PENSIONER = [
  { maxAge: 50, amount: 3000, label: '৫০ বৎসর বয়স পর্যন্ত' },
  { maxAge: 60, amount: 4000, label: '৫০ বৎসর ১ দিন হইতে ৬০ বৎসর পর্যন্ত' },
  { maxAge: 70, amount: 5000, label: '৬০ বৎসর ০১ দিন হইতে ৭০ বৎসর পর্যন্ত' },
  { maxAge: Infinity, amount: 6000, label: '৭০ বৎসরের ঊর্ধ্বে' },
];

export function medicalForServing(age: number): number {
  return age <= 50 ? MEDICAL_SERVING.upTo50 : MEDICAL_SERVING.after50;
}

export function medicalForPensioner(age: number): number {
  const row = MEDICAL_PENSIONER.find((r) => age <= r.maxAge);
  return row ? row.amount : MEDICAL_PENSIONER[MEDICAL_PENSIONER.length - 1].amount;
}

/** অনুচ্ছেদ ১৪(১) — বাংলা নববর্ষ ভাতা: আহরিত মূল বেতনের ১৫% */
export const BOISHAKHI_RATE = 15;

/** অনুচ্ছেদ ১৮(১) — শিক্ষা সহায়ক ভাতা: সন্তান প্রতি ৫০০, অনধিক ২ সন্তান (সর্বোচ্চ ১০০০) */
export const EDUCATION_PER_CHILD = 500;
export const EDUCATION_MAX_CHILDREN = 2;
export const EDUCATION_MAX = 1000;

/** অনুচ্ছেদ ১৯ — টিফিন ভাতা: ১১তম–২০তম গ্রেড, মাসিক ৫০০ টাকা */
export const TIFFIN = 500;

/** অনুচ্ছেদ ২০ — কার্যভার ভাতা: মাসিক ১৫০০ টাকা */
export const CHARGE_ALLOWANCE = 1500;

/** অনুচ্ছেদ ২১(১) — যাতায়াত ভাতা: ১১তম–২০তম গ্রেড, সিটি কর্পোরেশন এলাকায় কর্মস্থল, মাসিক ৬০০ */
export const CONVEYANCE = 600;

/** অনুচ্ছেদ ২২ — মোবাইল ভাতা */
export const MOBILE_UPPER = 500; // ৫ম গ্রেড ও তদূর্ধ্ব
export const MOBILE_LOWER = 150; // ৬ষ্ঠ হইতে ২০তম গ্রেড

/** অনুচ্ছেদ ২৩ — ধোলাই ভাতা: মাসিক ৩০০ টাকা (যাহাদের ক্ষেত্রে প্রযোজ্য) */
export const WASHING = 300;

/** অনুচ্ছেদ ২৪ — আপ্যায়ন ভাতা */
export const ENTERTAINMENT_OPTIONS = [
  { id: 'none', label: 'প্রযোজ্য নহে', amount: 0 },
  {
    id: 'cabinet',
    label: 'মন্ত্রিপরিষদ সচিব / প্রধানমন্ত্রীর মুখ্য সচিব',
    amount: 2000,
  },
  { id: 'secretary', label: 'সিনিয়র সচিব / সচিব', amount: 1000 },
  { id: 'addl-secretary', label: 'অতিরিক্ত সচিব', amount: 900 },
  {
    id: 'joint-secretary',
    label: 'যুগ্মসচিব / অন্যান্য প্রাধিকারভুক্ত কর্মচারী',
    amount: 600,
  },
] as const;

/** অনুচ্ছেদ ২৫ — পাহাড়ি ভাতা: মূল বেতনের ২০%, সর্বোচ্চ সীমাসহ */
export const HILL_RATE = 20;
export const HILL_MAX_SADAR = 5000; // জেলা সদর ও সদর উপজেলা
export const HILL_MAX_OTHER = 5500; // অন্যান্য উপজেলা

/** অনুচ্ছেদ ২৬ — হাওড়/দ্বীপ/চর ভাতা: মূল বেতনের ২০%, সর্বোচ্চ ৫০০০ টাকা */
export const HAOR_RATE = 20;
export const HAOR_MAX = 5000;

/** অনুচ্ছেদ ২৭ — প্রশিক্ষণ প্রতিষ্ঠানে প্রেষণ ভাতা: মূল বেতনের ১০% (৯ম গ্রেড ও তদূর্ধ্ব) */
export const TRAINING_DEPUTATION_RATE = 10;

/** অনুচ্ছেদ ২৮ — বিশেষ চাহিদাসম্পন্ন (প্রতিবন্ধী) সন্তান ভাতা: জনপ্রতি ৩০০০, অনধিক ২ সন্তান */
export const DISABLED_CHILD_PER_CHILD = 3000;
export const DISABLED_CHILD_MAX_CHILDREN = 2;

export function mobileAllowance(grade: GradeNo): number {
  return grade <= 5 ? MOBILE_UPPER : MOBILE_LOWER;
}

export function isTiffinEligible(grade: GradeNo): boolean {
  return grade >= 11 && grade <= 20;
}

export function isConveyanceEligible(grade: GradeNo): boolean {
  return grade >= 11 && grade <= 20;
}

export type AllowanceInput = {
  grade: GradeNo;
  basic: number;
  area: AreaId;
  /** সরকারি বাসস্থানে বসবাস করিলে বাড়ি ভাড়া ভাতা প্রাপ্য নহে (অনুচ্ছেদ ১৫(২)) */
  govtAccommodation: boolean;
  age: number;
  children: number;
  disabledChildren: number;
  /** প্রতিষ্ঠান হইতে লাঞ্চ/বিনামূল্যে দুপুরের খাবার পাইলে টিফিন ভাতা প্রযোজ্য নহে */
  freeLunch: boolean;
  /** কর্মস্থল সিটি কর্পোরেশন এলাকায় কি না (যাতায়াত ভাতার শর্ত) */
  workplaceInCityCorp: boolean;
  washingEligible: boolean;
  chargeAllowance: boolean;
  entertainment: (typeof ENTERTAINMENT_OPTIONS)[number]['id'];
  hill: 'none' | 'sadar' | 'other';
  haor: boolean;
  trainingDeputation: boolean;
};

export type AllowanceLine = {
  key: string;
  label: string;
  amount: number;
  note?: string;
  rule: string;
};

/** ১ জানুয়ারি ২০২৮ হইতে প্রযোজ্য হারে মাসিক ভাতাদির হিসাব */
export function calculateAllowances(input: AllowanceInput): {
  lines: AllowanceLine[];
  total: number;
} {
  const lines: AllowanceLine[] = [];
  const {
    grade,
    basic,
    area,
    govtAccommodation,
    age,
    children,
    disabledChildren,
    freeLunch,
    workplaceInCityCorp,
    washingEligible,
    chargeAllowance,
    entertainment,
    hill,
    haor,
    trainingDeputation,
  } = input;

  // বাড়ি ভাড়া ভাতা — অনুচ্ছেদ ১৫
  const hrRate = houseRentRate(grade, area);
  const houseRent = govtAccommodation ? 0 : Math.round((basic * hrRate) / 100);
  lines.push({
    key: 'houseRent',
    label: 'বাড়ি ভাড়া ভাতা',
    amount: houseRent,
    note: govtAccommodation
      ? 'সরকারি বাসস্থানে বসবাস করায় প্রাপ্য নহে'
      : `মূল বেতনের ${hrRate}% হারে`,
    rule: 'অনুচ্ছেদ ১৫',
  });

  // চিকিৎসা ভাতা — অনুচ্ছেদ ১৩(১)
  const medical = medicalForServing(age);
  lines.push({
    key: 'medical',
    label: 'চিকিৎসা ভাতা',
    amount: medical,
    note: age <= 50 ? '৫০ বৎসর বয়স পর্যন্ত মাসিক ৩০০০ টাকা' : '৫০ বৎসর ১ দিন হইতে পিআরএল শেষ পর্যন্ত মাসিক ৪০০০ টাকা',
    rule: 'অনুচ্ছেদ ১৩(১)',
  });

  // শিক্ষা সহায়ক ভাতা — অনুচ্ছেদ ১৮
  const eligibleChildren = Math.min(Math.max(children, 0), EDUCATION_MAX_CHILDREN);
  const education = eligibleChildren * EDUCATION_PER_CHILD;
  lines.push({
    key: 'education',
    label: 'শিক্ষা সহায়ক ভাতা',
    amount: education,
    note: `সন্তান প্রতি ৫০০ টাকা, অনধিক ২ সন্তান (সর্বোচ্চ ১০০০ টাকা)`,
    rule: 'অনুচ্ছেদ ১৮',
  });

  // টিফিন ভাতা — অনুচ্ছেদ ১৯
  const tiffin = isTiffinEligible(grade) && !freeLunch ? TIFFIN : 0;
  lines.push({
    key: 'tiffin',
    label: 'টিফিন ভাতা',
    amount: tiffin,
    note: !isTiffinEligible(grade)
      ? '১১তম–২০তম গ্রেডের জন্য প্রযোজ্য'
      : freeLunch
        ? 'লাঞ্চ ভাতা/বিনামূল্যে দুপুরের খাবার পাওয়ায় প্রযোজ্য নহে'
        : 'মাসিক ৫০০ টাকা',
    rule: 'অনুচ্ছেদ ১৯',
  });

  // যাতায়াত ভাতা — অনুচ্ছেদ ২১(১)
  const conveyance =
    isConveyanceEligible(grade) && workplaceInCityCorp ? CONVEYANCE : 0;
  lines.push({
    key: 'conveyance',
    label: 'যাতায়াত ভাতা',
    amount: conveyance,
    note: !isConveyanceEligible(grade)
      ? '১১তম–২০তম গ্রেডের জন্য প্রযোজ্য'
      : workplaceInCityCorp
        ? 'সিটি কর্পোরেশন এলাকায় কর্মস্থল — মাসিক ৬০০ টাকা'
        : 'কর্মস্থল সিটি কর্পোরেশন এলাকায় না হওয়ায় প্রযোজ্য নহে',
    rule: 'অনুচ্ছেদ ২১(১)',
  });

  // মোবাইল ভাতা — অনুচ্ছেদ ২২
  const mobile = mobileAllowance(grade);
  lines.push({
    key: 'mobile',
    label: 'মোবাইল ভাতা',
    amount: mobile,
    note: grade <= 5 ? '৫ম গ্রেড ও তদূর্ধ্ব — মাসিক ৫০০ টাকা' : '৬ষ্ঠ–২০তম গ্রেড — মাসিক ১৫০ টাকা',
    rule: 'অনুচ্ছেদ ২২',
  });

  // ধোলাই ভাতা — অনুচ্ছেদ ২৩
  lines.push({
    key: 'washing',
    label: 'ধোলাই ভাতা',
    amount: washingEligible ? WASHING : 0,
    note: washingEligible ? 'মাসিক ৩০০ টাকা' : 'প্রযোজ্য নহে',
    rule: 'অনুচ্ছেদ ২৩',
  });

  // আপ্যায়ন ভাতা — অনুচ্ছেদ ২৪
  const ent = ENTERTAINMENT_OPTIONS.find((o) => o.id === entertainment);
  if (ent && ent.amount > 0) {
    lines.push({
      key: 'entertainment',
      label: 'আপ্যায়ন ভাতা',
      amount: ent.amount,
      note: ent.label,
      rule: 'অনুচ্ছেদ ২৪',
    });
  }

  // পাহাড়ি ভাতা — অনুচ্ছেদ ২৫
  if (hill !== 'none') {
    const cap = hill === 'sadar' ? HILL_MAX_SADAR : HILL_MAX_OTHER;
    const amount = Math.min(Math.round((basic * HILL_RATE) / 100), cap);
    lines.push({
      key: 'hill',
      label: 'পাহাড়ি ভাতা',
      amount,
      note: `মূল বেতনের ২০% হারে, সর্বোচ্চ ${cap} টাকা (${
        hill === 'sadar' ? 'জেলা সদর ও সদর উপজেলা' : 'অন্যান্য উপজেলা'
      })`,
      rule: 'অনুচ্ছেদ ২৫',
    });
  }

  // হাওড়/দ্বীপ/চর ভাতা — অনুচ্ছেদ ২৬
  if (haor) {
    const amount = Math.min(Math.round((basic * HAOR_RATE) / 100), HAOR_MAX);
    lines.push({
      key: 'haor',
      label: 'হাওড়/দ্বীপ/চর ভাতা',
      amount,
      note: 'মূল বেতনের ২০% হারে, সর্বোচ্চ ৫০০০ টাকা',
      rule: 'অনুচ্ছেদ ২৬',
    });
  }

  // প্রশিক্ষণ প্রতিষ্ঠানে প্রেষণ ভাতা — অনুচ্ছেদ ২৭
  if (trainingDeputation && grade <= 9) {
    lines.push({
      key: 'trainingDeputation',
      label: 'প্রশিক্ষণ প্রতিষ্ঠানে প্রেষণ ভাতা',
      amount: Math.round((basic * TRAINING_DEPUTATION_RATE) / 100),
      note: 'মূল বেতনের ১০% হারে (৯ম গ্রেড ও তদূর্ধ্ব)',
      rule: 'অনুচ্ছেদ ২৭',
    });
  }

  // বিশেষ চাহিদাসম্পন্ন (প্রতিবন্ধী) সন্তান ভাতা — অনুচ্ছেদ ২৮
  const disabled =
    Math.min(Math.max(disabledChildren, 0), DISABLED_CHILD_MAX_CHILDREN) *
    DISABLED_CHILD_PER_CHILD;
  if (disabled > 0) {
    lines.push({
      key: 'disabledChild',
      label: 'বিশেষ চাহিদাসম্পন্ন (প্রতিবন্ধী) সন্তান ভাতা',
      amount: disabled,
      note: 'জনপ্রতি ৩০০০ টাকা, অনধিক ২ সন্তান',
      rule: 'অনুচ্ছেদ ২৮',
    });
  }

  // কার্যভার ভাতা — অনুচ্ছেদ ২০
  if (chargeAllowance) {
    lines.push({
      key: 'charge',
      label: 'কার্যভার ভাতা',
      amount: CHARGE_ALLOWANCE,
      note: 'চলতি দায়িত্ব বা অতিরিক্ত দায়িত্ব পালনের জন্য মাসিক ১৫০০ টাকা',
      rule: 'অনুচ্ছেদ ২০',
    });
  }

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { lines, total };
}

/** বাৎসরিক প্রাপ্তি — উৎসব ভাতা, বাংলা নববর্ষ ভাতা ও শ্রান্তি বিনোদন ভাতা */
export function yearlyBenefits(basic: number) {
  return {
    festivalEach: basic,
    festivalTotal: basic * 2,
    boishakhi: Math.round((basic * BOISHAKHI_RATE) / 100),
    recreation: basic,
  };
}
