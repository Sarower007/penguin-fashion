'use client';

import { useState } from 'react';
import { GRADES, GradeNo, SCALE_2015, SCALE_2026, FIXED_PAY_POSTS } from '@/lib/scales';
import { bnNumber, bnOrdinal, toBn } from '@/lib/bn';

export default function ScaleTable() {
  const [selected, setSelected] = useState<GradeNo | 'all'>('all');

  const grades = selected === 'all' ? GRADES : [selected];

  return (
    <>
      <div className="card">
        <h3>গ্রেড নির্বাচন</h3>
        <div className="grid">
          <div className="field">
            <label htmlFor="scgrade">গ্রেড</label>
            <select
              id="scgrade"
              value={selected}
              onChange={(e) =>
                setSelected(
                  e.target.value === 'all'
                    ? 'all'
                    : (Number(e.target.value) as GradeNo),
                )
              }
            >
              <option value="all">সকল গ্রেড (১–২০)</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {bnOrdinal(g)} গ্রেড
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>অনুরূপ স্কেল (corresponding scale) — অনুচ্ছেদ ৩(১)</h3>
        <div className="table-wrap table-fixed">
          <table>
            <thead>
              <tr>
                <th style={{ width: '9%' }}>গ্রেড</th>
                <th style={{ width: '45.5%' }}>
                  জাতীয় বেতনস্কেল, ২০১৫ (বর্তমান বেতনস্কেল)
                </th>
                <th style={{ width: '45.5%' }}>
                  জাতীয় বেতনস্কেল, ২০২৬ (১ জুলাই ২০২৬ হইতে কার্যকর অনুরূপ স্কেল)
                </th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g}>
                  <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                    {bnOrdinal(g)}
                  </td>
                  <td style={{ fontSize: '.9rem' }}>
                    টাকা{' '}
                    {SCALE_2015[g].length === 1
                      ? `${toBn(SCALE_2015[g][0])} (নির্ধারিত)`
                      : SCALE_2015[g].map((s) => toBn(s)).join('-')}
                  </td>
                  <td style={{ fontSize: '.9rem' }}>
                    টাকা{' '}
                    {SCALE_2026[g].length === 1
                      ? `${toBn(SCALE_2026[g][0])} (নির্ধারিত)`
                      : SCALE_2026[g].map((s) => toBn(s)).join('-')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected !== 'all' && (
        <div className="card">
          <h3>
            {bnOrdinal(selected)} গ্রেডের ধাপসমূহ — পাশাপাশি তুলনা
          </h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="num">ধাপ</th>
                  <th className="num">জাতীয় বেতনস্কেল, ২০১৫</th>
                  <th className="num">জাতীয় বেতনস্কেল, ২০২৬</th>
                  <th className="num">পার্থক্য</th>
                  <th className="num">বৃদ্ধির হার</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({
                  length: Math.max(
                    SCALE_2015[selected].length,
                    SCALE_2026[selected].length,
                  ),
                }).map((_, i) => {
                  const a = SCALE_2015[selected][i];
                  const b = SCALE_2026[selected][i];
                  return (
                    <tr key={i}>
                      <td className="num">{toBn(i + 1)}</td>
                      <td className="num">{a ? bnNumber(a) : '—'}</td>
                      <td className="num">{b ? bnNumber(b) : '—'}</td>
                      <td className="num">{a && b ? bnNumber(b - a) : '—'}</td>
                      <td className="num">
                        {a && b ? `${bnNumber(((b - a) / a) * 100, 1)}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="hint" style={{ marginTop: 10 }}>
            একই ক্রমের ধাপের তুলনা কেবল সাধারণ ধারণার জন্য; প্রকৃত বেতন নির্ধারণ
            অনুচ্ছেদ ৫ এর পার্থক্য পদ্ধতিতে হইবে।
          </p>
        </div>
      )}

      <div className="card">
        <h3>নির্ধারিত বেতনের পদসমূহ (অনুচ্ছেদ ৩(২))</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>পদ</th>
                <th className="num">জাতীয় বেতনস্কেল, ২০২৬ এ বেতন</th>
              </tr>
            </thead>
            <tbody>
              {FIXED_PAY_POSTS.map((p) => (
                <tr key={p.id}>
                  <td>{p.label}</td>
                  <td className="num">{bnNumber(p.pay2026)} টাকা (নির্ধারিত)</td>
                </tr>
              ))}
              <tr>
                <td>১ম গ্রেড (অনুচ্ছেদ ৩(১))</td>
                <td className="num">{bnNumber(SCALE_2026[1][0])} টাকা (নির্ধারিত)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
