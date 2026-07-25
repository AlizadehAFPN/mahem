import {View, StyleSheet, Text as RNText} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {
  Divider,
  GradiantHeader,
  MainHeader,
  Screen,
  Text,
} from '../../../components';
import {colors} from '../../../theme';
import {
  CREATE_JOB_HELPER_GUIDE_EN,
  CREATE_JOB_HELPER_GUIDE_FA,
} from '../../../i18n/job-guide-content';

// Category name -> description shown before ثبت صنف, so a business owner
// picks the right صنف. Source of truth for the text is the Figma reference
// (node 106:3561); the localized copy lives in i18n/job-guide-content.ts.
export function CreateJobHelperScreen() {
  const {t, i18n} = useTranslation();
  const categoryGuides =
    i18n.language === 'en'
      ? CREATE_JOB_HELPER_GUIDE_EN
      : CREATE_JOB_HELPER_GUIDE_FA;
  return (
    <Screen withoutScroll>
      <MainHeader title={t('home.jobsBank')} showBack />
      <View style={styles.nav}>
        <GradiantHeader
          details={false}
          colors={['rgba(0,0,0,.1)', 'rgba(0,0,0,.7)']}
        />
      </View>
      <Screen style={{paddingHorizontal: 16}}>
        <Divider height={40} />
        <Text
          size={17}
          color={colors.pallete.red2}
          style={{textAlign: 'center', lineHeight: 26}}>
          {t('jobs.guideIntro')}
        </Text>
        <Divider height={16} />
        {categoryGuides.map(item => (
          <RNText key={item.title} style={{marginBottom: 10}}>
            <Text size={15} color={colors.pallete.red2}>
              {item.title}:{' '}
            </Text>
            <Text size={15} style={{lineHeight: 22}}>
              {item.description}
            </Text>
          </RNText>
        ))}
        <Divider height={100} />
      </Screen>
    </Screen>
  );
}
const styles = StyleSheet.create({
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    top: 47,
  },
});
