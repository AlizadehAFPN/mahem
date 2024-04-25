import { View, StyleSheet, Text as RNText } from 'react-native'
import React from 'react'
import { Divider, GradiantHeader, MainHeader, Screen, Text } from '../../../components'
import { colors } from '../../../theme'

export function CreateJobHelperScreen() {
  return (
    <Screen withoutScroll>
      <MainHeader />
      <View style={styles.nav}>
        <GradiantHeader
          details={false}
          colors={["rgba(0,0,0,.1)", "rgba(0,0,0,.7)"]}
        />
      </View>
      <Screen style={{ paddingHorizontal: 16 }}>
        <Divider height={50} />
        <Text size={20} color={colors.pallete.red2} style={{ textAlign: 'center' }}>لطفا قبل ثبت صنف خود توضیحات زیر را مطالعه کرده تا در دسته بندی درست درج شود.</Text>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>آرایش و پیرایش: </Text>
          <Text size={15}>سالن آراش،آرایشگاه، آموزشگاه مراقبت و زیبایی، اموزشگاهآرایش و پیرایش و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>اتومبیل: </Text>
          <Text size={15}>نمایندگی و خدمات پس از فروش، لوازم یدکی و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>بازرگانی و تجارت: </Text>
          <Text size={15}>شرکت ها و بازرگانی ها و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>بهداشت و درمان: </Text>
          <Text size={15}>پزشکان، درمانگاه شبانه روزی، مطب، دفتر مشاوره، تجهیزات پزشکی و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>آموزش و پژوهش: </Text>
          <Text style={{ textAlign: "justify" }} size={15}>آکادمی زبان های خارجی ، موسسه زبان، آموزشگاه رهنمایی و رانندگی، آموزشگاه فنی و حرفه ای، آموزشگاه نرم افزار، فرهنگی و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>آموزشگاه ورزشی: </Text>
          <Text size={15}>باشگاه ورزشی، باشگاه بدنسازی، استخر، مدرسه شطرنج، باشگاه سوارکاری، باشگاه رذمی و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>آموزشگاه هنری: </Text>
          <Text size={15}>آموزشگاه موسیقی، آموزشگاه آشپزی و شیرینی پزی، آموزشگاه نقاشی، آموزشگاه هنرهای تجسمی، آموزشگاه خیاطی، آموزشگاه صنایع دستی و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>مراکز تحصیلی: </Text>
          <Text size={15}>مهد کودک، هنرستان، مجتمع آموزشی آمادگی و پیش دبستانی، دبستان، دبیرستان و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>پوشاک: </Text>
          <Text size={15}>مزون، تولیدی، فروشگاه پوشاک و کفش، پخش پوشاک خیاطی و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>جواهرات و بدلیجات: </Text>
          <Text size={15}>طلا فروشی و بدلیجاتی و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>کامپیوتر و موبایل: </Text>
          <Text size={15}>نمایندگی کامپیوتر، خدمات کامپیوتر، موبایل و تبلت، خدمات موبایل و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>تالار و خدمات مجلس</Text>
          <Text size={15}>استودیو عکاسی و فیلم برداری، آتلیه، تالار و رستوران، تهیه غزا، هتل، فست بود، کافی شاپ، کباب، ظروف کرایه و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>چاپ و نشر تبلیغات: </Text>
          <Text size={15}>چاپخانه، کانون تبلیغاتی، انتشاراتی، نشریه مهر و پلاک، تابلو سازی، ماهنامه و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>خدمات اجتماعی: </Text>
          <Text size={15}>بیمه، دفتر وکالت، کافی نت، تاکسی سرویس، موسسه حسابداری، دفتر اسناد رسمی، موسسه کاریابی و مشاور شغلی، دفتر ازدواج، دفتر خدمات حقوقی و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>کشاورزی و دامپروری: </Text>
          <Text size={15}>پخش سموم کشاورزی، پمپ و دینام، تولید گل و گیاه و نهال، خدمات آبیاری و کشاورزی، نمایشگاه گل و گیاه، کلینیک و درمانگاه دامپزشکی ، گاوداری، خدمات پرورش و نگهداری طیور، خدمات تلقیح مصنوعی، خوراک دام، صنایع غذایی طیور و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>ساختمان: </Text>
          <Text size={15}>پخش رنگ و ابزار، مشاور املاک، خدمات نظافتی، خدمات فنی و مهندسیو، سیستم تهویه و تصفیه آب، تیرجه سازی، تولید کننده درب و پنجره و پوشش های دیواری، آسانسور، بتن ریزی، کارخانه و پخش کننده آجر، ایزوگام و آسفالت، سنگ نما، کابینت، تاسیسات ساختمان، آهن آلات و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>دکوراسیون داخلی: </Text>
          <Text size={15}>فروشگاه پرده، تولید و پخش مبلمان، تولید و پخش صنایع چوبی، نقاشی ساختمان، کاغذ دیواری و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>صنایع غذایی: </Text>
          <Text size={15}>خواروبار فروشی، شیرینی سرا، بستنی و آبمیوه، آجیل و خشکبار، فراورده های گوشتی و پروتینی، سوپرمارکت، نان فانتزی و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>صنعت: </Text>
          <Text size={15}>تولید و فروش ماشین آلات صنعتی، تراشکاری و ریخته گری، آهنگری و آبکاری، جوشکاری و برشکاری لوله و اتصالات و شیر الات، صنایع بسته بندی و کارتن سازی، قطعه و قاب سازی، پلاستیک و غیره</Text>
        </RNText>
        <Divider />
        <RNText>
          <Text size={15} color={colors.pallete.red2}>سایر خدمات: </Text>
          <Text size={15}>لوازم التحریر، فروشگاه فرش، خشکشویی و قالیشویی، خدمات حمل و نقل، دفاتر خدمات مسافرتی و غیره</Text>
        </RNText>
        <Divider height={100} />
      </Screen>

    </Screen>
  )
}
const styles = StyleSheet.create({
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    top: 47
  },
})