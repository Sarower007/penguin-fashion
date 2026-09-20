export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="dev-card">
          <div>
            <div className="dev-meta">Developed by</div>
            <div className="dev-name">সারোয়ার আলম জিয়া</div>
            <div className="dev-meta">
              সহকারী শিক্ষক, ময়মনসিংহ জিলা স্কুল
            </div>
          </div>
          <div className="dev-meta" style={{ textAlign: 'right' }}>
            তথ্যসূত্র: বাংলাদেশ গেজেট, অতিরিক্ত সংখ্যা
            <br />
            বৃহস্পতিবার, সেপ্টেম্বর ১৭, ২০২৬
          </div>
        </div>
        <p className="footer-note">
          এই ক্যালকুলেটরের সকল হিসাব চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ এর বিধান
          অনুসরণে প্রস্তুত করা হইয়াছে। ইহা একটি সহায়ক টুল; বেতন নির্ধারণের
          চূড়ান্ত ও আনুষ্ঠানিক হিসাব iBAS++ (www.ibas.finance.gov.bd) এর Pay
          Fixation অপশনে সম্পন্ন করিতে হইবে এবং সংশ্লিষ্ট হিসাবরক্ষণ অফিস
          কর্তৃক প্রতিপাদিত ‘বেতন নির্ধারণী বিবরণী’-ই চূড়ান্ত বলিয়া গণ্য হইবে
          (অনুচ্ছেদ ৩২)।
        </p>
      </div>
    </footer>
  );
}
