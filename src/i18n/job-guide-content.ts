/**
 * Static "choose the right trade" guide content for the job-posting flow
 * (CreateJobHelperScreen and JobCategoryGuideScreen). Kept out of the main
 * catalog because it is a large block of reference copy; the screens pick the
 * fa/en array based on i18n.language. The category *names* mirror the design's
 * wording (which may differ slightly from the backend's seeded labels).
 */
export interface JobGuideEntry {
  title: string;
  description: string;
}

// Source: CreateJobHelperScreen (Figma node 106:3561).
export const CREATE_JOB_HELPER_GUIDE_FA: JobGuideEntry[] = [
  {
    title: 'آرایش و پیرایش',
    description:
      'سالن آرایش، آرایشگاه، آموزشگاه مراقبت و زیبایی، آموزشگاه آرایش و پیرایش و غیره',
  },
  {
    title: 'اتومبیل',
    description: 'نمایندگی و خدمات پس از فروش، فروشگاه لوازم یدکی و غیره',
  },
  {title: 'بازرگانی و تجارت', description: 'شرکت‌ها و بازرگانی‌ها و غیره'},
  {
    title: 'بهداشت و درمان',
    description:
      'پزشکان، درمانگاه شبانه‌روزی، مطب، دفتر مشاوره، تجهیزات پزشکی و غیره',
  },
  {
    title: 'آموزش و پژوهش',
    description:
      'آکادمی زبان‌های خارجی، موسسه زبان، آموزشگاه راهنمایی و رانندگی، آموزشگاه فنی و حرفه‌ای، آموزشگاه نرم‌افزار، فرهنگی و غیره',
  },
  {
    title: 'آموزشگاه ورزشی',
    description:
      'باشگاه ورزشی، باشگاه بدنسازی، استخر، مدرسه شطرنج، باشگاه سوارکاری، باشگاه رزمی و غیره',
  },
  {
    title: 'آموزشگاه هنری',
    description:
      'آموزشگاه موسیقی، آموزشگاه آشپزی و شیرینی‌پزی، آموزشگاه نقاشی، آموزشگاه هنرهای تجسمی، آموزشگاه خیاطی، آموزشگاه صنایع دستی و غیره',
  },
  {
    title: 'مراکز تحصیلی',
    description:
      'مهد کودک، هنرستان، مجتمع آموزشی آمادگی و پیش‌دبستانی، دبستان، دبیرستان و غیره',
  },
  {
    title: 'پوشاک',
    description: 'مزون، تولیدی، فروشگاه پوشاک و کفش، پخش پوشاک، خیاطی و غیره',
  },
  {title: 'جواهرآلات و بدلیجات', description: 'طلافروشی و بدلیجاتی و غیره'},
  {
    title: 'کامپیوتر و موبایل',
    description:
      'نمایندگی کامپیوتر، خدمات کامپیوتر، موبایل و تبلت، خدمات موبایل و غیره',
  },
  {
    title: 'خدمات مجلس',
    description:
      'استودیو عکاسی و فیلم‌برداری، آتلیه، تالار و رستوران، تهیه غذا، هتل، فست‌فود، کافی‌شاپ، کبابی، ظروف کرایه و غیره',
  },
  {
    title: 'چاپ و تبلیغات',
    description:
      'چاپخانه، کانون تبلیغاتی، انتشاراتی، نشریه، مهر و پلاک، تابلوسازی، ماهنامه و غیره',
  },
  {
    title: 'خدمات اجتماعی',
    description:
      'بیمه، دفتر وکالت، کافی‌نت، تاکسی‌سرویس، موسسه حسابداری، دفتر اسناد رسمی، موسسه کاریابی و مشاور شغلی، دفتر ازدواج، دفتر خدمات حقوقی و غیره',
  },
  {
    title: 'کشاورزی دامپروری',
    description:
      'پخش سموم کشاورزی، پمپ و دینام، تولید گل و گیاه و نهال، خدمات آبیاری و کشاورزی، نمایشگاه گل و گیاه، کلینیک و درمانگاه دامپزشکی، گاوداری، خدمات پرورش و نگهداری طیور، خدمات تلقیح مصنوعی، خوراک دام، صنایع غذایی طیور و غیره',
  },
  {
    title: 'ساختمان',
    description:
      'پخش رنگ و ابزار، مشاور املاک، خدمات نظافتی، خدمات فنی و مهندسی، سیستم تهویه و تصفیه آب، تیرچه‌سازی، تولیدکننده درب و پنجره و پوشش‌های دیواری، آسانسور، بتن‌ریزی، کارخانه و پخش‌کننده آجر، ایزوگام و آسفالت، سنگ‌نما، کابینت، تاسیسات ساختمان، آهن‌آلات و غیره',
  },
  {
    title: 'دکوراسیون داخلی',
    description:
      'فروشگاه پرده، تولید و پخش مبلمان، تولید و پخش صنایع چوبی، نقاشی ساختمان، کاغذ دیواری و غیره',
  },
  {
    title: 'صنایع غذایی',
    description:
      'خواروبار فروشی، شیرینی‌سرا، بستنی و آبمیوه، آجیل و خشکبار، فرآورده‌های گوشتی و پروتئینی، سوپرمارکت، نان فانتزی و غیره',
  },
  {
    title: 'صنعت',
    description:
      'تولید و فروش ماشین‌آلات صنعتی، تراشکاری و ریخته‌گری، آهنگری و آبکاری، جوشکاری و برشکاری لوله و اتصالات و شیرآلات، صنایع بسته‌بندی و کارتن‌سازی، قطعه و قالب‌سازی، پلاستیک و غیره',
  },
  {
    title: 'سایر خدمات',
    description:
      'لوازم‌التحریر، فروشگاه فرش، خشکشویی و قالیشویی، خدمات حمل و نقل، دفاتر خدمات مسافرتی و غیره',
  },
];

