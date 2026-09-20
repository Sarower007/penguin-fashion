'use client';

import { useMemo, useState } from 'react';
import {
  DEFAULT_PENSION_INCREMENT_RATE,
  PENSION_SLABS,
  calculatePension,
} from '@/lib/pension';
import { MEDICAL_PENSIONER } from '@/lib/allowances';
import { bnNumber, bnTaka, parseAmount, toBn } from '@/lib/bn';

export default function PensionTool() {
  const [netPension, setNetPension] = useState('১৫০০০');
  const [age, setAge] = useState('৬৫');
  const [withIncrement, setWithIncrement] = useState(true);
  const [incrementRate, setIncrementRate] = useState(
    toBn(DEFAULT_PENSION_INCREMENT_RATE),
  );

  const current = parseAmount(netPension) ?? 0;
  const rate = parseAmount(incrementRate) ?? DEFAULT_PENSION_INCREMENT_RATE;

  const result = useMemo(() => {
    if (!current || current <= 0) return null;
    return calculatePension({
      currentNetPension: current,
      applyJuly2026Increment: withIncrement,
      incrementRate: rate,
      age: parseAmount(age) ?? 0,
    });
  }, [current, withIncrement, rate, age]);

  return (
    <>
      <div className="card">
        <h3>পেনশনভোগীর তথ্য</h3>
        <div className="grid">
          <div className="field">
            <label htmlFor="np">৩০ জুন ২০২৬ তারিখে প্রাপ্ত মাসিক নিট পেনশন (টাকা)</label>
            <input
              id="np"
              type="text"
              inputMode="numeric"
              value={netPension}
              onChange={(e) => setNetPension(e.target.value)}
            />
            <span className="hint">
              মূল পেনশনভোগী বা আজীবন পারিবারিক পেনশনভোগীর বিদ্যমান নিট পেনশন।
            </span>
          </div>
          <div className="field">
            <label htmlFor="page">বয়স (বৎসর)</label>
            <input
              id="page"
              type="text"
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
            <span className="hint">চিকিৎসা ভাতার হার নির্ধারণের জন্য।</span>
          </div>
          <div className="field">
            <label htmlFor="prate">বার্ষিক বৃদ্ধির হার (%)</label>
            <input
              id="prate"
              type="text"
              inputMode="decimal"
              value={incrementRate}
              onChange={(e) => setIncrementRate(e.target.value)}
            />
            <span className="hint">
              এই আদেশে পেনশনের বার্ষিক বৃদ্ধির হার উল্লেখ নাই; বিদ্যমান প্রচলিত হার
              (৫%) পূর্বনির্ধারিত রাখা হইয়াছে।
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
              অনুচ্ছেদ ৮(২) অনুযায়ী ১ জুলাই ২০২৬ তারিখে ১টি বার্ষিক বৃদ্ধি প্রয়োগ করুন
            </span>
          </label>
        </div>
      </div>

      {result && (
        <>
          {result.warnings.map((w, i) => (
            <div className="alert alert-warn" key={i}>
              ⚠️ {w}
            </div>
          ))}

          <div className="headline">
            <div className="stat">
              <div className="stat-label">বিদ্যমান নিট পেনশন</div>
              <div className="stat-value">{bnTaka(result.currentNetPension)}</div>
              <div className="stat-sub">{result.slab.label}</div>
            </div>
            <div className="stat">
              <div className="stat-label">বৃদ্ধির হার</div>
              <div className="stat-value">{toBn(result.slab.rate)}%</div>
              <div className="stat-sub">অনুচ্ছেদ ৮(১)(খ) সারণি</div>
            </div>
            <div className="stat">
              <div className="stat-label">নির্ধারিত নিট পেনশন</div>
              <div className="stat-value">{bnTaka(result.fixedNetPension)}</div>
              <div className="stat-sub">
                ন্যূনতম {bnNumber(result.slab.floor)} · সর্বোচ্চ{' '}
                {bnNumber(result.slab.ceiling)}
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">
                চূড়ান্ত নিট পেনশন {result.incrementApplied ? '(বৃদ্ধিসহ)' : ''}
              </div>
              <div className="stat-value brand">{bnTaka(result.newNetPension)}</div>
              <div className="stat-sub">
                বৃদ্ধি {bnTaka(result.increase)} ({bnNumber(result.increasePercent, 2)}%)
              </div>
            </div>
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
                    <td>৩০ জুন ২০২৬ তারিখে প্রাপ্ত নিট পেনশন</td>
                    <td className="num">{bnNumber(result.currentNetPension)}</td>
                    <td className="rule-ref">অনুচ্ছেদ ৮(১)(খ)</td>
                  </tr>
                  <tr>
                    <td>২</td>
                    <td>
                      স্ল্যাব অনুযায়ী বৃদ্ধি ({toBn(result.slab.rate)}%)
                    </td>
                    <td className="num">{bnNumber(result.rawIncrease)}</td>
                    <td className="rule-ref">সারণি</td>
                  </tr>
                  <tr>
                    <td>৩</td>
                    <td>বর্ধিত নিট পেনশন (ক্রম ১ + ক্রম ২)</td>
                    <td className="num">{bnNumber(result.beforeLimits)}</td>
                    <td className="rule-ref">সারণি</td>
                  </tr>
                  <tr>
                    <td>৪</td>
                    <td>
                      সীমা প্রয়োগের পর নির্ধারিত নিট পেনশন
                      {result.floorApplied && ' — ন্যূনতম সীমা প্রযোজ্য'}
                      {result.ceilingApplied && ' — সর্বোচ্চ সীমা প্রযোজ্য'}
                    </td>
                    <td className="num">{bnNumber(result.fixedNetPension)}</td>
                    <td className="rule-ref">অনুচ্ছেদ ৮(১)(খ)</td>
                  </tr>
                  {result.incrementApplied && (
                    <tr>
                      <td>৫</td>
                      <td>
                        ১ জুলাই ২০২৬ তারিখে ১টি বার্ষিক বৃদ্ধি ({toBn(rate)}%)
                      </td>
                      <td className="num">{bnNumber(result.incrementAmount)}</td>
                      <td className="rule-ref">অনুচ্ছেদ ৮(২)</td>
                    </tr>
                  )}
                  <tr className="total">
                    <td />
                    <td>চূড়ান্ত নিট পেনশন</td>
                    <td className="num">{bnNumber(result.newNetPension)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3>পর্যায়ভিত্তিক প্রদেয় নিট পেনশন (অনুচ্ছেদ ১(৩)(ঙ)(চ)(ছ))</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>সময়কাল</th>
                    <th className="num">হার</th>
                    <th className="num">বৃদ্ধির অঙ্ক</th>
                    <th className="num">প্রদেয় নিট পেনশন</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>১ জুলাই ২০২৬ – ৩১ ডিসেম্বর ২০২৬</td>
                    <td className="num">{toBn(result.phase1Percent)}%</td>
                    <td className="num">
                      {bnNumber(result.phase1Pension - result.currentNetPension)}
                    </td>
                    <td className="num">
                      <strong>{bnNumber(result.phase1Pension)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>১ জানুয়ারি ২০২৭ – ৩০ জুন ২০২৭</td>
                    <td className="num">{toBn(result.phase2Percent)}%</td>
                    <td className="num">
                      {bnNumber(result.phase2Pension - result.currentNetPension)}
                    </td>
                    <td className="num">
                      <strong>{bnNumber(result.phase2Pension)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>১ জুলাই ২০২৭ হইতে (বার্ষিক বৃদ্ধিসহ শতভাগ)</td>
                    <td className="num">১০০%</td>
                    <td className="num">
                      {bnNumber(result.phase3Pension - result.currentNetPension)}
                    </td>
                    <td className="num">
                      <strong>{bnNumber(result.phase3Pension)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="hint" style={{ marginTop: 10 }}>
              বিদ্যমান নিট পেনশন স্ল্যাব ২০০০১ টাকা ও তদূর্ধ্ব হইলে ৪০%/৭০%; স্ল্যাব ১
              টাকা (সর্বনিম্ন) হইতে ২০০০০ টাকা হইলে ৫০%/৭৫% হারে প্রদেয়। অবসরভোগীগণ ১
              জুলাই ২০২৬ হইতে আদেশ জারির তারিখ পর্যন্ত নিট পেনশন বকেয়া হিসাবে প্রাপ্য
              হইবেন (অনুচ্ছেদ ১(৩)(জ))।
            </p>
          </div>

          <div className="card">
            <h3>পেনশনভোগীর অন্যান্য প্রাপ্যতা</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>খাত</th>
                    <th>বিবরণ</th>
                    <th className="num">টাকা</th>
                    <th>বিধি</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>চিকিৎসা ভাতা (মাসিক)</td>
                    <td>
                      {MEDICAL_PENSIONER.find((m) => m.amount === result.medical)
                        ?.label ?? '—'}
                    </td>
                    <td className="num">{bnNumber(result.medical)}</td>
                    <td className="rule-ref">অনুচ্ছেদ ১৩(২)</td>
                  </tr>
                  <tr>
                    <td>উৎসব ভাতা (প্রতিটি)</td>
                    <td>নিট পেনশনের সমপরিমাণ হারে বৎসরে ২টি</td>
                    <td className="num">{bnNumber(result.festivalEach)}</td>
                    <td className="rule-ref">অনুচ্ছেদ ১৭(২)</td>
                  </tr>
                  <tr>
                    <td>উৎসব ভাতা (বৎসরে ২টি)</td>
                    <td>—</td>
                    <td className="num">{bnNumber(result.festivalTotal)}</td>
                    <td className="rule-ref">অনুচ্ছেদ ১৭(২)</td>
                  </tr>
                  <tr>
                    <td>বাংলা নববর্ষ ভাতা</td>
                    <td>নিট পেনশনের ১৫%</td>
                    <td className="num">{bnNumber(result.boishakhi)}</td>
                    <td className="rule-ref">অনুচ্ছেদ ১৪(২)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

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

      <div className="card">
        <h3>অনুচ্ছেদ ৮(১)(খ) এর সারণি</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>৩০ জুন ২০২৬ তারিখে প্রাপ্ত নিট পেনশন</th>
                <th className="num">নিট পেনশন বৃদ্ধির হার</th>
                <th className="num">ন্যূনতম নিট পেনশন</th>
                <th className="num">সর্বোচ্চ নিট পেনশন</th>
              </tr>
            </thead>
            <tbody>
              {PENSION_SLABS.map((s) => (
                <tr key={s.label}>
                  <td>{s.label}</td>
                  <td className="num">{toBn(s.rate)}%</td>
                  <td className="num">{bnNumber(s.floor)} টাকা</td>
                  <td className="num">{bnNumber(s.ceiling)} টাকা</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint" style={{ marginTop: 10 }}>
          শর্ত: যে সকল অবসরভোগী ইতোমধ্যে ৭০২০০ টাকার অতিরিক্ত নিট পেনশন উত্তোলন
          করিতেছেন, তাঁহারা পরবর্তী বার্ষিক বৃদ্ধি (১ জুলাই ২০২৭) এর পূর্ব পর্যন্ত
          বিদ্যমান নিট পেনশনই পাইবেন।
        </p>
      </div>
    </>
  );
}
