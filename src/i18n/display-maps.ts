/**
 * Display-only localization for backend-coupled values.
 *
 * Some strings are simultaneously the *value* stored/sent to the backend AND
 * the label shown to the user — e.g. the option titles returned by the
 * AttributeOption API ('فروشی'), and city names. We must NOT change the stored
 * value (that would break API calls and saved records), so instead we keep the
 * Persian value canonical and translate it to English *only at render time*.
 *
 * Usage in a component (so it re-renders on language change):
 *   const {i18n} = useTranslation();
 *   <Text>{localizeOption(item.title)}</Text>   // reads i18n.language
 *
 * Maps are keyed by the canonical Persian value → English label. Unknown values
 * fall through unchanged, so partial coverage is safe.
 */
import i18n from './index';

/** City / province / state names (proper nouns). From src/utiles/cities.ts. */
export const cityDisplayMap: Record<string, string> = {
  آزادشهر: 'Azadshahr',
  'آق قلا': 'Aqqala',
  انبارآلوم: 'Anbar Olum',
  'اینچه برون': 'Incheh Borun',
  بندرترکمن: 'Bandar Torkaman',
  بندرگز: 'Bandar Gaz',
  تاتارعلیا: 'Tatar Olya',
  ترکمن: 'Torkaman',
  جلین: 'Jelin',
  'خان ببین': 'Khan Bebin',
  دلند: 'Daland',
  رامیان: 'Ramian',
  سرخنکلاته: 'Sorkhankalateh',
  سنگدوین: 'Sangdovin',
  'سیمین شهر': 'Simin Shahr',
  'علی آباد': 'Aliabad',
  'علی اباد': 'Aliabad',
  'فاضل آباد': 'Fazelabad',
  فراغی: 'Faraghi',
  قرق: 'Qeroq',
  مراوه: 'Maraveh',
  'مراوه تپه': 'Maraveh Tappeh',
  مزرعه: 'Mazraeh',
  مینودشت: 'Minudasht',
  'نوده خاندوز': 'Nodeh Khanduz',
  نوکنده: 'Nowkandeh',
  'نگین شهر': 'Negin Shahr',
  کردکوی: 'Kordkuy',
  کلاله: 'Kalaleh',
  گالیکش: 'Galikesh',
  گرگان: 'Gorgan',
  گلستان: 'Golestan',
  'گمیش تپه': 'Gomish Tappeh',
  گمیشان: 'Gomishan',
  گنبدکاووس: 'Gonbad-e Kavus',
};

