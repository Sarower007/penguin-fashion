'use client';

import { useMemo, useState } from 'react';
import { GRADES, GradeNo, SCALE_2026 } from '@/lib/scales';
import { projectIncrements } from '@/lib/fixation';
import { bnNumber, bnOrdinal, bnTaka, parseAmount, toBn } from '@/lib/bn';

export default function IncrementTool() {
  const [grade, setGrade] = useState<GradeNo>(10);
  const [basic, setBasic] = useState<number>(SCALE_2026[10][0]);
  const [years, setYears] = useState('১০');

  const count = Math.min(Math.max(parseAmount(years) ?? 10, 1), 25);

  const rows = useMemo(
    () => projectIncrements(grade, basic, count),
    [grade, basic, count],
  );

  const scale = SCALE_2026[grade];
  const currentIndex = scale.findIndex((s) => s === basic);
  const stepsLeft = currentIndex >= 0 ? scale.length - 1 - currentIndex : 0;

  function handleGradeChange(g: GradeNo) {
    setGrade(g);
    setBasic(SCALE_2026[g][0]);
  }

  return (
    <>
      <div className="card">
        <h3>বার্ষিক বেতনবৃদ্ধি প্রক্ষেপণ</h3>
        <div className="grid">
          <div className="field">
            <label htmlFor="igrade">গ্রেড (জাতীয় বেতনস্কেল, ২০২৬)</label>
            <select
              id="igrade"
              value={grade}
              onChange={(e) => handleGradeChange(Number(e.target.value) as GradeNo)}
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {bnOrdinal(g)} গ্রেড
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="ibasic">১ জুলাই ২০২৬ তারিখে নির্ধারিত মূল বেতন</label>
            <select
              id="ibasic"
              value={basic}
              onChange={(e) => setBasic(Number(e.target.value))}
            >
              {scale.map((s, i) => (
                <option key={s} value={s}>
                  {bnNumber(s)} — {toBn(i + 1)} নং ধাপ
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="iyears">কত বৎসরের প্রক্ষেপণ</label>
            <input
              id="iyears"
              type="text"
              inputMode="numeric"
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
            <span className="hint">সর্বোচ্চ ২৫ বৎসর পর্যন্ত।</span>
          </div>
        </div>
      </div>

      <div className="headline">
        <div className="stat">
          <div className="stat-label">বর্তমান ধাপ</div>
          <div className="stat-value">
            {currentIndex >= 0 ? `${toBn(currentIndex + 1)} নং` : '—'}
          </div>
          <div className="stat-sub">মোট {toBn(scale.length)}টি ধাপ</div>
        </div>
        <div className="stat">
          <div className="stat-label">অবশিষ্ট ইনক্রিমেন্ট</div>
          <div className="stat-value">{toBn(stepsLeft)}টি</div>
        </div>
        <div className="stat">
          <div className="stat-label">স্কেলের সর্বোচ্চ ধাপ</div>
          <div className="stat-value brand">
            {bnTaka(scale[scale.length - 1])}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>বৎসরওয়ারি মূল বেতন</h3>
        <p style={{ marginTop: -6, color: 'var(--ink-soft)', fontSize: '.92rem' }}>
          অনুচ্ছেদ ৯(১): সকল কর্মচারীর বার্ষিক বেতনবৃদ্ধির তারিখ প্রতি অর্থবৎসর শুরুর
          প্রথম দিবস অর্থাৎ ১ জুলাই। নিচের হিসাব ১ জুলাই ২০২৬ তারিখে নির্ধারিত বেতনের
          পরবর্তী বৎসরসমূহের প্রক্ষেপণ।
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>তারিখ</th>
                <th className="num">ধাপ</th>
                <th className="num">মূল বেতন</th>
                <th className="num">বৃদ্ধি</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>১ জুলাই ২০২৬ (নির্ধারিত)</td>
                <td className="num">
                  {currentIndex >= 0 ? toBn(currentIndex + 1) : '—'}
                </td>
                <td className="num">{bnNumber(basic)}</td>
                <td className="num">—</td>
              </tr>
              {rows.map((r, i) => {
                const prev = i === 0 ? basic : rows[i - 1].basic;
                const idx = scale.findIndex((s) => s === r.basic);
                return (
                  <tr key={r.year}>
                    <td>
                      ১ জুলাই {toBn(r.year)}
                      {r.atMax && (
                        <span className="rule-ref"> · সর্বোচ্চ ধাপ</span>
                      )}
                    </td>
                    <td className="num">{idx >= 0 ? toBn(idx + 1) : '—'}</td>
                    <td className="num">{bnNumber(r.basic)}</td>
                    <td className="num">{bnNumber(r.basic - prev)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="hint" style={{ marginTop: 10 }}>
          মনে রাখুন: ১ জুলাই ২০২৬ – ৩০ জুন ২০২৭ সময়ে মূল বেতন শতভাগ প্রদেয় নহে;
          অনুচ্ছেদ ১(৩) অনুযায়ী পর্যায়ভিত্তিক হারে প্রদেয় হইবে। ১ জুলাই ২০২৭ তারিখ
          হইতে বার্ষিক বেতনবৃদ্ধিসহ মূল বেতন শতভাগ প্রদান করা হইবে।
        </p>
      </div>
    </>
  );
}
