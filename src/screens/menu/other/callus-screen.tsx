import {
  Image,
  StyleSheet,
  View,
  Text as RNText,
  Dimensions,
  Linking,
} from 'react-native';
import React from 'react';
import {Divider, MainHeader, Screen, Text, Row} from '../../../components';
import {colors} from '../../../theme';
const {width} = Dimensions.get('window');
export function CallUsScreen() {
  return (
    <Screen withoutScroll>
      <MainHeader title="درباره ما" />
      <View
        style={{
          width: '100%',
          paddingVertical: 20,
          backgroundColor: colors.pallete.gray1,
        }}>
        <Image
          style={{width: '100%'}}
          source={require('../../../assets/images/hlogo.png')}
        />
      </View>
      <Screen unsafe style={{paddingHorizontal: 15}}>
        <Text size={17}>
          جهت پیشنـهاد یا انتقاد و یا از وجـود مشکلی در اپلیکیشن ماهـم می توانید
          به روش های زیـر ما را یاری نمـایید.
        </Text>
        <Divider />
        <Row style={{justifyContent: 'space-between'}}>
          <Text size={17}>ایدی تلگرام</Text>
          <Text
            size={17}
            onPress={() => Linking.openURL('http://t.me/Mahem_App')}>
            Mahem_App
          </Text>
        </Row>
        <Row style={{justifyContent: 'space-between'}}>
          <Text size={17}>آدرس ایمیل</Text>
          <Text
            size={17}
            onPress={() =>
              Linking.openURL(
                'mailto:Mahem_App@gmail.com?subject=SendMail&body=',
              )
            }>
            Mahem_App@gmail.com
          </Text>
        </Row>
        <Row style={{justifyContent: 'space-between'}}>
          <Text size={17}>ایدی اینستاگرام</Text>
          <Text
            size={17}
            onPress={() =>
              Linking.openURL('instagram://user?username=Mahem_App').catch(
                () => {
                  Linking.openURL('https://www.instagram.com/Mahem.App');
                },
              )
            }>
            Mahem_App
          </Text>
        </Row>
        <Divider />
        <Text size={17}>
          تیم مدیریت و پشتیبانی ماهم در حال حاضر در تهران اقامت دارند و اقـدامات
          لازمه جهت انتقال دفتر به شـهر گنبد کاووس در دست اقـدام بوده و آدرس
          دقیق دفتر در گنبد کاووس اعلام خواهـد شد.
        </Text>
        <Text size={17}>
          {' '}
          در صورت ایجاد مزاحمت بـرای شما، می توانید با مراجعه به سایت پلیس فـتا
          به آدرس www.cyberpolis.ir از اطلاعـات تماس پلیس فتای محل سکونت خود
          آگاه شوید و موضـوع را از آن طریق پیگیری کنید.
        </Text>
        <Divider />
        <Row style={{justifyContent: 'space-between'}}>
          <Text size={17}>پلیس فتا گنبد کاووس</Text>
          <Text size={17}>017-21833453</Text>
        </Row>
        <Row style={{justifyContent: 'space-between'}}>
          <Text size={17}>پلیس فتا گرگان</Text>
          <Text size={17}>017-21822972</Text>
        </Row>
        <Divider height={50} />
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({});
