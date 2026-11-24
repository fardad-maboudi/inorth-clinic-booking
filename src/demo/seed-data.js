/**
 * Demo catalogue for the clinic showcase. Mirrors `gallery/clinic-booking/seed/`
 * (the production seed pack applied through plugin routes); here it feeds the
 * in-browser demo engine so the app runs with a plain `vite` dev server.
 * Weekdays are `Date.getDay()` indexes (0 = Sunday ... 6 = Saturday).
 */
const WEEK = [6, 0, 1, 2, 3]; // شنبه تا چهارشنبه
const hours = (days, from, to) => days.map((weekday) => ({ weekday, startTime: from, endTime: to }));

export const STAFF = [
  { key: 'rezaei', name: 'دکتر مریم رضایی', title: 'متخصص پوست و مو', bio: 'ده سال سابقه درمان آکنه، لک و جوانسازی پوست.', color: '#0f766e', hours: [...hours(WEEK, '10:00', '18:00'), ...hours([4], '10:00', '14:00')] },
  { key: 'karimi', name: 'سارا کریمی', title: 'کارشناس لیزر و زیبایی', bio: 'کارشناس ارشد لیزر موهای زائد با دستگاه‌های روز دنیا.', color: '#be185d', hours: hours(WEEK, '11:00', '19:00') },
  { key: 'ahmadi', name: 'نگار احمدی', title: 'پزشک زیبایی', bio: 'تخصص در تزریقات ژل و بوتاکس با رویکرد طبیعی.', color: '#7c3aed', hours: hours([6, 1, 3], '12:00', '19:00') },
  { key: 'mousavi', name: 'الهام موسوی', title: 'ماساژ درمانگر', bio: 'ماساژ سوئدی و ریلکسیشن با مجوز رسمی بهداشت.', color: '#b45309', hours: [...hours(WEEK, '10:00', '17:00'), ...hours([4], '10:00', '13:00')] },
];

export const SERVICES = [
  { key: 'skin', name: 'ویزیت و مشاوره پوست', group: 'پوست و مو', description: 'معاینه تخصصی پوست، تعیین برنامه درمان و مراقبت خانگی.', durationMinutes: 30, bufferAfterMinutes: 10, price: 8_000_000, color: '#0f766e', staff: ['rezaei', 'ahmadi'], package: { enabled: true, name: 'بسته ۴ جلسه‌ای پوست', sessionCount: 4, price: 28_000_000, validityDays: 90 } },
  { key: 'laser', name: 'لیزر موهای زائد (یک ناحیه)', group: 'لیزر', description: 'لیزر الکساندرایت با خنک‌کننده، مناسب انواع پوست.', durationMinutes: 45, bufferAfterMinutes: 15, price: 6_000_000, color: '#be185d', staff: ['karimi'], package: { enabled: true, name: 'بسته ۶ جلسه لیزر', sessionCount: 6, price: 30_000_000, validityDays: 240 } },
  { key: 'massage', name: 'ماساژ ریلکسیشن ۶۰ دقیقه‌ای', group: 'ماساژ و اسپا', description: 'ماساژ سوئدی با روغن‌های گیاهی برای رفع خستگی.', durationMinutes: 60, bufferAfterMinutes: 15, price: 9_000_000, color: '#b45309', staff: ['mousavi'] },
];

export const TIMEOFF = [
  { startsAt: '2027-03-20T00:00:00.000Z', endsAt: '2027-03-23T23:59:59.000Z', allDay: true, kind: 'holiday', reason: 'تعطیلات نوروز', repeatsAnnually: true },
];

