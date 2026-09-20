'use client';

import { useMemo, useState } from 'react';
import { GRADES, GradeNo, SCALE_2026 } from '@/lib/scales';
import {
  AREAS,
  AreaId,
  ENTERTAINMENT_OPTIONS,
  calculateAllowances,
  houseRentBand,
  yearlyBenefits,
} from '@/lib/allowances';
import { bnNumber, bnOrdinal, bnTaka, parseAmount, toBn } from '@/lib/bn';

export default function SalaryTool() {
  const [grade, setGrade] = useState<GradeNo>(10);
  const [basicMode, setBasicMode] = useState<'step' | 'custom'>('step');
  const [stepValue, setStepValue] = useState<number>(SCALE_2026[10][0]);
  const [customBasic, setCustomBasic] = useState('');
  const [area, setArea] = useState<AreaId>('cityCorp');
  const [govtAccommodation, setGovtAccommodation] = useState(false);
  const [age, setAge] = useState('৪০');
  const [children, setChildren] = useState('২');
  const [disabledChildren, setDisabledChildren] = useState('০');
  const [freeLunch, setFreeLunch] = useState(false);
  const [workplaceInCityCorp, setWorkplaceInCityCorp] = useState(true);
  const [washing, setWashing] = useState(false);
  const [charge, setCharge] = useState(false);
  const [entertainment, setEntertainment] =
    useState<(typeof ENTERTAINMENT_OPTIONS)[number]['id']>('none');
  const [hill, setHill] = useState<'none' | 'sadar' | 'other'>('none');
  const [haor, setHaor] = useState(false);
  const [trainingDeputation, setTrainingDeputation] = useState(false);
  const [oldAllowance, setOldAllowance] = useState('');
  const [oldSpecialBenefit, setOldSpecialBenefit] = useState('');

  const basic =
    basicMode === 'step' ? stepValue : (parseAmount(customBasic) ?? 0);

  const band = houseRentBand(grade);

  const result = useMemo(() => {
    if (!basic) return null;
    return calculateAllowances({
      grade,
      basic,
      area,
      govtAccommodation,
      age: parseAmount(age) ?? 0,
      children: parseAmount(children) ?? 0,
      disabledChildren: parseAmount(disabledChildren) ?? 0,
      freeLunch,
      workplaceInCityCorp,
      washingEligible: washing,
      chargeAllowance: charge,
      entertainment,
      hill,
      haor,
      trainingDeputation,
    });
  }, [
    grade, basic, area, govtAccommodation, age, children, disabledChildren,
    freeLunch, workplaceInCityCorp, washing, charge, entertainment, hill,
    haor, trainingDeputation,
  ]);

  const yearly = basic ? yearlyBenefits(basic) : null;
  const oldAllowanceAmount = parseAmount(oldAllowance) ?? 0;
  const oldSBAmount = Math.max(0, parseAmount(oldSpecialBenefit) ?? 0);

  function handleGradeChange(g: GradeNo) {
    setGrade(g);
    setStepValue(SCALE_2026[g][0]);
  }

  return (
    <>
      <div className="card">
        <h3>মূল বেতন ও কর্মস্থল</h3>
        <div className="grid">
          <div className="field">
            <label htmlFor="sgrade">গ্রেড (জাতীয় বেতনস্কেল, ২০২৬)</label>
            <select
              id="sgrade"
              value={grade}
              onChange={(e) => handleGradeChange(Number(e.target.value) as GradeNo)}
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {bnOrdinal(g)} গ্রেড — {bnNumber(SCALE_2026[g][0])}
                  {SCALE_2026[g].length > 1
                    ? `–${bnNumber(SCALE_2026[g][SCALE_2026[g].length - 1])}`
                    : ' (নির্ধারিত)'}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="sbasicmode">মূল বেতন</label>
            <select
              id="sbasicmode"
              value={basicMode}
              onChange={(e) => setBasicMode(e.target.value as 'step' | 'custom')}
            >
              <option value="step">স্কেলের ধাপ হইতে নির্বাচন</option>
              <option value="custom">নিজে অঙ্ক লিখিব</option>
            </select>
          </div>

          {basicMode === 'step' ? (
            <div className="field">
              <label htmlFor="sstep">নির্ধারিত মূল বেতন (টাকা)</label>
              <select
                id="sstep"
                value={stepValue}
                onChange={(e) => setStepValue(Number(e.target.value))}
              >
                {SCALE_2026[grade].map((s, i) => (
                  <option key={s} value={s}>
                    {bnNumber(s)} — {toBn(i + 1)} নং ধাপ
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="field">
              <label htmlFor="scustom">নির্ধারিত মূল বেতন (টাকা)</label>
              <input
                id="scustom"
                type="text"
                inputMode="numeric"
                placeholder="যেমন: ৩৫৩০০"
                value={customBasic}
                onChange={(e) => setCustomBasic(e.target.value)}
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="sarea">কর্মস্থল/বাসস্থানের এলাকা</label>
            <select
              id="sarea"
              value={area}
              onChange={(e) => setArea(e.target.value as AreaId)}
            >
              {AREAS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.short}
                </option>
              ))}
            </select>
            <span className="hint">
              {AREAS.find((a) => a.id === area)?.label}
            </span>
          </div>

          <div className="field">
            <label htmlFor="sage">বয়স (বৎসর)</label>
            <input
              id="sage"
              type="text"
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
            <span className="hint">চিকিৎসা ভাতার হার নির্ধারণের জন্য।</span>
          </div>

          <div className="field">
            <label htmlFor="schildren">শিক্ষা সহায়ক ভাতাভুক্ত সন্তান সংখ্যা</label>
            <input
              id="schildren"
              type="text"
              inputMode="numeric"
              value={children}
              onChange={(e) => setChildren(e.target.value)}
            />
            <span className="hint">অনধিক ২ সন্তান; বয়স ২৩ বৎসর পর্যন্ত।</span>
          </div>

          <div className="field">
            <label htmlFor="sdisabled">বিশেষ চাহিদাসম্পন্ন সন্তান সংখ্যা</label>
            <input
              id="sdisabled"
              type="text"
              inputMode="numeric"
              value={disabledChildren}
              onChange={(e) => setDisabledChildren(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="sent">আপ্যায়ন ভাতা (প্রাধিকার)</label>
            <select
              id="sent"
              value={entertainment}
              onChange={(e) =>
                setEntertainment(
                  e.target.value as (typeof ENTERTAINMENT_OPTIONS)[number]['id'],
                )
              }
            >
              {ENTERTAINMENT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="shill">পাহাড়ি ভাতা</label>
            <select
              id="shill"
              value={hill}
              onChange={(e) =>
                setHill(e.target.value as 'none' | 'sadar' | 'other')
              }
            >
              <option value="none">প্রযোজ্য নহে</option>
              <option value="sadar">পার্বত্য জেলা সদর ও সদর উপজেলা</option>
              <option value="other">পার্বত্য অন্যান্য উপজেলা</option>
            </select>
          </div>
        </div>

        <div className="grid" style={{ marginTop: 14 }}>
          <label className="check">
            <input
              type="checkbox"
              checked={govtAccommodation}
              onChange={(e) => setGovtAccommodation(e.target.checked)}
            />
            <span>সরকারি বাসস্থানে বসবাস করিতেছি (বাড়ি ভাড়া ভাতা প্রাপ্য নহে)</span>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={workplaceInCityCorp}
              onChange={(e) => setWorkplaceInCityCorp(e.target.checked)}
            />
            <span>কর্মস্থল সিটি কর্পোরেশন এলাকায় (যাতায়াত ভাতা)</span>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={freeLunch}
              onChange={(e) => setFreeLunch(e.target.checked)}
            />
            <span>প্রতিষ্ঠান হইতে লাঞ্চ ভাতা/বিনামূল্যে দুপুরের খাবার পাই</span>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={washing}
              onChange={(e) => setWashing(e.target.checked)}
            />
            <span>ধোলাই ভাতা প্রযোজ্য</span>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={charge}
              onChange={(e) => setCharge(e.target.checked)}
            />
            <span>চলতি/অতিরিক্ত দায়িত্ব পালন করিতেছি (কার্যভার ভাতা)</span>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={haor}
              onChange={(e) => setHaor(e.target.checked)}
            />
            <span>হাওড়/দ্বীপ/চর এলাকায় নিযুক্ত</span>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={trainingDeputation}
              onChange={(e) => setTrainingDeputation(e.target.checked)}
            />
            <span>প্রশিক্ষণ প্রতিষ্ঠানে প্রেষণে কর্মরত (৯ম গ্রেড ও তদূর্ধ্ব)</span>
          </label>
        </div>
      </div>

      {result && basic > 0 && (
        <>
          <div className="headline">
            <div className="stat">
              <div className="stat-label">মূল বেতন</div>
              <div className="stat-value">{bnTaka(basic)}</div>
            </div>
            <div className="stat">
              <div className="stat-label">মোট ভাতা (মাসিক)</div>
              <div className="stat-value">{bnTaka(result.total)}</div>
            </div>
            <div className="stat">
              <div className="stat-label">মোট মাসিক বেতন (গ্রস)</div>
              <div className="stat-value brand">{bnTaka(basic + result.total)}</div>
              <div className="stat-sub">১ জানুয়ারি ২০২৮ হইতে প্রযোজ্য হারে</div>
            </div>
            <div className="stat">
              <div className="stat-label">বাড়ি ভাড়ার হার</div>
              <div className="stat-value">{toBn(band[area])}%</div>
              <div className="stat-sub">{band.label}</div>
            </div>
          </div>

          <div className="card">
            <h3>মাসিক বেতন বিবরণী</h3>
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
                    <td>মূল বেতন</td>
                    <td>জাতীয় বেতনস্কেল, ২০২৬ এ নির্ধারিত</td>
                    <td className="num">{bnNumber(basic)}</td>
                    <td className="rule-ref">অনুচ্ছেদ ৩ ও ৫</td>
                  </tr>
                  {result.lines.map((l) => (
                    <tr key={l.key}>
                      <td>{l.label}</td>
                      <td style={{ fontSize: '.88rem', color: 'var(--ink-soft)' }}>
                        {l.note}
                      </td>
                      <td className="num">{bnNumber(l.amount)}</td>
                      <td className="rule-ref">{l.rule}</td>
                    </tr>
                  ))}
                  <tr className="total">
                    <td colSpan={2}>সর্বমোট মাসিক প্রাপ্য (গ্রস)</td>
                    <td className="num">{bnNumber(basic + result.total)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="alert alert-warn" style={{ marginTop: 12 }}>
              এই হারসমূহ <strong>১ জানুয়ারি ২০২৮</strong> তারিখ হইতে প্রযোজ্য (অনুচ্ছেদ
              ১২(১) ও ১৫(৬))। ১ জুলাই ২০২৬ হইতে ৩১ ডিসেম্বর ২০২৭ পর্যন্ত ভাতাদি ৩০ জুন
              ২০২৬ তারিখে প্রাপ্য অঙ্কেই প্রদেয় হইবে।
            </div>
          </div>

          {yearly && (
            <div className="card">
              <h3>বাৎসরিক প্রাপ্তি</h3>
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
                      <td>উৎসব ভাতা (প্রতিটি)</td>
                      <td>মূল বেতনের সমপরিমাণ হারে বৎসরে ২টি</td>
                      <td className="num">{bnNumber(yearly.festivalEach)}</td>
                      <td className="rule-ref">অনুচ্ছেদ ১৭(১)</td>
                    </tr>
                    <tr>
                      <td>উৎসব ভাতা (বৎসরে ২টি)</td>
                      <td>—</td>
                      <td className="num">{bnNumber(yearly.festivalTotal)}</td>
                      <td className="rule-ref">অনুচ্ছেদ ১৭(১)</td>
                    </tr>
                    <tr>
                      <td>বাংলা নববর্ষ ভাতা</td>
                      <td>আহরিত মূল বেতনের ১৫%</td>
                      <td className="num">{bnNumber(yearly.boishakhi)}</td>
                      <td className="rule-ref">অনুচ্ছেদ ১৪(১)</td>
                    </tr>
                    <tr>
                      <td>শ্রান্তি ও বিনোদন ভাতা</td>
                      <td>
                        Bangladesh Services (Recreation Allowance) Rules, 1979
                        অনুসারে (১ মাসের মূল বেতনের সমপরিমাণ, ৩ বৎসর অন্তর)
                      </td>
                      <td className="num">{bnNumber(yearly.recreation)}</td>
                      <td className="rule-ref">অনুচ্ছেদ ১৭(১)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="card">
            <h3>অন্তর্বর্তী সময়ের (২০২৬–২০২৭) মোট প্রাপ্তি নিরূপণ</h3>
            <p style={{ marginTop: -6, color: 'var(--ink-soft)', fontSize: '.92rem' }}>
              ৩০ জুন ২০২৬ তারিখে আপনি যে পরিমাণ ভাতা (বাড়ি ভাড়া, চিকিৎসা, টিফিন,
              যাতায়াত ইত্যাদির যোগফল) পাইতেছিলেন তাহা লিখুন — ঐ অঙ্কই ৩১ ডিসেম্বর ২০২৭
              পর্যন্ত প্রদেয় হইবে।
            </p>
            <div className="alert alert-warn">
              <strong>বিশেষ সুবিধা বিলুপ্ত:</strong> অনুচ্ছেদ ১(৩)(ট) অনুযায়ী জাতীয়
              বেতনস্কেল, ২০২৬ কার্যকর হইবার তারিখ অর্থাৎ ১ জুলাই ২০২৬ হইতে বিশেষ সুবিধা
              বিলুপ্ত হইয়াছে বলিয়া গণ্য হইবে। তাই উপরের ভাতার অঙ্কে বিশেষ সুবিধা{' '}
              <strong>অন্তর্ভুক্ত করিবেন না</strong>; উহা নিচের ঘরে আলাদাভাবে লিখুন —
              ইহা মোট প্রাপ্তি হইতে বাদ যাইবে।
            </div>
            <div className="grid">
              <div className="field">
                <label htmlFor="oldall">
                  ৩০ জুন ২০২৬ তারিখে প্রাপ্ত মোট মাসিক ভাতা (বিশেষ সুবিধা ব্যতীত)
                </label>
                <input
                  id="oldall"
                  type="text"
                  inputMode="numeric"
                  placeholder="যেমন: ১২৫০০"
                  value={oldAllowance}
                  onChange={(e) => setOldAllowance(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="oldsb">
                  ৩০ জুন ২০২৬ তারিখে আহরিত বিশেষ সুবিধা (টাকা)
                </label>
                <input
                  id="oldsb"
                  type="text"
                  inputMode="numeric"
                  placeholder="যেমন: ২৪০০"
                  value={oldSpecialBenefit}
                  onChange={(e) => setOldSpecialBenefit(e.target.value)}
                />
                <span className="hint">
                  বিদ্যমান প্রজ্ঞাপন (১ জুলাই ২০২৫ হইতে কার্যকর): গ্রেড ১–৯ এ মূল
                  বেতনের ১০%, গ্রেড ১০–২০ এ ১৫%, ন্যূনতম ১৫০০ টাকা।
                </span>
              </div>
            </div>
            {(oldAllowanceAmount > 0 || oldSBAmount > 0) && (
              <div className="table-wrap" style={{ marginTop: 12 }}>
                <table>
                  <thead>
                    <tr>
                      <th>সময়কাল</th>
                      <th className="num">মূল বেতন</th>
                      <th className="num">ভাতাদি</th>
                      <th className="num">মোট (গ্রস)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>৩০ জুন ২০২৬ পর্যন্ত (বিশেষ সুবিধাসহ)</td>
                      <td className="num">
                        পূর্বের মূল বেতন
                        <div className="rule-ref">জাতীয় বেতনস্কেল, ২০১৫</div>
                      </td>
                      <td className="num">
                        {bnNumber(oldAllowanceAmount + oldSBAmount)}
                        {oldSBAmount > 0 && (
                          <div className="rule-ref">
                            ইহার মধ্যে বিশেষ সুবিধা {bnNumber(oldSBAmount)}
                          </div>
                        )}
                      </td>
                      <td className="num">—</td>
                    </tr>
                    <tr>
                      <td>১ জুলাই ২০২৬ – ৩১ ডিসেম্বর ২০২৭</td>
                      <td className="num">
                        পর্যায়ভিত্তিক
                        <div className="rule-ref">বেতন নির্ধারণ পাতা দেখুন</div>
                      </td>
                      <td className="num">
                        {bnNumber(oldAllowanceAmount)}
                        {oldSBAmount > 0 && (
                          <div className="rule-ref" style={{ color: 'var(--danger)' }}>
                            বিশেষ সুবিধা − {bnNumber(oldSBAmount)} (বিলুপ্ত)
                          </div>
                        )}
                      </td>
                      <td className="num">—</td>
                    </tr>
                    <tr className="total">
                      <td>১ জানুয়ারি ২০২৮ হইতে</td>
                      <td className="num">{bnNumber(basic)}</td>
                      <td className="num">{bnNumber(result.total)}</td>
                      <td className="num">{bnNumber(basic + result.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
