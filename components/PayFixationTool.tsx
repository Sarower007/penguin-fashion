'use client';

import { useMemo, useState } from 'react';
import {
  GRADES,
  GradeNo,
  SCALE_2015,
  SCALE_2026,
  FIXED_PAY_POSTS,
} from '@/lib/scales';
import { calculateFixation, SpecialPostId } from '@/lib/fixation';
import { bnNumber, bnOrdinal, bnTaka, parseAmount, toBn } from '@/lib/bn';

export default function PayFixationTool() {
  const [grade, setGrade] = useState<GradeNo>(10);
  const [basicMode, setBasicMode] = useState<'step' | 'custom'>('step');
  const [stepValue, setStepValue] = useState<number>(SCALE_2015[10][0]);
  const [customBasic, setCustomBasic] = useState<string>('');
  const [specialPost, setSpecialPost] = useState<SpecialPostId | ''>('');
  const [withIncrement, setWithIncrement] = useState(true);
  const [arrearMonths, setArrearMonths] = useState('৩');

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

  const months = Math.max(0, Math.floor(parseAmount(arrearMonths) ?? 0));
  const arrear = result ? (result.phase1Pay - result.currentBasic) * months : 0;

  function handleGradeChange(g: GradeNo) {
    setGrade(g);
    setStepValue(SCALE_2015[g][0]);
    if (g !== 1) setSpecialPost('');
  }

  return (
    <>
      <div className="card">
        <h3>আপনার তথ্য দিন</h3>
        <div className="grid">
          <div className="field">
            <label htmlFor="grade">বর্তমান গ্রেড (জাতীয় বেতনস্কেল, ২০১৫)</label>
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
              ৩০ জুন ২০২৬ তারিখে আপনি যে গ্রেডে বেতন আহরণ করিতেছিলেন।
            </span>
          </div>

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
              onChange={(e) => setSpecialPost(e.target.value as SpecialPostId | '')}
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
        </div>

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
            </span>
          </label>
        </div>
      </div>

      {!result && (
        <div className="alert alert-info">
          হিসাব দেখিতে গ্রেড ও ৩০ জুন ২০২৬ তারিখের মূল বেতন নির্বাচন করুন।
        </div>
      )}

      {result && (
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
            <div className="table-wrap">
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
                    <td>১</td>
                    <td>৩০ জুন ২০২৬ তারিখে আহরিত/প্রাপ্য মূল বেতন</td>
                    <td className="num">{bnNumber(result.currentBasic)}</td>
                    <td className="rule-ref">অনুচ্ছেদ ২(খ)</td>
                  </tr>
                  {!result.isSpecialFixed && (
                    <>
                      <tr>
                        <td>২</td>
                        <td>বর্তমান বেতনস্কেলের প্রারম্ভিক ধাপ</td>
                        <td className="num">{bnNumber(result.scale2015[0])}</td>
                        <td className="rule-ref">অনুচ্ছেদ ৩(১)</td>
                      </tr>
                      <tr>
                        <td>৩</td>
                        <td>পার্থক্য (ক্রম ১ − ক্রম ২)</td>
                        <td className="num">{bnNumber(result.difference)}</td>
                        <td className="rule-ref">অনুচ্ছেদ ৫(খ)</td>
                      </tr>
                      <tr>
                        <td>৪</td>
                        <td>জাতীয় বেতনস্কেল, ২০২৬ এর অনুরূপ স্কেলের প্রারম্ভিক ধাপ</td>
                        <td className="num">{bnNumber(result.scale2026[0])}</td>
                        <td className="rule-ref">অনুচ্ছেদ ৩(১)</td>
                      </tr>
                      <tr>
                        <td>৫</td>
                        <td>যোগফল (ক্রম ৪ + ক্রম ৩)</td>
                        <td className="num">{bnNumber(result.provisional)}</td>
                        <td className="rule-ref">অনুচ্ছেদ ৫(খ)</td>
                      </tr>
                      <tr>
                        <td>৬</td>
                        <td>
                          নির্ধারিত বেতন —{' '}
                          {result.fixedExactMatch
                            ? 'যোগফলের সমান ধাপ পাওয়া গিয়াছে'
                            : 'সমান ধাপ না থাকায় পরবর্তী উচ্চতর ধাপ'}
                        </td>
                        <td className="num">{bnNumber(result.fixedPay)}</td>
                        <td className="rule-ref">
                          অনুচ্ছেদ ৫(খ)({result.fixedExactMatch ? 'অ' : 'আ'})
                        </td>
                      </tr>
                    </>
                  )}
                  {result.incrementApplied && (
                    <tr>
                      <td>{result.isSpecialFixed ? '২' : '৭'}</td>
                      <td>১ জুলাই ২০২৬ তারিখে ১টি বার্ষিক বেতনবৃদ্ধি (পরবর্তী ধাপ)</td>
                      <td className="num">{bnNumber(result.newBasic)}</td>
                      <td className="rule-ref">অনুচ্ছেদ ৯(২)</td>
                    </tr>
                  )}
                  <tr className="total">
                    <td />
                    <td>জাতীয় বেতনস্কেল, ২০২৬ এ নির্ধারিত মূল বেতন</td>
                    <td className="num">{bnNumber(result.newBasic)}</td>
                    <td />
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
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>সময়কাল</th>
                    <th className="num">হার</th>
                    <th className="num">বৃদ্ধির অঙ্ক</th>
                    <th className="num">প্রদেয় মূল বেতন</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>১ জুলাই ২০২৬ – ৩১ ডিসেম্বর ২০২৬</td>
                    <td className="num">{toBn(result.phase1Percent)}%</td>
                    <td className="num">
                      {bnNumber(result.phase1Pay - result.currentBasic)}
                    </td>
                    <td className="num">
                      <strong>{bnNumber(result.phase1Pay)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>১ জানুয়ারি ২০২৭ – ৩০ জুন ২০২৭</td>
                    <td className="num">{toBn(result.phase2Percent)}%</td>
                    <td className="num">
                      {bnNumber(result.phase2Pay - result.currentBasic)}
                    </td>
                    <td className="num">
                      <strong>{bnNumber(result.phase2Pay)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      ১ জুলাই ২০২৭ হইতে (বার্ষিক ইনক্রিমেন্টসহ শতভাগ)
                    </td>
                    <td className="num">১০০%</td>
                    <td className="num">
                      {bnNumber(result.phase3Pay - result.currentBasic)}
                    </td>
                    <td className="num">
                      <strong>{bnNumber(result.phase3Pay)}</strong>
                      {result.phase3AtMax && (
                        <div className="rule-ref">সর্বোচ্চ ধাপ</div>
                      )}
                    </td>
                  </tr>
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

          {months > 0 && (
            <div className="card">
              <h3>বকেয়া হিসাব (অনুচ্ছেদ ১(৩)(ঘ))</h3>
              <div className="table-wrap">
                <table>
                  <tbody>
                    <tr>
                      <td>মাসিক বেতনবৃদ্ধি (১ম পর্যায়ে)</td>
                      <td className="num">
                        {bnNumber(result.phase1Pay - result.currentBasic)} টাকা
                      </td>
                    </tr>
                    <tr>
                      <td>মাস সংখ্যা</td>
                      <td className="num">{toBn(months)} মাস</td>
                    </tr>
                    <tr className="total">
                      <td>মোট বকেয়া</td>
                      <td className="num">{bnTaka(arrear)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
