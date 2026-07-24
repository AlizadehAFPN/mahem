import {ScrollView, StyleSheet} from 'react-native';
import React from 'react';
import {Divider, MainHeader, Screen, Text} from '../../../components';
import {colors} from '../../../theme';

// "بانک مشاغل –راهنمایی" (Figma 106:3561) — helps a business owner pick the
// right صنف before registering (CreateJobScreen). Static content, exactly
// as authored in the design; category names here are the design's own
// wording and may differ slightly from the backend's seeded JOB category
// labels (e.g. "تالار و خدمات مجالس" vs. the seeded "خدمات مجلس") — this is
// just guidance text, not tied to the actual selectable list.
interface CategoryGuideItem {
  title: string;
  examples: string;
}

const CATEGORY_GUIDE: CategoryGuideItem[] = [
  {
    title: 'آرایش و پیرایش',
    examples: 'سالن آرایش، آرایشگاه، آموزشگاه مراقبت و زیبایی، آموزشگاه آرایش و پیرایش و غیره',
  },
  {
    title: 'اتومبیل',
    examples: 'نمایندگی و خدمات پس از فروش، فروشگاه لوازم یدکی و غیره',
  },
  {
    title: 'بازرگانی و تجارت',
    examples: 'شرکت ها و بازرگانی ها و غیره',
  },
  {
    title: 'بهداشت و درمان',
    examples: 'پزشکان، درمانگاه شبانه روزی، مطب، دفتر مشاوره، تجهیزات پزشکی و غیره',
  },
  {
    title: 'آموزش و پژوهش',
    examples:
      'آکادمی زبان های خارجی، موسسه زبان، آموزشگاه راهنمایی و رانندگی، آموزشگاه فنی و حرفه ای، آموزشگاه نرم افزار، فرهنگی و غیره',
  },
  {
    title: 'آموزشگاه ورزشی',
    examples:
      'باشگاه ورزشی، باشگاه بدنسازی، استخر، مدرسه شطرنج، باشگاه سوارکاری، باشگاه رزمی و غیره',
  },
  {
    title: 'آموزشگاه هنری',
    examples:
      'آموزشگاه موسیقی، آموزشگاه آشپزی و شیرینی پزی، آموزشگاه نقاشی، آموزشگاه هنرهای تجسمی، آموزشگاه خیاطی، آموزشگاه صنایع دستی و غیره',
  },
  {
    title: 'مراکز تحصیلی',
    examples: 'مهد کودک، هنرستان، مجتمع آموزشی آمادگی و پیش دبستانی، دبستان، دبیرستان و غیره',
  },
  {
    title: 'پوشاک',
    examples: 'مزون، تولیدی، فروشگاه پوشاک و کفش، پخش پوشاک، خیاطی و غیره',
  },
  {
    title: 'جواهرآلات و بدلیجات',
    examples: 'طلا فروشی و بدلیجاتی و غیره',
  },
  {
    title: 'کامپیوتر و موبایل',
    examples: 'نمایندگی کامپیوتر، خدمات کامپیوتر، موبایل و تبلت، خدمات موبایل و غیره',
  },
  {
    title: 'تالار و خدمات مجالس',
    examples:
      'استودیو عکاسی و فیلم برداری، آتلیه، تالار و رستوران، تهیه غذا، هتل، فست فود، کافی شاپ، کبابی، ظروف کرایه و غیره',
  },
  {
    title: 'چاپ و نشر و تبلیغات',
    examples: 'چاپخانه، کانون تبلیغاتی، انتشاراتی، نشریه، مهر و پلاک، تابلو سازی، ماهنامه و غیره',
  },
  {
    title: 'خدمات اجتماعی',
    examples:
      'بیمه، دفتر وکالت، کافی نت، تاکسی سرویس، موسسه حسابداری، دفتر اسناد رسمی، موسسه کاریابی و مشاور شغلی، دفتر ازدواج، دفتر خدمات حقوقی و غیره',
  },
  {
    title: 'کشاورزی و دامپروری',
    examples:
      'پخش سموم کشاورزی، پمپ و دینام، تولید گل و گیاه و نهال، خدمات آبیاری و کشاورزی، نمایشگاه گل و گیاه، کلینیک و درمانگاه، دامپزشکی، گاوداری، خدمات پرورش و نگهداری طیور، خدمات تلقیح مصنوعی، خوراک دام، صنایع غذایی طیور و غیره',
  },
  {
    title: 'ساختمان',
    examples:
      'پخش رنگ و ابزار، مشاور املاک، خدمات نظافتی، خدمات فنی و مهندسی، سیستم تهویه و تصفیه آب، تیرچه سازی، تولید کننده درب و پنجره و پوشش های دیواری، آسانسور، بتن ریزی، کارخانه و پخش کننده آجر، ایزوگام و آسفالت، سنگ نما، کابینت، تاسیسات ساختمان، آهن آلات و غیره',
  },
  {
    title: 'دکوراسیون داخلی',
    examples: 'فروشگاه پرده، تولید و پخش مبلمان، تولید و پخش صنایع چوبی، نقاشی ساختمان، کاغذ دیواری و غیره',
  },
  {
    title: 'صنایع غذایی',
    examples:
      'خواروبار فروشی، شیرینی سرا، بستنی و آبمیوه، آجیل و خشکبار، فرآورده های گوشتی و پروتئینی، سوپرمارکت، نان فانتزی و غیره',
  },
  {
    title: 'صنعت',
    examples:
      'تولید و فروش ماشین آلات صنعتی، تراشکاری و ریخته گری، آهنگری و آبکاری، جوشکاری و برشکاری لوله و اتصالات و شیرآلات، صنایع بسته بندی و کارتن سازی، قطعه و قالب سازی، پلاستیک و غیره',
  },
  {
    title: 'سایر خدمات',
    examples: 'لوازم التحریر، فروشگاه فرش، خشکشویی و قالیشویی، خدمات حمل و نقل، دفاتر خدمات مسافرتی و غیره',
  },
];

export function JobCategoryGuideScreen() {
  return (
    <Screen withoutScroll>
      <MainHeader title="راهنمای انتخاب صنف" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text size={15} style={styles.intro}>
          لطفا قبل ثبت صنف خود، توضیحات زیر را مطالعه کرده تا در دسته بندی درست درج شود
        </Text>
        {CATEGORY_GUIDE.map((category, index) => (
          <React.Fragment key={category.title}>
            <Divider height={16} />
            <Text preset="bold" size={15} color={colors.main}>
              {index + 1}. {category.title}
            </Text>
            <Text size={14} style={styles.examples}>
              {category.examples}
            </Text>
          </React.Fragment>
        ))}
        <Divider height={40} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  intro: {
    textAlign: 'right',
    lineHeight: 26,
  },
  examples: {
    textAlign: 'right',
    lineHeight: 24,
    marginTop: 4,
    color: colors.pallete.grayText,
  },
});
