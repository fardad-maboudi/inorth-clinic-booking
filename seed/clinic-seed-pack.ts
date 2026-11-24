/**
 * Declarative demo data for the clinic showcase. Applied by
 * `scripts/seed.ts` through the plugin HTTP routes as the site admin, never
 * written into the bundle (the bundle is exported with `includeData: false`).
 * Weekdays are `Date.getDay()` indexes (0 = Sunday ... 6 = Saturday).
 */
export interface SeedStaff {
  key: string;
  name: string;
  title: string;
  bio: string;
  color: string;
  /** [weekday, startTime, endTime] */
  hours: [number, string, string][];
}
export interface SeedService {
  key: string;
  name: string;
  group: string;
  description: string;
  durationMinutes: number;
  bufferAfterMinutes: number;
  price: number;
  color: string;
  staff: string[];
  package?: { name: string; sessionCount: number; price: number; validityDays: number };
}

const WEEK_6D = [6, 0, 1, 2, 3]; // شنبه تا چهارشنبه
const hours = (days: number[], from: string, to: string): [number, string, string][] =>
  days.map((d) => [d, from, to]);

export const STAFF: SeedStaff[] = [
  { key: 'rezaei', name: 'دکتر مریم رضایی', title: 'متخصص پوست و مو', bio: 'ده سال سابقه درمان آکنه، لک و جوانسازی پوست.', color: '#0f766e', hours: [...hours(WEEK_6D, '10:00', '18:00'), [4, '10:00', '14:00']] },
  { key: 'karimi', name: 'سارا کریمی', title: 'کارشناس لیزر و زیبایی', bio: 'کارشناس ارشد لیزر موهای زائد با دستگاه‌های روز دنیا.', color: '#be185d', hours: hours(WEEK_6D, '11:00', '19:00') },
  { key: 'ahmadi', name: 'نگار احمدی', title: 'پزشک زیبایی', bio: 'تخصص در تزریقات ژل و بوتاکس با رویکرد طبیعی.', color: '#7c3aed', hours: hours([6, 1, 3], '12:00', '19:00') },
  { key: 'mousavi', name: 'الهام موسوی', title: 'ماساژ درمانگر', bio: 'ماساژ سوئدی و ریلکسیشن با مجوز رسمی بهداشت.', color: '#b45309', hours: [...hours(WEEK_6D, '10:00', '17:00'), [4, '10:00', '13:00']] },
];

export const SERVICES: SeedService[] = [
  { key: 'skin', name: 'ویزیت و مشاوره پوست', group: 'پوست و مو', description: 'معاینه تخصصی پوست، تعیین برنامه درمان و مراقبت خانگی.', durationMinutes: 30, bufferAfterMinutes: 10, price: 8_000_000, color: '#0f766e', staff: ['rezaei', 'ahmadi'], package: { name: 'بسته ۴ جلسه‌ای پوست', sessionCount: 4, price: 28_000_000, validityDays: 90 } },
  { key: 'laser', name: 'لیزر موهای زائد (یک ناحیه)', group: 'لیزر', description: 'لیزر الکساندرایت با خنک‌کننده، مناسب انواع پوست.', durationMinutes: 45, bufferAfterMinutes: 15, price: 6_000_000, color: '#be185d', staff: ['karimi'], package: { name: 'بسته ۶ جلسه لیزر', sessionCount: 6, price: 30_000_000, validityDays: 240 } },
  { key: 'massage', name: 'ماساژ ریلکسیشن ۶۰ دقیقه‌ای', group: 'ماساژ و اسپا', description: 'ماساژ سوئدی با روغن‌های گیاهی برای رفع خستگی.', durationMinutes: 60, bufferAfterMinutes: 15, price: 9_000_000, color: '#b45309', staff: ['mousavi'] },
];

/** Nowruz closure for the whole clinic (resource-less time-off = every resource). */
export const HOLIDAY = {
  startsAt: '2027-03-20T00:00:00.000Z',
  endsAt: '2027-03-23T23:59:59.000Z',
  allDay: true,
  kind: 'holiday',
  reason: 'تعطیلات نوروز',
  repeatsAnnually: true,
};

export const FAQ = [
  { question: 'چطور نوبت خود را لغو یا جابه‌جا کنم؟', answer: 'تا ۲۴ ساعت قبل از موعد از بخش «حساب من» می‌توانید بدون جریمه لغو یا جابه‌جا کنید.' },
  { question: 'آیا بسته‌های چندجلسه‌ای تاریخ انقضا دارند؟', answer: 'بله، اعتبار هر بسته در توضیح آن نوشته شده و جلسات باقی‌مانده در حساب شما دیده می‌شود.' },
  { question: 'یادآوری نوبت چگونه ارسال می‌شود؟', answer: 'با اتصال تلگرام، یادآور ۲۴ ساعت و ۲ ساعت قبل از نوبت برای شما ارسال می‌شود.' },
];

/**
 * Prepaid packages and gift cards are sold as digital ecommerce products (the
 * ecommerce routes own checkout and payment; never custom money code). A paid
 * order is fulfilled by staff from the panel: it grants a `booking_credit`
 * (`grantCredit`) for the client. Prices are in تومان (currency IRT).
 * `bookingPackage` ties a product to the service whose sessions it grants.
 */
export const SALES_PRODUCTS = [
  { title: 'بسته ۴ جلسه‌ای پوست', slug: 'skin-4', price: 2_800_000, tags: ['booking-package'], serviceKey: 'skin', sessions: 4, validityDays: 90, description: 'چهار جلسه ویزیت و درمان پوست با دکتر رضایی؛ اعتبار ۹۰ روز.' },
  { title: 'بسته ۶ جلسه لیزر', slug: 'laser-6', price: 3_000_000, tags: ['booking-package'], serviceKey: 'laser', sessions: 6, validityDays: 240, description: 'شش جلسه لیزر یک ناحیه؛ اعتبار ۸ ماه.' },
  { title: 'کارت هدیه ۲ میلیون تومانی', slug: 'gift-2m', price: 2_000_000, tags: ['gift-card'], description: 'کارت هدیه قابل استفاده برای همه خدمات کلینیک.' },
] as const;
