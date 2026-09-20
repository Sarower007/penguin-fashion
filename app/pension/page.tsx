import PensionTool from '@/components/PensionTool';

export const metadata = {
  title: 'পেনশন ক্যালকুলেটর',
  description:
    'চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ এর অনুচ্ছেদ ৮ অনুযায়ী অবসরভোগী ও আজীবন পারিবারিক পেনশনভোগীর নিট পেনশন নির্ধারণ।',
};

export default function PensionPage() {
  return (
    <>
      <div className="page-head">
        <h2>পেনশন ও নিট পেনশন নির্ধারণ</h2>
        <p>
          অবসরভোগী ও আজীবন পারিবারিক পেনশনভোগীর ৩০ জুন ২০২৬ তারিখের নিট পেনশনকে ভিত্তি
          ধরিয়া অনুচ্ছেদ ৮ এর সারণি অনুযায়ী নতুন নিট পেনশন, পর্যায়ভিত্তিক প্রাপ্যতা ও
          অন্যান্য ভাতার হিসাব।
        </p>
      </div>
      <PensionTool />
    </>
  );
}
