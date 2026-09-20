import SalaryTool from '@/components/SalaryTool';

export const metadata = {
  title: 'মাসিক বেতন ও ভাতা ক্যালকুলেটর',
  description:
    'জাতীয় বেতনস্কেল, ২০২৬ অনুযায়ী মূল বেতনসহ বাড়ি ভাড়া, চিকিৎসা, শিক্ষা সহায়ক, টিফিন, যাতায়াত, মোবাইলসহ সকল ভাতার মাসিক হিসাব।',
};

export default function SalaryPage() {
  return (
    <>
      <div className="page-head">
        <h2>মাসিক বেতন ও ভাতা বিবরণী</h2>
        <p>
          নির্ধারিত মূল বেতন ও ব্যক্তিগত তথ্যের ভিত্তিতে অনুচ্ছেদ ১২–২৮ অনুযায়ী প্রাপ্য
          সকল ভাতার পূর্ণাঙ্গ হিসাব।
        </p>
      </div>
      <SalaryTool />
    </>
  );
}
