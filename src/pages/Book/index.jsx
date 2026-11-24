import BookingFlow from '@/components/site/BookingFlow';
import { PageHead } from '@/components/site/ui';
import { useTitle } from '@/components/site/hooks';

export default function BookPage() {
  useTitle('رزرو نوبت');
  return (
    <>
      <PageHead eyebrow="رزرو آنلاین" title="نوبت خود را در چهار قدم بگیرید" lead="خدمت، متخصص و زمان را انتخاب کنید. با حساب کاربری یا بدون آن می‌توانید رزرو کنید." />
      <BookingFlow />
    </>
  );
}
