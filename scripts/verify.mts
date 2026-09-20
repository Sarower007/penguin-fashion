import { calculateFixation, nextStep } from './fixation.ts';
import { calculatePension } from './pension.ts';
import { SCALE_2015, SCALE_2026 } from './scales.ts';
import {
  SPECIAL_BENEFIT,
  specialBenefitForEmployee,
  specialBenefitForPensioner,
  specialBenefitImpact,
} from './specialBenefit.ts';

let fail = 0;
function eq(label: string, got: unknown, want: unknown) {
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: got=${got} want=${want}`);
}

// গেজেটের উদাহরণ ১ (পৃষ্ঠা ২৫১৯৯): ১৬ নং গ্রেড, প্রারম্ভিক ধাপ ৯৩০০ → ২১৯০০
const ex1 = calculateFixation({ grade: 16, currentBasic: 9300, applyJuly2026Increment: false });
eq('উদাহরণ ১ — নির্ধারিত বেতন', ex1.fixedPay, 21900);

// গেজেটের উদাহরণ ২ (পৃষ্ঠা ২৫২০০): ১১ নং গ্রেড, মূল বেতন ১৩৭৯০
const ex2 = calculateFixation({ grade: 11, currentBasic: 13790, applyJuly2026Increment: false });
eq('উদাহরণ ২ — পার্থক্য', ex2.difference, 1290);
eq('উদাহরণ ২ — যোগফল', ex2.provisional, 26290);
eq('উদাহরণ ২ — নির্ধারিত বেতন', ex2.fixedPay, 26300);

// উদাহরণ ২ + অনুচ্ছেদ ৯(২) ইনক্রিমেন্ট → পরবর্তী ধাপ ২৭৬০০
const ex2i = calculateFixation({ grade: 11, currentBasic: 13790, applyJuly2026Increment: true });
eq('উদাহরণ ২ — ইনক্রিমেন্টসহ', ex2i.newBasic, 27600);
eq('উদাহরণ ২ — বৃদ্ধি', ex2i.increase, 27600 - 13790);
eq('উদাহরণ ২ — ১ম পর্যায় (৫০%)', ex2i.phase1Pay, Math.round(13790 + (27600 - 13790) * 0.5));
eq('উদাহরণ ২ — ২য় পর্যায় (৭৫%)', ex2i.phase2Pay, Math.round(13790 + (27600 - 13790) * 0.75));
eq('উদাহরণ ২ — ১ জুলাই ২০২৭', ex2i.phase3Pay, 29000);

// ৯ম গ্রেড → ৪০%/৭০%
const g9 = calculateFixation({ grade: 9, currentBasic: 22000, applyJuly2026Increment: true });
eq('৯ম গ্রেড প্রারম্ভিক — নির্ধারণ', g9.fixedPay, 44000);
eq('৯ম গ্রেড — ইনক্রিমেন্টসহ', g9.newBasic, 46200);
eq('৯ম গ্রেড — ১ম পর্যায় হার', g9.phase1Percent, 40);
eq('৯ম গ্রেড — ২য় পর্যায় হার', g9.phase2Percent, 70);

// ১০ম গ্রেড → ৫০%/৭৫%
const g10 = calculateFixation({ grade: 10, currentBasic: 16000, applyJuly2026Increment: false });
eq('১০ম গ্রেড — ১ম পর্যায় হার', g10.phase1Percent, 50);
eq('১০ম গ্রেড — নির্ধারণ', g10.fixedPay, 32000);

// সর্বোচ্চ ধাপ পরীক্ষা: ২০তম গ্রেডের শেষ ধাপ
const g20max = calculateFixation({ grade: 20, currentBasic: 20010, applyJuly2026Increment: true });
// ২০১৫ স্কেলের সর্বোচ্চ ধাপ ২০০১০: পার্থক্য ২০০১০-৮২৫০=১১৭৬০; ২০০০০+১১৭৬০=৩১৭৬০ → পরবর্তী উচ্চতর ধাপ ৩২৬০০
eq('২০তম গ্রেড সর্বোচ্চ ধাপ — নির্ধারণ', g20max.fixedPay, 32600);
eq('২০তম গ্রেড সর্বোচ্চ ধাপ — ইনক্রিমেন্টসহ', g20max.newBasic, 34300);
// স্কেলের সর্বোচ্চ ধাপে ইনক্রিমেন্ট প্রযোজ্য নহে
eq('সর্বোচ্চ ধাপে ইনক্রিমেন্ট', nextStep(SCALE_2026[20], 48400).pay, 48400);
eq('সর্বোচ্চ ধাপ চিহ্নিত', nextStep(SCALE_2026[20], 48400).atMax, true);

// ১ম গ্রেড (নির্ধারিত)
const g1 = calculateFixation({ grade: 1, currentBasic: 78000, applyJuly2026Increment: true });
eq('১ম গ্রেড — নির্ধারিত বেতন', g1.newBasic, 156000);

// অনুচ্ছেদ ৩(২)
const cab = calculateFixation({ grade: 1, currentBasic: 86000, specialPost: 'cabinet', applyJuly2026Increment: true });
eq('মন্ত্রিপরিষদ সচিব', cab.newBasic, 172000);

// পেনশন — সারণি যাচাই
const p1 = calculatePension({ currentNetPension: 8000, applyJuly2026Increment: false, incrementRate: 5, age: 65 });
eq('পেনশন ৮০০০ (১০০%)', p1.fixedNetPension, 16000);
const p2 = calculatePension({ currentNetPension: 4000, applyJuly2026Increment: false, incrementRate: 5, age: 65 });
eq('পেনশন ৪০০০ → ন্যূনতম ১০০০০', p2.fixedNetPension, 10000);
const p3 = calculatePension({ currentNetPension: 9000, applyJuly2026Increment: false, incrementRate: 5, age: 65 });
eq('পেনশন ৯০০০ → সর্বোচ্চ ১৮০০০', p3.fixedNetPension, 18000);
const p4 = calculatePension({ currentNetPension: 15000, applyJuly2026Increment: false, incrementRate: 5, age: 65 });
eq('পেনশন ১৫০০০ (৭৫%)', p4.fixedNetPension, 26250);
eq('পেনশন ১৫০০০ — ১ম পর্যায় হার', p4.phase1Percent, 50);
const p5 = calculatePension({ currentNetPension: 25000, applyJuly2026Increment: false, incrementRate: 5, age: 65 });
eq('পেনশন ২৫০০০ (৬৫%)', p5.fixedNetPension, 41250);
eq('পেনশন ২৫০০০ — ১ম পর্যায় হার', p5.phase1Percent, 40);
const p6 = calculatePension({ currentNetPension: 50000, applyJuly2026Increment: false, incrementRate: 5, age: 65 });
eq('পেনশন ৫০০০০ (৫৫%) → সর্বোচ্চ ৭০২০০', p6.fixedNetPension, 70200);

// ── বিশেষ সুবিধা (১ জুলাই ২০২৫ হইতে কার্যকর প্রজ্ঞাপন) ─────────────────
// গ্রেড ১–৯: মূল বেতনের ১০%; গ্রেড ১০–২০: ১৫%; ন্যূনতম ১৫০০ টাকা
eq('বিশেষ সুবিধা — ৯ম গ্রেড হার', specialBenefitForEmployee(9, 30000).rate, 10);
eq('বিশেষ সুবিধা — ৯ম গ্রেড অঙ্ক', specialBenefitForEmployee(9, 30000).amount, 3000);
eq('বিশেষ সুবিধা — ১০ম গ্রেড হার', specialBenefitForEmployee(10, 16000).rate, 15);
eq('বিশেষ সুবিধা — ১০ম গ্রেড অঙ্ক', specialBenefitForEmployee(10, 16000).amount, 2400);
// ন্যূনতম সীমা: ২০তম গ্রেডের প্রারম্ভিক ধাপ ৮২৫০ × ১৫% = ১২৩৮ < ১৫০০
eq('বিশেষ সুবিধা — ন্যূনতম ১৫০০ প্রযোজ্য', specialBenefitForEmployee(20, 8250).amount, 1500);
eq('বিশেষ সুবিধা — ন্যূনতম প্রয়োগ চিহ্নিত', specialBenefitForEmployee(20, 8250).minimumApplied, true);
eq('বিশেষ সুবিধা — কর্মচারীর ন্যূনতম', SPECIAL_BENEFIT.employeeMinimum, 1500);
// পেনশনভোগী: নিট পেনশনের ১৫%, ন্যূনতম ৭৫০
eq('বিশেষ সুবিধা — পেনশনভোগী অঙ্ক', specialBenefitForPensioner(15000).amount, 2250);
eq('বিশেষ সুবিধা — পেনশনভোগী ন্যূনতম ৭৫০', specialBenefitForPensioner(4000).amount, 750);

// ── বিলুপ্তি ও বকেয়া সমন্বয় (অনুচ্ছেদ ১(৩)(ট)) ───────────────────────
// ১১তম গ্রেড / ১৩৭৯০ → ২৭৬০০; ১ম পর্যায়ে (৫০%) বৃদ্ধি ৬৯০৫
{
  const f = calculateFixation({ grade: 11, currentBasic: 13790, applyJuly2026Increment: true });
  const sb = specialBenefitForEmployee(11, 13790); // ১৩৭৯০ × ১৫% = ২০৬৯
  eq('সমন্বয় — বিশেষ সুবিধা অঙ্ক', sb.amount, 2069);
  const im = specialBenefitImpact(f.phase1Pay - f.currentBasic, sb.amount, 3);
  eq('সমন্বয় — মাসিক গ্রস বৃদ্ধি', f.phase1Pay - f.currentBasic, 6905);
  eq('সমন্বয় — প্রকৃত নিট বৃদ্ধি', im.netIncrease, 6905 - 2069);
  eq('সমন্বয় — ৩ মাসের গ্রস বকেয়া', im.grossArrear, 6905 * 3);
  eq('সমন্বয় — সমন্বয়যোগ্য অঙ্ক', im.adjustment, 2069 * 3);
  eq('সমন্বয় — নিট বকেয়া', im.netArrear, (6905 - 2069) * 3);
}

// স্কেল ডেটা অখণ্ডতা
for (const [g, steps] of Object.entries(SCALE_2026)) {
  for (let i = 1; i < steps.length; i++) {
    if (steps[i] <= steps[i - 1]) { console.log(`FAIL ২০২৬ গ্রেড ${g} ধাপ ক্রম ভুল`); fail++; }
  }
}
for (const [g, steps] of Object.entries(SCALE_2015)) {
  for (let i = 1; i < steps.length; i++) {
    if (steps[i] <= steps[i - 1]) { console.log(`FAIL ২০১৫ গ্রেড ${g} ধাপ ক্রম ভুল`); fail++; }
  }
}
console.log(fail === 0 ? '\nসকল পরীক্ষা উত্তীর্ণ ✅' : `\n${fail}টি পরীক্ষা ব্যর্থ ❌`);
process.exit(fail === 0 ? 0 : 1);
