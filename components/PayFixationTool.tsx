'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  GRADES,
  GradeNo,
  SCALE_2015,
  SCALE_2026,
  FIXED_PAY_POSTS,
} from '@/lib/scales';
import {
  calculateFixation,
  calculateNewAppointment,
  JoinPhase,
  SpecialPostId,
} from '@/lib/fixation';
import { buildPayRow } from '@/lib/deductions';
import {
  SPECIAL_BENEFIT,
  specialBenefitForEmployee,
  specialBenefitImpact,
} from '@/lib/specialBenefit';
import { bnNumber, bnOrdinal, bnTaka, parseAmount, toBn } from '@/lib/bn';

export default function PayFixationTool() {
  const [grade, setGrade] = useState<GradeNo>(10);
  const [basicMode, setBasicMode] = useState<'step' | 'custom'>('step');
  const [stepValue, setStepValue] = useState<number>(SCALE_2015[10][0]);
  const [customBasic, setCustomBasic] = useState<string>('');
  const [specialPost, setSpecialPost] = useState<SpecialPostId | ''>('');
  const [withIncrement, setWithIncrement] = useState(true);
  const [arrearMonths, setArrearMonths] = useState('৩');
  const [sbMode, setSbMode] = useState<'auto' | 'manual'>('auto');
  const [sbManual, setSbManual] = useState('');
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [advInc, setAdvInc] = useState('০');
  const [joinPhase, setJoinPhase] = useState<JoinPhase>('phase1');
  const [monthlyAllowance, setMonthlyAllowance] = useState('');
  const [gpfPercent, setGpfPercent] = useState('');
  const [otherDeduction, setOtherDeduction] = useState('');

  // ইনপুটসমূহ ব্রাউজারে সংরক্ষিত থাকে, ফলে পরে ফিরিয়া আসিলেও পূরণ করিতে হয় না
  useEffect(() => {
    try {
      const raw = localStorage.getItem('payscale2026-fixation');
      if (!raw) return;
      const v = JSON.parse(raw);
      if (v.grade) setGrade(v.grade);
      if (v.basicMode) setBasicMode(v.basicMode);
      if (typeof v.stepValue === 'number') setStepValue(v.stepValue);
      if (typeof v.customBasic === 'string') setCustomBasic(v.customBasic);
      if (typeof v.specialPost === 'string') setSpecialPost(v.specialPost);
      if (typeof v.withIncrement === 'boolean') setWithIncrement(v.withIncrement);
      if (typeof v.arrearMonths === 'string') setArrearMonths(v.arrearMonths);
      if (v.sbMode) setSbMode(v.sbMode);
      if (typeof v.sbManual === 'string') setSbManual(v.sbManual);
      if (v.mode) setMode(v.mode);
      if (typeof v.advInc === 'string') setAdvInc(v.advInc);
      if (v.joinPhase) setJoinPhase(v.joinPhase);
      if (typeof v.monthlyAllowance === 'string')
        setMonthlyAllowance(v.monthlyAllowance);
      if (typeof v.gpfPercent === 'string') setGpfPercent(v.gpfPercent);
      if (typeof v.otherDeduction === 'string')
        setOtherDeduction(v.otherDeduction);
    } catch {
      /* সংরক্ষিত তথ্য পড়া না গেলে ডিফল্ট মানই থাকিবে */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        'payscale2026-fixation',
        JSON.stringify({
          grade, basicMode, stepValue, customBasic, specialPost, withIncrement,
          arrearMonths, sbMode, sbManual, mode, advInc, joinPhase,
          monthlyAllowance, gpfPercent, otherDeduction,
        }),
      );
    } catch {
      /* স্টোরেজ বন্ধ থাকিলে উপেক্ষা করা হয় */
    }
  }, [
    grade, basicMode, stepValue, customBasic, specialPost, withIncrement,
    arrearMonths, sbMode, sbManual, mode, advInc, joinPhase, monthlyAllowance,
    gpfPercent, otherDeduction,
  ]);

  const scale2015 = SCALE_2015[grade];
  const scale2026 = SCALE_2026[grade];

  const currentBasic =
    basicMode === 'step' ? stepValue : (parseAmount(customBasic) ?? 0);

  const result = useMemo(() => {
    if (!currentBasic || currentBasic <= 0) return null;
    return calculateFixation({
      grade,
      currentBasic,
      specialPost: specialPost === '' ? null : specialPost,
      applyJuly2026Increment: withIncrement,
    });
  }, [grade, currentBasic, specialPost, withIncrement]);

  const autoSB =
    currentBasic > 0 ? specialBenefitForEmployee(grade, currentBasic) : null;
  const specialBenefit =
    sbMode === 'auto'
      ? (autoSB?.amount ?? 0)
      : Math.max(0, parseAmount(sbManual) ?? 0);

  const newAppointment = useMemo(
    () =>
      mode === 'new'
        ? calculateNewAppointment(
            grade,
            Math.floor(parseAmount(advInc) ?? 0),
            joinPhase,
          )
        : null,
    [mode, grade, advInc, joinPhase],
  );

  const allowance = Math.max(0, parseAmount(monthlyAllowance) ?? 0);
  const deductions = {
    gpfPercent: Math.max(0, parseAmount(gpfPercent) ?? 0),
    otherDeduction: Math.max(0, parseAmount(otherDeduction) ?? 0),
  };
  const showTotals =
    allowance > 0 || deductions.gpfPercent > 0 || deductions.otherDeduction > 0;

  const months = Math.max(0, Math.floor(parseAmount(arrearMonths) ?? 0));
  const impact = result
    ? specialBenefitImpact(
        result.phase1Pay - result.currentBasic,
        specialBenefit,
        months,
      )
    : null;

  function handleGradeChange(g: GradeNo) {
    setGrade(g);
    setStepValue(SCALE_2015[g][0]);
    if (g !== 1) setSpecialPost('');
  }

  return (
    <>
      <div className="card">
        <h3>আপনার তথ্য দিন</h3>

        <div className="seg" role="radiogroup" aria-label="কর্মচারীর ধরন">
          <button
            type="button"
            role="radio"
            aria-checked={mode === 'existing'}
            onClick={() => setMode('existing')}
          >
            ৩০ জুন ২০২৬ এ কর্মরত
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={mode === 'new'}
            onClick={() => setMode('new')}
          >
            ১ জুলাই ২০২৬ বা পরে নিয়োগ
          </button>
        </div>

        <div className="grid">
          <div className="field">
            <label htmlFor="grade">
              {mode === 'existing'
                ? 'বর্তমান গ্রেড (জাতীয় বেতনস্কেল, ২০১৫)'
                : 'নিয়োগকৃত পদের গ্রেড'}
            </label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => handleGradeChange(Number(e.target.value) as GradeNo)}
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {bnOrdinal(g)} গ্রেড — {bnNumber(SCALE_2015[g][0])}
                  {SCALE_2015[g].length > 1
                    ? `–${bnNumber(SCALE_2015[g][SCALE_2015[g].length - 1])}`
                    : ' (নির্ধারিত)'}
                </option>
              ))}
            </select>
            <span className="hint">
              {mode === 'existing'
                ? '৩০ জুন ২০২৬ তারিখে আপনি যে গ্রেডে বেতন আহরণ করিতেছিলেন।'
                : 'জাতীয় বেতনস্কেল, ২০২৬ এ নিয়োগকৃত পদের গ্রেড।'}
            </span>
          </div>

          {mode === 'existing' && (
            <>
          <div className="field">
            <label htmlFor="basicMode">মূল বেতন প্রদানের পদ্ধতি</label>
            <select
              id="basicMode"
              value={basicMode}
              onChange={(e) => setBasicMode(e.target.value as 'step' | 'custom')}
            >
              <option value="step">স্কেলের ধাপ হইতে নির্বাচন</option>
              <option value="custom">নিজে অঙ্ক লিখিব</option>
            </select>
            <span className="hint">
              উচ্চতর গ্রেড/টাইম স্কেলপ্রাপ্ত হইলে প্রাপ্ত স্কেলের ধাপ নির্বাচন করুন।
            </span>
          </div>

          {basicMode === 'step' ? (
            <div className="field">
              <label htmlFor="step">
                ৩০ জুন ২০২৬ তারিখে মূল বেতন (বর্তমান বেতন)
              </label>
              <select
                id="step"
                value={stepValue}
                onChange={(e) => setStepValue(Number(e.target.value))}
              >
                {scale2015.map((s, i) => (
                  <option key={s} value={s}>
                    {bnNumber(s)} টাকা — {toBn(i + 1)} নং ধাপ
                  </option>
                ))}
              </select>
              <span className="hint">
                এই গ্রেডে মোট {toBn(scale2015.length)}টি ধাপ রহিয়াছে।
              </span>
            </div>
          ) : (
            <div className="field">
              <label htmlFor="custom">
                ৩০ জুন ২০২৬ তারিখে মূল বেতন (টাকা)
              </label>
              <input
                id="custom"
                type="text"
                inputMode="numeric"
                placeholder="যেমন: ১৬৭৪০"
                value={customBasic}
                onChange={(e) => setCustomBasic(e.target.value)}
              />
              <span className="hint">বাংলা বা ইংরেজি — যে কোনও অঙ্কে লিখিতে পারেন।</span>
            </div>
          )}

          <div className="field">
            <label htmlFor="special">নির্ধারিত বেতনের পদ (অনুচ্ছেদ ৩(২))</label>
            <select
              id="special"
              value={specialPost}
              onChange={(e) => {
                const id = e.target.value as SpecialPostId | '';
                setSpecialPost(id);
                const post = FIXED_PAY_POSTS.find((x) => x.id === id);
                if (post) {
                  setBasicMode('custom');
                  setCustomBasic(toBn(post.pay2015));
                }
              }}
            >
              <option value="">প্রযোজ্য নহে</option>
              {FIXED_PAY_POSTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} — {bnNumber(p.pay2026)} টাকা
                </option>
              ))}
            </select>
            <span className="hint">
              সাধারণ কর্মচারীর ক্ষেত্রে ‘প্রযোজ্য নহে’ রাখুন।
            </span>
          </div>

          <div className="field">
            <label htmlFor="arrear">বকেয়ার মাস সংখ্যা</label>
            <input
              id="arrear"
              type="text"
              inputMode="numeric"
              value={arrearMonths}
              onChange={(e) => setArrearMonths(e.target.value)}
            />
            <span className="hint">
              অনুচ্ছেদ ১(৩)(ঘ): ১ জুলাই ২০২৬ হইতে আদেশ জারির তারিখ পর্যন্ত সময়ের বেতন
              বকেয়া হিসাবে প্রাপ্য।
            </span>
          </div>

          <div className="field">
            <label htmlFor="sbmode">বিশেষ সুবিধা (৩০ জুন ২০২৬ তারিখে আহরিত)</label>
            <select
              id="sbmode"
              value={sbMode}
              onChange={(e) => setSbMode(e.target.value as 'auto' | 'manual')}
            >
              <option value="auto">প্রজ্ঞাপন অনুযায়ী স্বয়ংক্রিয় হিসাব</option>
              <option value="manual">নিজে অঙ্ক লিখিব</option>
            </select>
            <span className="hint">
              {autoSB
                ? `${bnOrdinal(grade)} গ্রেডে মূল বেতনের ${toBn(autoSB.rate)}% = ${bnNumber(autoSB.calculated)} টাকা${
                    autoSB.minimumApplied
                      ? `; ন্যূনতম ১৫০০ টাকা প্রযোজ্য হওয়ায় ${bnNumber(autoSB.amount)} টাকা`
                      : ''
                  }`
                : 'মূল বেতন নির্বাচন করুন।'}
            </span>
          </div>

          {sbMode === 'manual' && (
            <div className="field">
              <label htmlFor="sbamount">আহরিত মাসিক বিশেষ সুবিধা (টাকা)</label>
              <input
                id="sbamount"
                type="text"
                inputMode="numeric"
                placeholder={autoSB ? toBn(autoSB.amount) : 'যেমন: ২৪০০'}
                value={sbManual}
                onChange={(e) => setSbManual(e.target.value)}
              />
              <span className="hint">
                বেতন বিলে আপনি প্রকৃতপক্ষে যে অঙ্ক পাইতেছিলেন তাহা লিখুন।
              </span>
            </div>
          )}
            </>
          )}

          {mode === 'new' && (
            <>
              <div className="field">
                <label htmlFor="adv">অগ্রিম বেতনবৃদ্ধি (increment) সংখ্যা</label>
                <select
                  id="adv"
                  value={advInc}
                  onChange={(e) => setAdvInc(e.target.value)}
                >
                  <option value="০">০ — কোনও অগ্রিম ইনক্রিমেন্ট নাই</option>
                  <option value="১">
                    ১টি — এম.বি.বি.এস./ব্যাচেলর অব আর্কিটেকচার/ইঞ্জিনিয়ারিং ডিগ্রি বা
                    চিকিৎসা অনুষদের লাইসেন্স
                  </option>
                  <option value="২">
                    ২টি — ইঞ্জিনিয়ারিং/স্থাপত্যবিদ্যায় ডিগ্রি বা মাস্টার্সসহ ফিজিক্যাল
                    প্ল্যানিং, অথবা আইনে স্নাতক (সম্মান)সহ স্নাতকোত্তর
                  </option>
                </select>
                <span className="hint">
                  অনুচ্ছেদ ১০(১): কেবল ৯ম গ্রেড (৪৪০০০–১০৫৯০০) বা তদূর্ধ্ব স্কেলের পদে
                  প্রথম নিয়োগের ক্ষেত্রে প্রযোজ্য। বিসিএস ক্যাডারভুক্ত হিসাবে ৯ম গ্রেডে
                  সরাসরি নিয়োগপ্রাপ্তগণ ১টি অতিরিক্ত অগ্রিম বেতনবৃদ্ধি পাইবেন।
                </span>
              </div>

              <div className="field">
                <label htmlFor="join">যোগদানের সময়</label>
                <select
                  id="join"
                  value={joinPhase}
                  onChange={(e) => setJoinPhase(e.target.value as JoinPhase)}
                >
                  <option value="phase1">১ জুলাই ২০২৬ – ৩১ ডিসেম্বর ২০২৬</option>
                  <option value="phase2">১ জানুয়ারি ২০২৭ – ৩০ জুন ২০২৭</option>
                  <option value="phase3">১ জুলাই ২০২৭ বা তৎপরবর্তী</option>
                </select>
                <span className="hint">
                  অনুচ্ছেদ ১০(৪): ১ জুলাই ২০২৬ – ৩০ জুন ২০২৭ সময়ে নিয়োগপ্রাপ্তগণও
                  পর্যায়ভিত্তিক হারে বেতন পাইবেন।
                </span>
              </div>
            </>
          )}
        </div>

        {mode === 'existing' && (
          <div style={{ marginTop: 14 }}>
            <label className="check">
              <input
                type="checkbox"
                checked={withIncrement}
                onChange={(e) => setWithIncrement(e.target.checked)}
              />
              <span>
                অনুচ্ছেদ ৯(২) অনুযায়ী ১ জুলাই ২০২৬ তারিখে ১টি বার্ষিক বেতনবৃদ্ধি
                (ইনক্রিমেন্ট) যোগ করুন — <strong>সাধারণভাবে প্রযোজ্য</strong>
                <small>
                  শর্ত: নূতন যোগদানকৃত কর্মচারীর কোয়ালিফাইং চাকরির মেয়াদ ন্যূনতম ৬
                  (ছয়) মাস হইলে তিনি এই সুবিধা প্রাপ্য হইবেন।
                </small>
              </span>
            </label>
          </div>
        )}

        {mode === 'existing' && (
          <details className="disclosure">
            <summary>
              ভাতা ও কর্তন যোগ করিয়া মোট প্রাপ্তি (গ্রস ও নিট) দেখুন — ঐচ্ছিক
            </summary>
            <div className="grid" style={{ marginTop: 12 }}>
              <div className="field">
                <label htmlFor="mAllow">
                  ৩০ জুন ২০২৬ তারিখে প্রাপ্ত মোট মাসিক ভাতা (টাকা)
                </label>
                <input
                  id="mAllow"
                  type="text"
                  inputMode="numeric"
                  placeholder="যেমন: ১২৫০০"
                  value={monthlyAllowance}
                  onChange={(e) => setMonthlyAllowance(e.target.value)}
                />
                <span className="hint">
                  বাড়ি ভাড়া, চিকিৎসা, টিফিন, যাতায়াত ইত্যাদির যোগফল — বিশেষ সুবিধা
                  বাদে। এই অঙ্কই ৩১ ডিসেম্বর ২০২৭ পর্যন্ত অপরিবর্তিত থাকিবে।
                </span>
              </div>
              <div className="field">
                <label htmlFor="gpf">জিপিএফ চাঁদা (মূল বেতনের %)</label>
                <input
                  id="gpf"
                  type="text"
                  inputMode="decimal"
                  placeholder="যেমন: ১০"
                  value={gpfPercent}
                  onChange={(e) => setGpfPercent(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="oded">অন্যান্য মাসিক কর্তন (টাকা)</label>
                <input
                  id="oded"
                  type="text"
                  inputMode="numeric"
                  placeholder="যেমন: ৫০০"
                  value={otherDeduction}
                  onChange={(e) => setOtherDeduction(e.target.value)}
                />
                <span className="hint">
                  কল্যাণ তহবিল ও যৌথবীমা, রাজস্ব স্ট্যাম্প, আয়কর, ঋণের কিস্তি ইত্যাদি।
                </span>
              </div>
            </div>
          </details>
        )}
      </div>

      {mode === 'new' && newAppointment && (
        <>
          <div className="headline">
            <div className="stat">
              <div className="stat-label">স্কেলের প্রারম্ভিক ধাপ</div>
              <div className="stat-value">{bnTaka(scale2026[0])}</div>
              <div className="stat-sub">{bnOrdinal(grade)} গ্রেড</div>
            </div>
            <div className="stat">
              <div className="stat-label">অগ্রিম ইনক্রিমেন্টসহ মূল বেতন</div>
              <div className="stat-value">{bnTaka(newAppointment.newBasic)}</div>
              <div className="stat-sub">
                {toBn(newAppointment.advanceIncrements)}টি অগ্রিম ইনক্রিমেন্ট
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">যোগদানকালে প্রদেয় মূল বেতন</div>
              <div className="stat-value brand">
                {bnTaka(newAppointment.payable)}
              </div>
              <div className="stat-sub">
                পর্যায়ভিত্তিক হার {toBn(newAppointment.percent)}%
              </div>
            </div>
          </div>

          <div className="card">
            <h3>প্রথম নিয়োগে বেতন নির্ধারণ (অনুচ্ছেদ ১০)</h3>
            <div className="table-wrap stack">
              <table>
                <thead>
                  <tr>
                    <th>বিবরণ</th>
                    <th className="num">টাকা</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>জাতীয় বেতনস্কেল, ২০২৬ এ নির্ধারিত মূল বেতন</td>
                    <td className="num" data-label="টাকা">
                      {bnNumber(newAppointment.newBasic)}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      ৩০ জুন ২০২৬ তারিখে যোগদান করিলে বর্তমান স্কেলে প্রাপ্য হইতেন
                    </td>
                    <td className="num" data-label="টাকা">
                      {bnNumber(newAppointment.equivalentCurrent)}
                    </td>
                  </tr>
                  <tr>
                    <td>পার্থক্য</td>
                    <td className="num" data-label="টাকা">
                      {bnNumber(newAppointment.difference)}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      পার্থক্যের প্রযোজ্য অংশ ({toBn(newAppointment.percent)}%)
                    </td>
                    <td className="num" data-label="টাকা">
                      {bnNumber(
                        newAppointment.payable -
                          newAppointment.equivalentCurrent,
                      )}
                    </td>
                  </tr>
                  <tr className="total">
                    <td>যোগদানকালে প্রদেয় মূল বেতন</td>
                    <td className="num" data-label="টাকা">
                      {bnNumber(newAppointment.payable)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="alert alert-info" style={{ marginTop: 12 }}>
              অনুচ্ছেদ ১২(২): ১ জুলাই ২০২৬ হইতে ৩১ ডিসেম্বর ২০২৭ পর্যন্ত সময়ে
              নবনিয়োগপ্রাপ্ত কর্মচারীগণ ৩০ জুন ২০২৬ তারিখে নিয়োগপ্রাপ্ত হইলে যে হারে
              বা পরিমাণে ভাতাদি প্রাপ্ত হইতেন, সেই হারে বা পরিমাণে ৩১ ডিসেম্বর ২০২৭
              তারিখ পর্যন্ত আহরণ করিবেন।
            </div>
            <ul className="note-list" style={{ marginTop: 12 }}>
              {newAppointment.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      {mode === 'existing' && !result && (
        <div className="alert alert-info">
          হিসাব দেখিতে গ্রেড ও ৩০ জুন ২০২৬ তারিখের মূল বেতন নির্বাচন করুন।
        </div>
      )}

      {mode === 'existing' && result && (
        <>
          {result.warnings.map((w, i) => (
            <div className="alert alert-warn" key={i}>
              ⚠️ {w}
            </div>
          ))}

          <div className="headline">
            <div className="stat">
              <div className="stat-label">বর্তমান মূল বেতন (৩০ জুন ২০২৬)</div>
              <div className="stat-value">{bnTaka(result.currentBasic)}</div>
              <div className="stat-sub">জাতীয় বেতনস্কেল, ২০১৫</div>
            </div>
            <div className="stat">
              <div className="stat-label">অনুচ্ছেদ ৫ অনুযায়ী নির্ধারিত বেতন</div>
              <div className="stat-value">{bnTaka(result.fixedPay)}</div>
              <div className="stat-sub">
                {result.isSpecialFixed
                  ? 'নির্ধারিত বেতন'
                  : `${toBn(result.fixedStepIndex + 1)} নং ধাপ`}
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">
                নতুন মূল বেতন {result.incrementApplied ? '(ইনক্রিমেন্টসহ)' : ''}
              </div>
              <div className="stat-value brand">{bnTaka(result.newBasic)}</div>
              <div className="stat-sub">
                জাতীয় বেতনস্কেল, ২০২৬ · ১ জুলাই ২০২৬
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">মোট বেতনবৃদ্ধি</div>
              <div className="stat-value brand">{bnTaka(result.increase)}</div>
              <div className="stat-sub">
                বৃদ্ধির হার {bnNumber(result.increasePercent, 2)}%
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">
                ১ম পর্যায়ে প্রকৃত নিট বৃদ্ধি (বিশেষ সুবিধা বাদে)
              </div>
              <div
                className={
                  'stat-value ' + ((impact?.netIncrease ?? 0) >= 0 ? 'brand' : '')
                }
                style={
                  (impact?.netIncrease ?? 0) < 0
                    ? { color: 'var(--danger)' }
                    : undefined
                }
              >
                {bnTaka(impact?.netIncrease ?? 0)}
              </div>
              <div className="stat-sub">
                বিশেষ সুবিধা {bnTaka(specialBenefit)} বিলুপ্ত হওয়ায়
              </div>
            </div>
          </div>

          <div className="btn-row" style={{ marginBottom: 16 }}>
            <button
              type="button"
              className="btn"
              onClick={() => window.print()}
            >
              🖨️ হিসাব প্রিন্ট / PDF সংরক্ষণ করুন
            </button>
          </div>

          <div className="card">
            <h3>ধাপে ধাপে হিসাব</h3>
            <div className="table-wrap stack">
              <table>
                <thead>
                  <tr>
                    <th>ক্রম</th>
                    <th>বিবরণ</th>
                    <th className="num">টাকা</th>
                    <th>বিধি</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td data-label="ক্রম">১</td>
                    <td>৩০ জুন ২০২৬ তারিখে আহরিত/প্রাপ্য মূল বেতন</td>
                    <td className="num" data-label="টাকা">
                      {bnNumber(result.currentBasic)}
                    </td>
                    <td className="rule-ref" data-label="বিধি">অনুচ্ছেদ ২(খ)</td>
                  </tr>
                  {!result.isSpecialFixed && (
                    <>
                      <tr>
                        <td data-label="ক্রম">২</td>
                        <td>বর্তমান বেতনস্কেলের প্রারম্ভিক ধাপ</td>
                        <td className="num" data-label="টাকা">
                          {bnNumber(result.scale2015[0])}
                        </td>
                        <td className="rule-ref" data-label="বিধি">অনুচ্ছেদ ৩(১)</td>
                      </tr>
                      <tr>
                        <td data-label="ক্রম">৩</td>
                        <td>পার্থক্য (ক্রম ১ − ক্রম ২)</td>
                        <td className="num" data-label="টাকা">
                          {bnNumber(result.difference)}
                        </td>
                        <td className="rule-ref" data-label="বিধি">অনুচ্ছেদ ৫(খ)</td>
                      </tr>
                      <tr>
                        <td data-label="ক্রম">৪</td>
                        <td>জাতীয় বেতনস্কেল, ২০২৬ এর অনুরূপ স্কেলের প্রারম্ভিক ধাপ</td>
                        <td className="num" data-label="টাকা">
                          {bnNumber(result.scale2026[0])}
                        </td>
                        <td className="rule-ref" data-label="বিধি">অনুচ্ছেদ ৩(১)</td>
                      </tr>
                      <tr>
                        <td data-label="ক্রম">৫</td>
                        <td>যোগফল (ক্রম ৪ + ক্রম ৩)</td>
                        <td className="num" data-label="টাকা">
                          {bnNumber(result.provisional)}
                        </td>
                        <td className="rule-ref" data-label="বিধি">অনুচ্ছেদ ৫(খ)</td>
                      </tr>
                      <tr>
                        <td data-label="ক্রম">৬</td>
                        <td>
                          নির্ধারিত বেতন —{' '}
                          {result.fixedExactMatch
                            ? 'যোগফলের সমান ধাপ পাওয়া গিয়াছে'
                            : 'সমান ধাপ না থাকায় পরবর্তী উচ্চতর ধাপ'}
                        </td>
                        <td className="num" data-label="টাকা">
                          {bnNumber(result.fixedPay)}
                        </td>
                        <td className="rule-ref" data-label="বিধি">
                          অনুচ্ছেদ ৫(খ)({result.fixedExactMatch ? 'অ' : 'আ'})
                        </td>
                      </tr>
                    </>
                  )}
                  {result.incrementApplied && (
                    <tr>
                      <td data-label="ক্রম">{result.isSpecialFixed ? '২' : '৭'}</td>
                      <td>১ জুলাই ২০২৬ তারিখে ১টি বার্ষিক বেতনবৃদ্ধি (পরবর্তী ধাপ)</td>
                      <td className="num" data-label="টাকা">
                        {bnNumber(result.newBasic)}
                      </td>
                      <td className="rule-ref" data-label="বিধি">অনুচ্ছেদ ৯(২)</td>
                    </tr>
                  )}
                  <tr className="total">
                    <td className="hide-sm" />
                    <td>জাতীয় বেতনস্কেল, ২০২৬ এ নির্ধারিত মূল বেতন</td>
                    <td className="num" data-label="টাকা">
                      {bnNumber(result.newBasic)}
                    </td>
                    <td className="hide-sm" />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3>পর্যায়ভিত্তিক প্রদেয় মূল বেতন (অনুচ্ছেদ ১(৩))</h3>
            <p style={{ marginTop: -6, color: 'var(--ink-soft)', fontSize: '.92rem' }}>
              বেতনবৃদ্ধি বাবদ মোট অঙ্ক {bnTaka(result.increase)} ধাপে ধাপে প্রদান করা
              হইবে। আপনার গ্রেড {bnOrdinal(result.grade)} হওয়ায় হার{' '}
              {toBn(result.phase1Percent)}% ও {toBn(result.phase2Percent)}%।
            </p>
            <div className="table-wrap stack">
              <table>
                <thead>
                  <tr>
                    <th>সময়কাল</th>
                    <th className="num">হার</th>
                    <th className="num">প্রদেয় মূল বেতন</th>
                    <th className="num">মোট বৃদ্ধি</th>
                    <th className="num">বিশেষ সুবিধা বিলুপ্ত (−)</th>
                    <th className="num">প্রকৃত নিট বৃদ্ধি</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      key: 'p1',
                      period: '১ জুলাই ২০২৬ – ৩১ ডিসেম্বর ২০২৬',
                      rate: `${toBn(result.phase1Percent)}%`,
                      pay: result.phase1Pay,
                      atMax: false,
                    },
                    {
                      key: 'p2',
                      period: '১ জানুয়ারি ২০২৭ – ৩০ জুন ২০২৭',
                      rate: `${toBn(result.phase2Percent)}%`,
                      pay: result.phase2Pay,
                      atMax: false,
                    },
                    {
                      key: 'p3',
                      period: '১ জুলাই ২০২৭ হইতে (বার্ষিক ইনক্রিমেন্টসহ শতভাগ)',
                      rate: '১০০%',
                      pay: result.phase3Pay,
                      atMax: result.phase3AtMax,
                    },
                  ].map((row) => {
                    const gross = row.pay - result.currentBasic;
                    const net = gross - specialBenefit;
                    return (
                      <tr key={row.key}>
                        <td>
                          {row.period}
                          {row.atMax && (
                            <div className="rule-ref">সর্বোচ্চ ধাপ</div>
                          )}
                        </td>
                        <td className="num" data-label="হার">
                          {row.rate}
                        </td>
                        <td className="num" data-label="প্রদেয় মূল বেতন">
                          <strong>{bnNumber(row.pay)}</strong>
                        </td>
                        <td className="num" data-label="মোট বৃদ্ধি">
                          {bnNumber(gross)}
                        </td>
                        <td className="num" data-label="বিশেষ সুবিধা বিলুপ্ত (−)">
                          {bnNumber(specialBenefit)}
                        </td>
                        <td
                          className="num"
                          data-label="প্রকৃত নিট বৃদ্ধি"
                          style={net < 0 ? { color: 'var(--danger)' } : undefined}
                        >
                          <strong>{bnNumber(net)}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="alert alert-info" style={{ marginTop: 12 }}>
              ১ জুলাই ২০২৬ – ৩১ ডিসেম্বর ২০২৭ সময়ে ভাতাদি (উৎসব ভাতা ও বাংলা নববর্ষ
              ভাতাসহ) ৩০ জুন ২০২৬ তারিখের প্রাপ্য অঙ্কেই প্রদেয় হইবে; ১ জানুয়ারি ২০২৮
              তারিখ হইতে এই আদেশে নির্ধারিত হারে ভাতাদি প্রদেয় হইবে — অনুচ্ছেদ ১(৩)(ঞ)
              ও ১২।
            </div>
          </div>

          {showTotals && (
            <div className="card">
              <h3>পর্যায়ভিত্তিক মোট প্রাপ্তি — গ্রস ও নিট</h3>
              <p style={{ marginTop: -6, color: 'var(--ink-soft)', fontSize: '.92rem' }}>
                মাসিক ভাতা {bnTaka(allowance)} ৩১ ডিসেম্বর ২০২৭ পর্যন্ত অপরিবর্তিত
                থাকিবে (অনুচ্ছেদ ১(৩)(ঞ))। ১ জানুয়ারি ২০২৮ হইতে নূতন হারে ভাতার হিসাব
                “মাসিক বেতন ও ভাতা” পাতায় দেখুন।
              </p>
              <div className="table-wrap stack">
                <table>
                  <thead>
                    <tr>
                      <th>সময়কাল</th>
                      <th className="num">মূল বেতন</th>
                      <th className="num">ভাতাদি</th>
                      <th className="num">বিশেষ সুবিধা</th>
                      <th className="num">গ্রস</th>
                      <th className="num">কর্তন</th>
                      <th className="num">নিট</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      buildPayRow(
                        '৩০ জুন ২০২৬ পর্যন্ত (বর্তমান)',
                        result.currentBasic,
                        allowance,
                        specialBenefit,
                        deductions,
                      ),
                      buildPayRow(
                        '১ জুলাই ২০২৬ – ৩১ ডিসেম্বর ২০২৬',
                        result.phase1Pay,
                        allowance,
                        0,
                        deductions,
                      ),
                      buildPayRow(
                        '১ জানুয়ারি ২০২৭ – ৩০ জুন ২০২৭',
                        result.phase2Pay,
                        allowance,
                        0,
                        deductions,
                      ),
                      buildPayRow(
                        '১ জুলাই ২০২৭ – ৩১ ডিসেম্বর ২০২৭',
                        result.phase3Pay,
                        allowance,
                        0,
                        deductions,
                      ),
                    ].map((row, i) => (
                      <tr key={row.label} className={i === 0 ? '' : undefined}>
                        <td>{row.label}</td>
                        <td className="num" data-label="মূল বেতন">
                          {bnNumber(row.basic)}
                        </td>
                        <td className="num" data-label="ভাতাদি">
                          {bnNumber(row.allowance)}
                        </td>
                        <td className="num" data-label="বিশেষ সুবিধা">
                          {row.specialBenefit > 0
                            ? bnNumber(row.specialBenefit)
                            : '—'}
                        </td>
                        <td className="num" data-label="গ্রস">
                          <strong>{bnNumber(row.gross)}</strong>
                        </td>
                        <td className="num" data-label="কর্তন">
                          {row.deduction > 0 ? `− ${bnNumber(row.deduction)}` : '—'}
                        </td>
                        <td className="num" data-label="নিট">
                          <strong>{bnNumber(row.net)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(() => {
                const now = buildPayRow(
                  '',
                  result.currentBasic,
                  allowance,
                  specialBenefit,
                  deductions,
                );
                const p1 = buildPayRow(
                  '',
                  result.phase1Pay,
                  allowance,
                  0,
                  deductions,
                );
                const change = p1.net - now.net;
                return (
                  <div
                    className={
                      'alert ' + (change >= 0 ? 'alert-info' : 'alert-danger')
                    }
                    style={{ marginTop: 12 }}
                  >
                    ১ম পর্যায়ে (১ জুলাই ২০২৬ হইতে) হাতে পাওয়া <strong>নিট</strong>{' '}
                    বেতনের প্রকৃত পরিবর্তন:{' '}
                    <strong>
                      {change >= 0 ? '+' : '−'} {bnTaka(Math.abs(change))}
                    </strong>{' '}
                    প্রতি মাসে (বিশেষ সুবিধা বিলুপ্তি হিসাবে ধরিয়া)।
                  </div>
                );
              })()}
            </div>
          )}

          <div className="card">
            <h3>বিশেষ সুবিধা বিলুপ্তি ও সমন্বয় (অনুচ্ছেদ ১(৩)(ট) ও (ঠ))</h3>
            <div className="alert alert-warn">
              জাতীয় বেতনস্কেল, ২০২৬ কার্যকর হইবার তারিখ অর্থাৎ{' '}
              <strong>১ জুলাই ২০২৬</strong> হইতে <strong>বিশেষ সুবিধা বিলুপ্ত</strong>{' '}
              হইয়াছে বলিয়া গণ্য হইবে। ১ জুলাই ২০২৬ তারিখ হইতে আদেশ জারির তারিখ পর্যন্ত
              আহরিত বিশেষ সুবিধা প্রাপ্য বকেয়ার সহিত সমন্বয় করিতে হইবে। তাই নতুন
              বেতনে প্রকৃত লাভ নিরূপণে বিশেষ সুবিধার অঙ্ক বাদ দেওয়া হইয়াছে।
            </div>
            <div className="table-wrap">
              <table>
                <tbody>
                  <tr>
                    <td>বিদ্যমান হার (১ জুলাই ২০২৫ হইতে কার্যকর প্রজ্ঞাপন)</td>
                    <td className="num">
                      {grade <= 9
                        ? `গ্রেড ১–৯: মূল বেতনের ${toBn(SPECIAL_BENEFIT.rateUpperGrades)}%`
                        : `গ্রেড ১০–২০: মূল বেতনের ${toBn(SPECIAL_BENEFIT.rateLowerGrades)}%`}
                    </td>
                  </tr>
                  {autoSB && (
                    <tr>
                      <td>
                        হার প্রয়োগে প্রাপ্ত অঙ্ক ({bnNumber(result.currentBasic)} ×{' '}
                        {toBn(autoSB.rate)}%)
                      </td>
                      <td className="num">{bnNumber(autoSB.calculated)} টাকা</td>
                    </tr>
                  )}
                  {autoSB?.minimumApplied && (
                    <tr>
                      <td>ন্যূনতম সীমা প্রযোজ্য</td>
                      <td className="num">
                        {bnNumber(SPECIAL_BENEFIT.employeeMinimum)} টাকা
                      </td>
                    </tr>
                  )}
                  <tr className="total">
                    <td>
                      ৩০ জুন ২০২৬ তারিখে আহরিত মাসিক বিশেষ সুবিধা
                      {sbMode === 'manual' && ' (নিজে প্রদত্ত)'}
                    </td>
                    <td className="num">{bnTaka(specialBenefit)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="hint" style={{ marginTop: 10 }}>
              ব্যতিক্রম (অনুচ্ছেদ ১(৩)(ঠ)): যে কর্মচারী ১ জুলাই ২০২৬ তারিখে অবসর-উত্তর
              ছুটিতে (পিআরএল) রহিয়াছেন, তিনি ৩০ জুন ২০২৬ তারিখে যে হারে বিশেষ সুবিধা
              পাইতেন অবসর-উত্তর ছুটি শেষ না হওয়া পর্যন্ত সেই হারেই প্রাপ্য হইবেন।
            </p>
          </div>

          {months > 0 && impact && (
            <div className="card">
              <h3>বকেয়া হিসাব ও বিশেষ সুবিধার সমন্বয় (অনুচ্ছেদ ১(৩)(ঘ) ও (ট))</h3>
              <div className="table-wrap">
                <table>
                  <tbody>
                    <tr>
                      <td>মাসিক বেতনবৃদ্ধি (১ম পর্যায়ে {toBn(result.phase1Percent)}%)</td>
                      <td className="num">
                        {bnNumber(result.phase1Pay - result.currentBasic)} টাকা
                      </td>
                    </tr>
                    <tr>
                      <td>মাস সংখ্যা</td>
                      <td className="num">{toBn(months)} মাস</td>
                    </tr>
                    <tr>
                      <td>মোট বকেয়া (সমন্বয়ের পূর্বে)</td>
                      <td className="num">{bnNumber(impact.grossArrear)} টাকা</td>
                    </tr>
                    <tr>
                      <td>
                        বাদ: আহরিত বিশেষ সুবিধা ({bnNumber(specialBenefit)} ×{' '}
                        {toBn(months)} মাস)
                      </td>
                      <td className="num" style={{ color: 'var(--danger)' }}>
                        − {bnNumber(impact.adjustment)} টাকা
                      </td>
                    </tr>
                    <tr className="total">
                      <td>সমন্বয়ের পর প্রকৃত প্রাপ্য বকেয়া</td>
                      <td
                        className="num"
                        style={
                          impact.netArrear < 0
                            ? { color: 'var(--danger)' }
                            : undefined
                        }
                      >
                        {bnTaka(impact.netArrear)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {impact.netArrear < 0 && (
                <div className="alert alert-danger" style={{ marginTop: 12 }}>
                  আহরিত বিশেষ সুবিধার অঙ্ক প্রাপ্য বকেয়া অপেক্ষা বেশি হওয়ায় সমন্বয়ের
                  পর ফলাফল ঋণাত্মক; এইরূপ ক্ষেত্রে অতিরিক্ত পরিশোধিত অঙ্ক পরবর্তী বেতন
                  হইতে সমন্বয়যোগ্য হইবে (অনুচ্ছেদ ৩২(১০))।
                </div>
              )}
              <p className="hint" style={{ marginTop: 10 }}>
                গেজেট জারি হইয়াছে ১৭ সেপ্টেম্বর ২০২৬ তারিখে; সাধারণভাবে জুলাই, আগস্ট ও
                সেপ্টেম্বর — এই ৩ মাসের পার্থক্য বকেয়া হিসাবে প্রাপ্য হইবে। প্রকৃত মাস
                সংখ্যা ডিডিও/হিসাবরক্ষণ অফিসের নির্দেশনা অনুযায়ী নির্ধারিত হইবে।
              </p>
            </div>
          )}

          {!result.isSpecialFixed && (
            <div className="card">
              <h3>
                জাতীয় বেতনস্কেল, ২০২৬ — {bnOrdinal(result.grade)} গ্রেডের ধাপসমূহ
              </h3>
              <div className="scale-steps">
                {result.scale2026.map((s, i) => (
                  <span
                    key={s}
                    className={
                      'step-chip' +
                      (s === result.newBasic
                        ? ' fixed'
                        : s === result.fixedPay
                          ? ' current'
                          : '')
                    }
                    title={`${i + 1} নং ধাপ`}
                  >
                    {bnNumber(s)}
                  </span>
                ))}
              </div>
              <p className="hint" style={{ marginTop: 10 }}>
                <span className="step-chip fixed">
                  {bnNumber(result.newBasic)}
                </span>{' '}
                = নতুন নির্ধারিত মূল বেতন
                {result.fixedPay !== result.newBasic && (
                  <>
                    {' · '}
                    <span className="step-chip current">
                      {bnNumber(result.fixedPay)}
                    </span>{' '}
                    = অনুচ্ছেদ ৫ অনুযায়ী নির্ধারণের ধাপ (ইনক্রিমেন্টের পূর্বে)
                  </>
                )}
              </p>
            </div>
          )}

          <div className="card">
            <h3>বিধিভিত্তিক ব্যাখ্যা</h3>
            <ul className="note-list">
              {result.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
}
