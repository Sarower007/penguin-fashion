import ScaleTable from '@/components/ScaleTable';

export const metadata = {
  title: 'বেতনস্কেল সারণি',
  description:
    'জাতীয় বেতনস্কেল, ২০১৫ ও জাতীয় বেতনস্কেল, ২০২৬ এর ২০টি গ্রেডের প্রতিটি ধাপ পাশাপাশি।',
};

export default function ScalesPage() {
  return (
    <>
      <div className="page-head">
        <h2>জাতীয় বেতনস্কেল সারণি</h2>
        <p>
          গেজেটের অনুচ্ছেদ ৩(১) এর সারণি অনুযায়ী বর্তমান বেতনস্কেল (২০১৫) ও উহার
          বিপরীতে কার্যকর অনুরূপ স্কেল (২০২৬)।
        </p>
      </div>
      <ScaleTable />
    </>
  );
}