export const FAQ = [
  { question: 'چطور نوبت خود را لغو یا جابه‌جا کنم؟', answer: 'تا ۲۴ ساعت قبل از موعد از بخش «حساب من» می‌توانید بدون جریمه لغو یا جابه‌جا کنید.', category: 'نوبت' },
  { question: 'آیا بسته‌های چندجلسه‌ای تاریخ انقضا دارند؟', answer: 'بله، اعتبار هر بسته در توضیح آن نوشته شده و جلسات باقی‌مانده در حساب شما دیده می‌شود.', category: 'بسته‌ها' },
  { question: 'یادآوری نوبت چگونه ارسال می‌شود؟', answer: 'با اتصال تلگرام، یادآور ۲۴ ساعت و ۲ ساعت قبل از نوبت برای شما ارسال می‌شود.', category: 'یادآوری' },
  { question: 'اگر سر وقت نرسم چه می‌شود؟', answer: 'تا ۱۵ دقیقه تأخیر مشکلی ندارد؛ پس از آن نوبت شما ممکن است به فرد بعدی داده شود.', category: 'نوبت' },
  { question: 'آیا می‌توان با کارت هدیه خدمت رزرو کرد؟', answer: 'بله، کد کارت هدیه را هنگام پذیرش به همکار ما بدهید تا از اعتبار شما کسر شود.', category: 'بسته‌ها' },
];

/** Prepaid packages and the gift card are digital ecommerce products. */
export const PRODUCTS = [
  { title: 'بسته ۴ جلسه‌ای پوست', slug: 'skin-4', price: 2_800_000, tags: ['booking-package'], attributes: { serviceKey: 'skin', sessions: '4', validityDays: '90' }, description: 'چهار جلسه ویزیت و درمان پوست با دکتر رضایی؛ اعتبار ۹۰ روز.' },
  { title: 'بسته ۶ جلسه لیزر', slug: 'laser-6', price: 3_000_000, tags: ['booking-package'], attributes: { serviceKey: 'laser', sessions: '6', validityDays: '240' }, description: 'شش جلسه لیزر یک ناحیه؛ اعتبار ۸ ماه.' },
  { title: 'کارت هدیه ۲ میلیون تومانی', slug: 'gift-2m', price: 2_000_000, tags: ['gift-card'], attributes: {}, description: 'کارت هدیه قابل استفاده برای همه خدمات کلینیک.' },
];

export const REVIEWS = [
  { name: 'نیلوفر ع.', rating: 5, comment: 'محیط آرام، همکاران حرفه‌ای و رزرو آنلاین واقعاً راحت بود. یادآور تلگرام عالی است.' },
  { name: 'مینا ر.', rating: 5, comment: 'جلسات لیزر بدون درد و با نتیجه عالی. بسته‌ها هم اقتصادی هستند.' },
  { name: 'پگاه ک.', rating: 4, comment: 'دکتر رضایی دقیق و صبور هستند. فقط ای کاش ساعت‌های بیشتری آزاد بود.' },
  { name: 'ساناز م.', rating: 5, comment: 'ماساژ ریلکسیشن بهترین هدیه‌ای بود که به خودم دادم.' },
  { name: 'الهه ن.', rating: 5, comment: 'جابه‌جایی نوبت فقط با دو کلیک؛ خیلی کم پیش میاد جایی اینقدر ساده باشه.' },
];

export const DEMO_CLIENTS = [
  { fullName: 'سارا مرادی', phoneNumber: '+989121110001', visitCount: 6, noShowCount: 0 },
  { fullName: 'مریم حسینی', phoneNumber: '+989121110002', visitCount: 3, noShowCount: 1 },
  { fullName: 'نازنین صادقی', phoneNumber: '+989121110003', visitCount: 9, noShowCount: 0 },
  { fullName: 'الهام بهرامی', phoneNumber: '+989121110004', visitCount: 1, noShowCount: 2 },
  { fullName: 'یاسمن فرهادی', phoneNumber: '+989121110005', visitCount: 4, noShowCount: 0 },
  { fullName: 'رها کاظمی', phoneNumber: '+989121110006', visitCount: 2, noShowCount: 0 },
  { fullName: 'آتنا محمدی', phoneNumber: '+989121110007', visitCount: 7, noShowCount: 0 },
  { fullName: 'کیمیا شریفی', phoneNumber: '+989121110008', visitCount: 5, noShowCount: 1 },
];

export const STAFF_PHONE = '+989120000101';
export const DEMO_MEMBER_PHONE = '+989121110001';
