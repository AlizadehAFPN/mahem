// The backend never sets Category.icon for JOB-type categories (the seed
// script only sets name/slug/type — see mahem-backend's prisma/seed.ts), so
// getJobsCategories()'s `logo` field is always null. The old app instead
// used these 20 bundled icons, one per business category exactly as seeded
// (businessCategoryNames) — mapped by title since there's nothing else
// stable to key off of.
export const JOB_CATEGORY_ICONS: Record<string, any> = {
  'بهداشت و درمان': require('../assets/images/icons/health.png'),
  'بازرگانی و تجارت': require('../assets/images/icons/bazargani.png'),
  اتومبیل: require('../assets/images/icons/auto.png'),
  'آرایش و پیرایش': require('../assets/images/icons/beauti.png'),
  'مراکز تحصیلی': require('../assets/images/icons/education.png'),
  'آموزشگاه هنری': require('../assets/images/icons/artlearning.png'),
  'آموزشگاه ورزشی': require('../assets/images/icons/sportlearning.png'),
  'آموزش و پژوهش': require('../assets/images/icons/learning.png'),
  'خدمات مجلس': require('../assets/images/icons/majlesi.png'),
  'کامپیوتر و موبایل': require('../assets/images/icons/it.png'),
  'جواهرات و بدلیجات': require('../assets/images/icons/javaherat.png'),
  پوشاک: require('../assets/images/icons/clouth.png'),
  ساختمان: require('../assets/images/icons/building.png'),
  'کشاورزی دامپروری': require('../assets/images/icons/agriculture.png'),
  'خدمات اجتماعی': require('../assets/images/icons/social.png'),
  'چاپ و تبلیغات': require('../assets/images/icons/advertisment.png'),
  'سایر خدمات': require('../assets/images/icons/other.png'),
  صنعت: require('../assets/images/icons/sanat.png'),
  'صنایع غذایی': require('../assets/images/icons/foods.png'),
  'دکوراسیون داخلی': require('../assets/images/icons/decor.png'),
};

export function getJobCategoryIcon(title?: string) {
  return (title && JOB_CATEGORY_ICONS[title]) || undefined;
}
