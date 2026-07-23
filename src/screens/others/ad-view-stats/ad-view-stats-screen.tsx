import {ScrollView, StyleSheet, View} from 'react-native';
import React, {useMemo} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useQuery} from 'react-query';
import {MainHeader, Row, Screen, Text} from '../../../components';
import {colors} from '../../../theme';
import {useRoute} from '@react-navigation/native';
import {getAdViewStats} from '../../../services';

// "تراز بازدید" / "پیش نمایش آگهی من" (Figma 106:2389) — owner-only view
// analytics: lifetime total, a 22-day bar chart, and a viewer gender split.
// A plain-View bar chart (no charting library in the project — see
// package.json) is enough for 22 equal-width bars.
export function AdViewStatsScreen() {
  const {params} = useRoute<any>();
  const advertisementId = params?.advertisementId;

  const {data, isLoading} = useQuery(
    ['adViewStats', advertisementId],
    () => getAdViewStats(advertisementId),
    {enabled: !!advertisementId},
  );
  const stats = data?.data;

  const maxDaily = useMemo(() => {
    const max = Math.max(1, ...(stats?.daily ?? []).map(d => d.count));
    // Round up to the next multiple of 10 so the axis reads like Figma's
    // (10/20/30/...) instead of an arbitrary max.
    return Math.ceil(max / 10) * 10;
  }, [stats]);

  const genderTotal = (stats?.genderBreakdown.male ?? 0) + (stats?.genderBreakdown.female ?? 0);
  const femalePercent =
    genderTotal > 0 ? Math.round(((stats?.genderBreakdown.female ?? 0) / genderTotal) * 100) : 0;
  const malePercent = genderTotal > 0 ? 100 - femalePercent : 0;

  return (
    <Screen withoutScroll>
      <MainHeader title="پیش نمایش آگهی من" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text preset="bold" size={18} style={styles.total}>
          مجموع آمار بازدید: {stats?.total ?? 0} نفر
        </Text>

        {isLoading ? (
          <Text style={{textAlign: 'center', marginTop: 40}}>در حال بارگذاری...</Text>
        ) : (
          <>
            <View style={styles.chartCard}>
              <View style={styles.chartArea}>
                <View style={styles.yAxis}>
                  {[...Array(6)].map((_, i) => (
                    <Text key={i} size={10} color={colors.pallete.grayText}>
                      {maxDaily - i * (maxDaily / 5)}
                    </Text>
                  ))}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Row style={styles.bars}>
                    {(stats?.daily ?? []).map((day, index) => (
                      <View key={day.date} style={styles.barColumn}>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.bar,
                              {height: `${Math.min(100, (day.count / maxDaily) * 100)}%`},
                            ]}
                          />
                        </View>
                        <Text size={9} color={colors.pallete.grayText}>
                          {index + 1}
                        </Text>
                      </View>
                    ))}
                  </Row>
                </ScrollView>
              </View>
              <Text size={12} color={colors.pallete.grayText} style={styles.xAxisLabel}>
                روز
              </Text>
              <Text size={12} color={colors.pallete.grayText} style={styles.yAxisLabel}>
                نفر
              </Text>
            </View>

            <Row style={styles.genderRow}>
              <Row style={styles.genderItem}>
                <Ionicons name="female" size={22} color={colors.pallete.red2} />
                <Text size={16} style={{marginHorizontal: 6}}>
                  {femalePercent}% خانم
                </Text>
              </Row>
              <Row style={styles.genderItem}>
                <Ionicons name="male" size={22} color={colors.pallete.blue} />
                <Text size={16} style={{marginHorizontal: 6}}>
                  {malePercent}% مرد
                </Text>
              </Row>
            </Row>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  total: {
    textAlign: 'center',
    marginBottom: 24,
  },
  chartCard: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  chartArea: {
    flexDirection: 'row-reverse',
    height: 160,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingLeft: 6,
    width: 28,
  },
  bars: {
    alignItems: 'flex-end',
    height: 160,
    paddingHorizontal: 4,
  },
  barColumn: {
    width: 14,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barTrack: {
    width: 8,
    height: 140,
    justifyContent: 'flex-end',
    backgroundColor: colors.pallete.gray1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    backgroundColor: colors.main,
  },
  xAxisLabel: {
    textAlign: 'center',
    marginTop: 4,
  },
  yAxisLabel: {
    position: 'absolute',
    top: -4,
    left: 0,
  },
  genderRow: {
    justifyContent: 'space-around',
    marginTop: 24,
  },
  genderItem: {
    alignItems: 'center',
  },
});
