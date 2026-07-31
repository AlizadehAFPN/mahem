import {Text as RNText} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Divider, MainHeader, Screen, Text} from '../../../components';
import {colors, scaled} from '../../../theme';
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
      <MainHeader showLocation showBack title={t('home.jobsBank')} />
      <Screen style={{paddingHorizontal: scaled(16)}}>
        <Divider height={40} />
        <Text
          size={17}
          color={colors.pallete.red2}
          style={{textAlign: 'center', lineHeight: scaled(26)}}>
          {t('jobs.guideIntro')}
        </Text>
        <Divider height={16} />
        {categoryGuides.map(item => (
          <RNText key={item.title} style={{marginBottom: scaled(10)}}>
            <Text size={15} color={colors.pallete.red2}>
              {item.title}:{' '}
            </Text>
            <Text size={15} style={{lineHeight: scaled(22)}}>
              {item.description}
            </Text>
          </RNText>
        ))}
        <Divider height={100} />
      </Screen>
    </Screen>
  );
}
