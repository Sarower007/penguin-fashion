import type { Metadata, Viewport } from 'next';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: {
    default: 'জাতীয় বেতনস্কেল ২০২৬ ক্যালকুলেটর',
    template: '%s | জাতীয় বেতনস্কেল ২০২৬ ক্যালকুলেটর',
  },
  description:
    'চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ (এস.আর.ও. নং ৩৪৭-আইন/২০২৬) অনুযায়ী বেতন নির্ধারণ, ভাতাদি, পেনশন ও বার্ষিক ইনক্রিমেন্টের সম্পূর্ণ ক্যালকুলেটর।',
  keywords: [
    'জাতীয় বেতনস্কেল ২০২৬',
    'বেতন নির্ধারণ',
    'pay fixation 2026',
    'বাংলাদেশ গেজেট',
    'পেনশন ক্যালকুলেটর',
    'বাড়ি ভাড়া ভাতা',
  ],
  authors: [{ name: 'সারোয়ার আলম জিয়া' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0c6b4f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteHeader />
        <main>
          <div className="container">{children}</div>
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
