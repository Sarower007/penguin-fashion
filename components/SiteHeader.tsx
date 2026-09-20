'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: 'বেতন নির্ধারণ' },
  { href: '/salary', label: 'মাসিক বেতন ও ভাতা' },
  { href: '/pension', label: 'পেনশন' },
  { href: '/increment', label: 'ইনক্রিমেন্ট প্রক্ষেপণ' },
  { href: '/scales', label: 'বেতনস্কেল সারণি' },
  { href: '/allowances', label: 'ভাতার হার' },
  { href: '/order', label: 'আদেশের সারসংক্ষেপ' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="container">
        <div className="header-top">
          <div className="header-mark" aria-hidden="true">
            ৳
          </div>
          <div className="header-title">
            <h1>জাতীয় বেতনস্কেল, ২০২৬ — সম্পূর্ণ ক্যালকুলেটর</h1>
            <p>
              চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ · এস.আর.ও. নং ৩৪৭-আইন/২০২৬ · গেজেট
              তারিখ ১৭ সেপ্টেম্বর ২০২৬
            </p>
          </div>
        </div>
        <nav className="site-nav" aria-label="প্রধান মেনু">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
