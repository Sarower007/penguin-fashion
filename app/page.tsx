import Link from 'next/link';
import PayFixationTool from '@/components/PayFixationTool';

export const metadata = {
  title: 'বেতন নির্ধারণ ক্যালকুলেটর',
  description:
    'জাতীয় বেতনস্কেল, ২০২৬ এ বেতন নির্ধারণ — অনুচ্ছেদ ৫ ও ৯ অনুযায়ী ধাপে ধাপে সম্পূর্ণ হিসাব।',
};

const TOOLS = [
  {
    href: '/salary',
    icon: '🧾',
    title: 'মাসিক বেতন ও ভাতা',
    desc: 'মূল বেতন, বাড়ি ভাড়া, চিকিৎসা, টিফিন, যাতায়াতসহ সম্পূর্ণ বেতন বিবরণী।',
  },
  {
    href: '/pension',
    icon: '👵',
    title: 'পেনশন ক্যালকুলেটর',
    desc: 'অনুচ্ছেদ ৮ এর সারণি অনুযায়ী নিট পেনশন নির্ধারণ ও পর্যায়ভিত্তিক প্রাপ্যতা।',
  },
  {
    href: '/increment',
    icon: '📈',
    title: 'ইনক্রিমেন্ট প্রক্ষেপণ',
    desc: 'বৎসরওয়ারি বার্ষিক বেতনবৃদ্ধির প্রক্ষেপণ ও উচ্চতর গ্রেডের বিধান।',
  },
  {
    href: '/scales',
    icon: '📊',
    title: 'বেতনস্কেল সারণি',
    desc: '২০১৫ ও ২০২৬ স্কেলের ২০টি গ্রেডের প্রতিটি ধাপ পাশাপাশি।',
  },
  {
    href: '/allowances',
    icon: '💼',
    title: 'ভাতার হার',
    desc: 'অনুচ্ছেদ ১২–২৮ এ নির্ধারিত সকল ভাতার হার এক নজরে।',
  },
  {
    href: '/order',
    icon: '📜',
    title: 'আদেশের সারসংক্ষেপ',
    desc: 'গেজেটের গুরুত্বপূর্ণ অনুচ্ছেদসমূহের সংক্ষিপ্তসার ও তারিখ-পঞ্জি।',
  },
];

export default function HomePage() {
  return (
    <>
      <div className="page-head">
        <h2>জাতীয় বেতনস্কেল, ২০২৬ এ বেতন নির্ধারণ</h2>
        <p>
          ৩০ জুন ২০২৬ তারিখের মূল বেতন ও গ্রেড দিন — অনুচ্ছেদ ৫ ও অনুচ্ছেদ ৯ এর বিধান
          অনুযায়ী ১ জুলাই ২০২৬ তারিখে আপনার নতুন মূল বেতন, পর্যায়ভিত্তিক প্রাপ্যতা ও
          বকেয়ার সম্পূর্ণ হিসাব দেখুন।
        </p>
      </div>

      <div className="alert alert-info">
        <strong>কার্যকারিতা:</strong> এই আদেশ ১ জুলাই ২০২৬ তারিখ হইতে কার্যকর হইয়াছে
        বলিয়া গণ্য হইবে (অনুচ্ছেদ ১(২))। নতুন বেতন শতভাগ প্রদান করা হইবে ১ জুলাই ২০২৭
        তারিখ হইতে; তৎপূর্বে বেতনবৃদ্ধির ৪০%/৫০% ও ৭০%/৭৫% হারে প্রদেয় হইবে।
      </div>

      <PayFixationTool />

      <div className="page-head" style={{ marginTop: 26 }}>
        <h2>অন্যান্য ক্যালকুলেটর ও তথ্য</h2>
        <p>গেজেটের সকল অনুচ্ছেদ ভিত্তিক আলাদা আলাদা টুল।</p>
      </div>
      <div className="tool-grid">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="tool-card">
            <span className="tool-icon" aria-hidden="true">
              {t.icon}
            </span>
            <strong>{t.title}</strong>
            <span>{t.desc}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
