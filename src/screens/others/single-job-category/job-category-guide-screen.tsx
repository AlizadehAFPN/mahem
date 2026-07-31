import {ScrollView, StyleSheet} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Divider, MainHeader, Screen, Text} from '../../../components';
import {colors, scaled} from '../../../theme';
import {
  JOB_CATEGORY_GUIDE_EN,
  JOB_CATEGORY_GUIDE_FA,
} from '../../../i18n/job-guide-content';

// "بانک مشاغل –راهنمایی" (Figma 106:3561) — helps a business owner pick the
// right صنف before registering (CreateJobScreen). Static content; the
// localized copy lives in i18n/job-guide-content.ts.
export function JobCategoryGuideScreen() {
  const {t, i18n} = useTranslation();
  const categoryGuide =
    i18n.language === 'en' ? JOB_CATEGORY_GUIDE_EN : JOB_CATEGORY_GUIDE_FA;
  return (
    <Screen withoutScroll>
      <MainHeader title={t('jobs.guildGuide')} showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text size={15} style={styles.intro}>
          {t('jobs.guideIntro')}
        </Text>
        {categoryGuide.map((category, index) => (
          <React.Fragment key={category.title}>
            <Divider height={16} />
            <Text preset="bold" size={15} color={colors.main}>
              {index + 1}. {category.title}
            </Text>
            <Text size={14} style={styles.examples}>
              {category.description}
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
    paddingHorizontal: scaled(16),
    paddingTop: scaled(16),
  },
  intro: {
    textAlign: 'right',
    lineHeight: scaled(26),
  },
  examples: {
    textAlign: 'right',
    lineHeight: scaled(24),
    marginTop: scaled(4),
    color: colors.pallete.grayText,
  },
});