/** Option / attribute values shown in pickers (adsType, education, brand, …). */
export const optionDisplayMap: Record<string, string> = {
  // adsType
  فروشی: 'For sale',
  'اجاره ای': 'For rent',
  درخواستی: 'Wanted',
  // contractType
  'تمام وقت': 'Full-time',
  'پاره وقت': 'Part-time',
  'مشاوره ای': 'Consulting',
  'پروژه ای': 'Project-based',
  // education
  'زیر دیپلم': 'Below diploma',
  دیپلم: 'Diploma',
  کاردانی: 'Associate degree',
  کارشناسی: "Bachelor's",
  'کارشناسی ارشد': "Master's",
  'دکتری و بالاتر': 'PhD and above',
  // creator / yes-no / has-not
  شخصی: 'Personal',
  املاک: 'Real estate',
  'مشاور املاک': 'Real-estate agent',
  بنگاه: 'Agency',
  شرکت: 'Company',
  شرکتی: 'Corporate',
  هست: 'Yes',
  نیست: 'No',
  دارد: 'Yes',
  ندارد: 'No',
  بله: 'Yes',
  خیر: 'No',
  // rooms / floor
  'بدون اتاق': 'No room',
  'چهار یا بیشتر': 'Four or more',
  زیرزمین: 'Basement',
  همکف: 'Ground floor',
  یک: 'One',
  دو: 'Two',
  سه: 'Three',
  چهار: 'Four',
  'پنج یا بیشتر': 'Five or more',
  // price mode
  'قیمت مورد نظر': 'Desired price',
  مجانی: 'Free',
  'توافقی (تماس بگیرید)': 'Negotiable (call)',
  // pay type
  نقدی: 'Cash',
  اقساطی: 'Installment',
  قسطی: 'Installment',
  نقد: 'Cash',
  // chassis / base type
  'سدان(سواری)': 'Sedan',
  'هاچ بک': 'Hatchback',
  'شاسی بلند': 'SUV',
  وانت: 'Pickup',
  ون: 'Van',
  'کوپه/کروک': 'Coupe / Convertible',
  استیشن: 'Station wagon',
  دیگر: 'Other',
  // car brands
  آیودی: 'Audi',
  آریسان: 'Arisun',
  'آریو(زوتی)': 'Zotye Arrizo',
  'آلفا رومیو': 'Alfa Romeo',
  اپل: 'Opel',
  'ام جی': 'MG',
  'ام وی ام': 'MVM',
  ایسوزو: 'Isuzu',
  بایک: 'BAIC',
  برلیانس: 'Brilliance',
  بسترن: 'Besturn',
  بنز: 'Benz',
  'بی ام و': 'BMW',
  'بی وای دی': 'BYD',
  پاژن: 'Pajun',
  پراید: 'Pride',
  پرتون: 'Proton',
  پژو: 'Peugeot',
  پورشه: 'Porsche',
  پیکان: 'Paykan',
  تویوتا: 'Toyota',
  تیبا: 'Tiba',
  جک: 'JAC',
  جیپ: 'Jeep',
  جیلی: 'Geely',
  چانگان: 'Changan',
  چری: 'Chery',
  'دانگ فنگ (اچ سی کراس)': 'Dongfeng (H30 Cross)',
  دنا: 'Dena',
  دوو: 'Daewoo',
  'دی اس': 'DS',
  رانا: 'Rana',
  رنو: 'Renault',
  'سانگ یانگ': 'SsangYong',
  ساینا: 'Saina',
  سمند: 'Samand',
  سوبارو: 'Subaru',
  سوزوکی: 'Suzuki',
  سیتروین: 'Citroën',
  فاو: 'FAW',
  'فولکس واگن': 'Volkswagen',
  فیات: 'Fiat',
  کاپرا: 'Capra',
  کارا: 'Kara',
  کیا: 'Kia',
  'گریت وال': 'Great Wall',
  لکسوس: 'Lexus',
  'لند مارک': 'Landmark',
  لندور: 'Lander',
  لیفان: 'Lifan',
  مازراتی: 'Maserati',
  مزدا: 'Mazda',
  میتسوبیشی: 'Mitsubishi',
  نیسان: 'Nissan',
  ولوو: 'Volvo',
  هایما: 'Haima',
  هوندا: 'Honda',
  هیوندای: 'Hyundai',
};

