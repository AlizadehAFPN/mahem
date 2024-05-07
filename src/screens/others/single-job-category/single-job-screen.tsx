import {Dimensions, Image, StyleSheet, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import {
  Divider,
  GradiantHeader,
  MainHeader,
  Screen,
  Row,
  Text,
  ProductLocation,
} from '../../../components';
import {colors} from '../../../theme';
import {useRoute} from '@react-navigation/native';
const jobObj1 = [
  {title: 'مدیریت', value: 'خانم ماهم نوین فر'},
  {title: 'نوع صنف', value: 'پزشکی'},
  {title: 'شماره ثبت', value: '125425125'},
  {title: 'تلفن ثابت', value: '017-35258525'},
  {title: 'تلفن همراه', value: '09111111155'},
  {title: 'فکس', value: '017254425255'},
  {title: 'آدرس', value: 'خیابان سرابی ربروی ساختمان ماهم'},
  {title: 'تلگرام', value: 'Mahem_App'},
  {title: 'اینستاگرام', value: 'Mahem_App'},
  {title: 'ایمیل', value: 'Mahem.app@gmail.com'},
  {title: 'توضیحات', value: 'ساعت کاری ۲۴ ساعته'},
];
const {width} = Dimensions.get('window');
export function SingleJobScreen() {
  const {params} = useRoute();
  const [job, setJob] = useState(params?.job);
  const jobObj = useMemo(() => {
    if (job) {
      const {
        manager,
        register_code,
        phone,
        mobile,
        fax,
        address,
        telegram,
        instagram,
        email,
        description,
        job_category_id,
      } = job;
      return [
        {title: 'مدیریت', value: manager},
        {title: 'نوع صنف', value: job_category_id.title},
        {title: 'شماره ثبت', value: register_code},
        {title: 'تلفن ثابت', value: phone},
        {title: 'تلفن همراه', value: mobile},
        {title: 'فکس', value: fax},
        {title: 'آدرس', value: address},
        {title: 'تلگرام', value: telegram},
        {title: 'اینستاگرام', value: instagram},
        {title: 'ایمیل', value: email},
        {title: 'توضیحات', value: description},
      ];
    }
    return [];
  }, [job]);

  return (
    <Screen withoutScroll>
      <MainHeader title={job?.job_category_id?.title} />
      <View style={styles.nav}>
        <GradiantHeader />
      </View>
      <Screen unsafe>
        <View style={styles.bannerContaier}>
          <Image
            style={{width: '100%', height: '100%'}}
            source={{uri: job?.banner?.path}}
          />
        </View>
        <View style={styles.grayCard}>
          <View style={styles.circle}>
            <Image
              style={{height: '100%', width: '100%'}}
              source={{uri: job?.logo?.path}}
            />
          </View>
        </View>
        <Divider height={8} />
        {jobObj.map(item => (
          <Row style={{paddingHorizontal: 8}}>
            <View style={{...styles.detailItem, width: 70}}>
              <Text style={{...styles.itemText}}>{item.title}</Text>
            </View>
            <Divider style={{width: 10}} />
            <View style={{...styles.detailItem, flex: 1}}>
              <Text style={{...styles.itemText, textAlign: 'right'}}>
                {item.value}
              </Text>
            </View>
          </Row>
        ))}
        <ProductLocation
          lat={job?.lat}
          lng={job?.lng}
          zoomEnabled={false}
          scrollEnabled={false}
        />
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bannerContaier: {
    width: '100%',
    height: width / 1.9,
  },
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    top: 50,
  },
  grayCard: {
    height: 55,
    backgroundColor: colors.pallete.gray1,
  },
  circle: {
    height: 94,
    width: 94,
    borderRadius: 50,
    marginTop: -47,
    borderWidth: 1,
    marginLeft: 20,
    overflow: 'hidden',
  },
  detailItem: {
    height: 19,
    backgroundColor: colors.pallete.gray1,
    borderRadius: 4,
    justifyContent: 'center',
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  itemText: {
    lineHeight: 19,
  },
});