export const CREATE_JOB_HELPER_GUIDE_EN: JobGuideEntry[] = [
  {
    title: 'Beauty & grooming',
    description:
      'Beauty salon, barbershop, beauty-care academy, hairdressing academy, etc.',
  },
  {
    title: 'Automobiles',
    description: 'Dealership and after-sales service, spare-parts store, etc.',
  },
  {title: 'Trade & commerce', description: 'Companies and trading firms, etc.'},
  {
    title: 'Health & medical',
    description:
      'Physicians, 24-hour clinic, doctor’s office, counseling office, medical equipment, etc.',
  },
  {
    title: 'Education & research',
    description:
      'Foreign-language academy, language institute, driving school, technical/vocational school, software school, cultural, etc.',
  },
  {
    title: 'Sports academy',
    description:
      'Sports club, gym, swimming pool, chess school, riding club, martial-arts club, etc.',
  },
  {
    title: 'Arts academy',
    description:
      'Music school, cooking and confectionery school, painting school, visual-arts school, sewing school, handicrafts school, etc.',
  },
  {
    title: 'Educational centers',
    description:
      'Kindergarten, vocational high school, preschool complex, elementary school, high school, etc.',
  },
  {
    title: 'Clothing',
    description:
      'Boutique, manufacturer, clothing and shoe store, clothing distribution, tailoring, etc.',
  },
  {
    title: 'Jewelry & costume jewelry',
    description: 'Goldsmith and costume-jewelry shop, etc.',
  },
  {
    title: 'Computer & mobile',
    description:
      'Computer dealership, computer services, mobile and tablet, mobile services, etc.',
  },
  {
    title: 'Event services',
    description:
      'Photography and videography studio, atelier, hall and restaurant, catering, hotel, fast food, coffee shop, kebab house, tableware rental, etc.',
  },
  {
    title: 'Printing & advertising',
    description:
      'Print house, advertising agency, publisher, periodical, stamps and plates, sign making, monthly magazine, etc.',
  },
  {
    title: 'Social services',
    description:
      'Insurance, law office, internet café, taxi service, accounting firm, notary office, job-placement and career-counseling agency, marriage office, legal-services office, etc.',
  },
  {
    title: 'Agriculture & animal husbandry',
    description:
      'Agricultural-pesticide distribution, pumps and dynamos, flower/plant/seedling production, irrigation and farming services, flower and plant exhibition, veterinary clinic, cattle farm, poultry raising and keeping services, artificial-insemination services, animal feed, poultry food industry, etc.',
  },
  {
    title: 'Construction',
    description:
      'Paint and tool distribution, real-estate agency, cleaning services, technical and engineering services, ventilation and water-treatment systems, joist making, door/window and wall-covering manufacturer, elevators, concrete pouring, brick factory and distributor, isogam and asphalt, stone facade, cabinets, building installations, ironwork, etc.',
  },
  {
    title: 'Interior decoration',
    description:
      'Curtain store, furniture production and distribution, wooden-goods production and distribution, house painting, wallpaper, etc.',
  },
  {
    title: 'Food industry',
    description:
      'Grocery store, confectionery, ice cream and juice, nuts and dried fruit, meat and protein products, supermarket, fancy bread, etc.',
  },
  {
    title: 'Industry',
    description:
      'Manufacture and sale of industrial machinery, machining and casting, forging and plating, welding and cutting of pipes, fittings and valves, packaging and carton-making industries, part and mold making, plastics, etc.',
  },
  {
    title: 'Other services',
    description:
      'Stationery, carpet store, dry cleaning and carpet washing, transport services, travel-service offices, etc.',
  },
];