/** Category titles — ad categories (data.ts), job classes and offer categories. */
export const categoryDisplayMap: Record<string, string> = {
  // main ad categories
  استخدامی: 'Hiring',
  'تخفیف یاب': 'Discount Finder',
  املاک: 'Real estate',
  'وسایل نقلیه': 'Vehicles',
  'لوازم الکترونیکی': 'Electronics',
  'لوازم خانگی': 'Home appliances',
  خدمات: 'Services',
  'تجهیزات و عمده فروشی': 'Equipment & wholesale',
  'سرگرمی و فراغت': 'Entertainment & leisure',
  'وسایل شخصی': 'Personal items',
  // hiring subcategories
  'فنی / مهندسی': 'Technical / Engineering',
  منشی: 'Secretary',
  'پزشک / پرستار': 'Doctor / Nurse',
  'اداری / مدیریت': 'Administrative / Management',
  'آموزش(مدرس)': 'Teaching (Instructor)',
  'مالی و حسابداری / حقوقی': 'Finance & Accounting / Legal',
  'فروشنده / بازاریاب': 'Salesperson / Marketer',
  'سرایدار / نظافت / نگهبانی': 'Janitor / Cleaning / Security',
  'رستوران / صندوقدار': 'Restaurant / Cashier',
  'کارهای ساختمانی': 'Construction work',
  'هنری / رسانه / تبلیغات': 'Arts / Media / Advertising',
  'زیبایی / بهداشتی / درمانی': 'Beauty / Health / Medical',
  'رایانه / فناوری اطلاعات': 'Computer / IT',
  'حمل و نقل / باربری': 'Transport / Freight',
  سایر: 'Other',
  // real-estate subcategories
  'فروش مسکونی': 'Residential sale',
  'رهن و اجاره مسکونی': 'Residential deposit & rent',
  'فروش اداری و تجاری': 'Office & commercial sale',
  'رهن و اجاره اداری و تجاری': 'Office & commercial deposit & rent',
  'عقد مشارکت / امور مالی و حقوقی': 'Partnership / Financial & legal',
  'خرید / فروش / اجاره زمین کشاورزی و باغ': 'Buy / Sell / Rent farmland & orchard',
  آپارتمان: 'Apartment',
  'خانه و ویلا': 'House & villa',
  زمین: 'Land',
  'مغازه / غرفه': 'Shop / Booth',
  'دفتر کار / واحد اداری / مطب': 'Office / Admin unit / Clinic',
  'صنعتی / تجاری': 'Industrial / Commercial',
  // vehicle subcategories
  'خودرو سواری': 'Passenger car',
  'سنگین و نیمه سنگین': 'Heavy & semi-heavy',
  'موتور سیکلت و لوازم جانبی': 'Motorcycle & accessories',
  'قطعات یدکی و لوازم جانبی خودرو': 'Spare parts & car accessories',
  'ماشین الات کشاورزی و عمرانی': 'Agricultural & construction machinery',
  // job classes (business categories)
  'بهداشت و درمان': 'Health & medical',
  'بازرگانی و تجارت': 'Trade & commerce',
  اتومبیل: 'Automobiles',
  'آرایش و پیرایش': 'Beauty & grooming',
  'مراکز تحصیلی': 'Educational centers',
  'آموزشگاه هنری': 'Arts academy',
  'آموزشگاه ورزشی': 'Sports academy',
  'آموزش و پژوهش': 'Education & research',
  'خدمات مجلس': 'Event services',
  'کامپیوتر و موبایل': 'Computer & mobile',
  'جواهرات و بدلیجات': 'Jewelry & costume jewelry',
  'جواهرآلات و بدلیجات': 'Jewelry & costume jewelry',
  پوشاک: 'Clothing',
  ساختمان: 'Construction',
  'کشاورزی دامپروری': 'Agriculture & animal husbandry',
  'خدمات اجتماعی': 'Social services',
  'چاپ و تبلیغات': 'Printing & advertising',
  'سایر خدمات': 'Other services',
  صنعت: 'Industry',
  'صنایع غذایی': 'Food industry',
  'دکوراسیون داخلی': 'Interior decoration',
  // offer categories
  'تخفیف اخر هفته': 'Weekend discount',
  'رستوران و کافی شاپ': 'Restaurant & coffee shop',
  'آرایشی و بهداشتی': 'Cosmetics & hygiene',
  'سلامتی و پزشکی': 'Health & medical',
  'تفریحی ورزشی': 'Recreation & sports',
  'لوازم جانبی': 'Accessories',
  'لوازم خودرو و ابزار': 'Car parts & tools',
  زیورآلات: 'Jewelry',
  'ظروف و ابزار آشپزخانه و خانه': 'Kitchenware & home tools',
  آموزش: 'Education',
  'هنر و تیاتر': 'Art & theater',
  'هتل و سفر': 'Hotel & travel',
  'لوازم سفر': 'Travel gear',
  'لوازم تحریر': 'Stationery',
};

const isEnglish = () => i18n.language === 'en';

const localizeWith = (
  map: Record<string, string>,
  value?: string | null,
): string => {
  if (value == null) {
    return '';
  }
  if (!isEnglish()) {
    return value;
  }
  return map[value] ?? value;
};

export const localizeCity = (value?: string | null) =>
  localizeWith(cityDisplayMap, value);

export const localizeOption = (value?: string | null) =>
  localizeWith(optionDisplayMap, value);

export const localizeCategory = (value?: string | null) =>
  localizeWith(categoryDisplayMap, value);

/**
 * Generic fallback: tries every known map (cities, options, categories) in turn.
 * Handy where a value's origin is ambiguous at the call site. Prefer the
 * specific helpers above when you know the value's kind.
 */
export const localizeValue = (value?: string | null): string => {
  if (value == null) {
    return '';
  }
  if (!isEnglish()) {
    return value;
  }
  return (
    optionDisplayMap[value] ??
    categoryDisplayMap[value] ??
    cityDisplayMap[value] ??
    value
  );
};