// Source: JobCategoryGuideScreen (Figma 106:3561) — near-identical to the
// above with a few different category-name variants and spacing.
export const JOB_CATEGORY_GUIDE_FA: JobGuideEntry[] = [
  {
    title: 'آرایش و پیرایش',
    description:
      'سالن آرایش، آرایشگاه، آموزشگاه مراقبت و زیبایی، آموزشگاه آرایش و پیرایش و غیره',
  },
  {
    title: 'اتومبیل',
    description: 'نمایندگی و خدمات پس از فروش، فروشگاه لوازم یدکی و غیره',
  },
  {title: 'بازرگانی و تجارت', description: 'شرکت ها و بازرگانی ها و غیره'},
  {
    title: 'بهداشت و درمان',
    description:
      'پزشکان، درمانگاه شبانه روزی، مطب، دفتر مشاوره، تجهیزات پزشکی و غیره',
  },
  {
    title: 'آموزش و پژوهش',
    description:
      'آکادمی زبان های خارجی، موسسه زبان، آموزشگاه راهنمایی و رانندگی، آموزشگاه فنی و حرفه ای، آموزشگاه نرم افزار، فرهنگی و غیره',
  },
  {
    title: 'آموزشگاه ورزشی',
    description:
      'باشگاه ورزشی، باشگاه بدنسازی، استخر، مدرسه شطرنج، باشگاه سوارکاری، باشگاه رزمی و غیره',
  },
  {
    title: 'آموزشگاه هنری',
    description:
      'آموزشگاه موسیقی، آموزشگاه آشپزی و شیرینی پزی، آموزشگاه نقاشی، آموزشگاه هنرهای تجسمی، آموزشگاه خیاطی، آموزشگاه صنایع دستی و غیره',
  },
  {
    title: 'مراکز تحصیلی',
    description:
      'مهد کودک، هنرستان، مجتمع آموزشی آمادگی و پیش دبستانی، دبستان، دبیرستان و غیره',
  },
  {
    title: 'پوشاک',
    description: 'مزون، تولیدی، فروشگاه پوشاک و کفش، پخش پوشاک، خیاطی و غیره',
  },
  {title: 'جواهرآلات و بدلیجات', description: 'طلا فروشی و بدلیجاتی و غیره'},
  {
    title: 'کامپیوتر و موبایل',
    description:
      'نمایندگی کامپیوتر، خدمات کامپیوتر، موبایل و تبلت، خدمات موبایل و غیره',
  },
  {
    title: 'تالار و خدمات مجالس',
    description:
      'استودیو عکاسی و فیلم برداری، آتلیه، تالار و رستوران، تهیه غذا، هتل، فست فود، کافی شاپ، کبابی، ظروف کرایه و غیره',
  },
  {
    title: 'چاپ و نشر و تبلیغات',
    description:
      'چاپخانه، کانون تبلیغاتی، انتشاراتی، نشریه، مهر و پلاک، تابلو سازی، ماهنامه و غیره',
  },
  {
    title: 'خدمات اجتماعی',
    description:
      'بیمه، دفتر وکالت، کافی نت، تاکسی سرویس، موسسه حسابداری، دفتر اسناد رسمی، موسسه کاریابی و مشاور شغلی، دفتر ازدواج، دفتر خدمات حقوقی و غیره',
  },
  {
    title: 'کشاورزی و دامپروری',
    description:
      'پخش سموم کشاورزی، پمپ و دینام، تولید گل و گیاه و نهال، خدمات آبیاری و کشاورزی، نمایشگاه گل و گیاه، کلینیک و درمانگاه، دامپزشکی، گاوداری، خدمات پرورش و نگهداری طیور، خدمات تلقیح مصنوعی، خوراک دام، صنایع غذایی طیور و غیره',
  },
  {
    title: 'ساختمان',
    description:
      'پخش رنگ و ابزار، مشاور املاک، خدمات نظافتی، خدمات فنی و مهندسی، سیستم تهویه و تصفیه آب، تیرچه سازی، تولید کننده درب و پنجره و پوشش های دیواری، آسانسور، بتن ریزی، کارخانه و پخش کننده آجر، ایزوگام و آسفالت، سنگ نما، کابینت، تاسیسات ساختمان، آهن آلات و غیره',
  },
  {
    title: 'دکوراسیون داخلی',
    description:
      'فروشگاه پرده، تولید و پخش مبلمان، تولید و پخش صنایع چوبی، نقاشی ساختمان، کاغذ دیواری و غیره',
  },
  {
    title: 'صنایع غذایی',
    description:
      'خواروبار فروشی، شیرینی سرا، بستنی و آبمیوه، آجیل و خشکبار، فرآورده های گوشتی و پروتئینی، سوپرمارکت، نان فانتزی و غیره',
  },
  {
    title: 'صنعت',
    description:
      'تولید و فروش ماشین آلات صنعتی، تراشکاری و ریخته گری، آهنگری و آبکاری، جوشکاری و برشکاری لوله و اتصالات و شیرآلات، صنایع بسته بندی و کارتن سازی، قطعه و قالب سازی، پلاستیک و غیره',
  },
  {
    title: 'سایر خدمات',
    description:
      'لوازم التحریر، فروشگاه فرش، خشکشویی و قالیشویی، خدمات حمل و نقل، دفاتر خدمات مسافرتی و غیره',
  },
];

export const JOB_CATEGORY_GUIDE_EN: JobGuideEntry[] = [
  ...CREATE_JOB_HELPER_GUIDE_EN.slice(0, 11),
  {
    title: 'Hall & event services',
    description:
      'Photography and videography studio, atelier, hall and restaurant, catering, hotel, fast food, coffee shop, kebab house, tableware rental, etc.',
  },
  {
    title: 'Printing, publishing & advertising',
    description:
      'Print house, advertising agency, publisher, periodical, stamps and plates, sign making, monthly magazine, etc.',
  },
  ...CREATE_JOB_HELPER_GUIDE_EN.slice(13, 14), // Social services
  {
    title: 'Agriculture & animal husbandry',
    description:
      'Agricultural-pesticide distribution, pumps and dynamos, flower/plant/seedling production, irrigation and farming services, flower and plant exhibition, clinic, veterinary, cattle farm, poultry raising and keeping services, artificial-insemination services, animal feed, poultry food industry, etc.',
  },
  ...CREATE_JOB_HELPER_GUIDE_EN.slice(15),
];
