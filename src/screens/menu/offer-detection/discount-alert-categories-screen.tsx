import {FlatList, StyleSheet, Switch, View} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useQuery, useMutation, useQueryClient} from 'react-query';
import {
  DiscountMenuSheet,
  Divider,
  ListState,
  MainHeader,
  Screen,
  Text,
} from '../../../components';
import {
  DiscountAlerts,
  getDiscountAlerts,
  setDiscountAlerts,
} from '../../../services';
import {colors} from '../../../theme';
import {useAdsCategories} from '../../../hooks/use-cached-categories';
import {localizeCategory} from '../../../i18n/display-maps';

// "اطلاع از تخفیف‌های نزدیک من" (screenshot 5): a toggle list of تخفیف‌یاب
// subcategories. Turning one on subscribes the user to nearby-discount push
// alerts for that category; the full set is saved on every change.
export function DiscountAlertCategoriesScreen() {
  const {t} = useTranslation();
  const [menu, setMenu] = useState(false);
  const queryClient = useQueryClient();

  const {data: cats} = useAdsCategories();
  const subCategories = useMemo(
    () =>
      cats?.data?.find((c: any) => c.title === 'تخفیف یاب')?.sub_categories ??
      [],
    [cats],
  );

  const {
    data: alerts,
    isLoading,
    isError,
  } = useQuery(['discountAlerts'], getDiscountAlerts);
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => {
    if (alerts) {
      setSelected(alerts.categoryIds);
    }
  }, [alerts]);

  const {mutate} = useMutation<DiscountAlerts, unknown, string[]>(
    setDiscountAlerts,
    {onSuccess: data => queryClient.setQueryData(['discountAlerts'], data)},
  );

  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter(x => x !== id)
      : [...selected, id];
    setSelected(next);
    mutate(next);
  };

  const allOn =
    subCategories.length > 0 && selected.length === subCategories.length;
  const toggleAll = () => {
    const next = allOn ? [] : subCategories.map((c: any) => c.id);
    setSelected(next);
    mutate(next);
  };

  return (
    <Screen withoutScroll>
      <MainHeader
        title={t('home.discountFinder')}
        showLocation
        showBack
        onMenuPress={() => setMenu(true)}
      />
      <Text style={styles.hint}>{t('offers.alertsHint')}</Text>
      <FlatList
        data={subCategories}
        style={{paddingHorizontal: 16}}
        keyExtractor={(item: any) => item.id}
        ItemSeparatorComponent={() => (
          <Divider style={styles.separator} height={1} />
        )}
        ListHeaderComponent={
          subCategories.length > 0 ? (
            <>
              <View style={styles.row}>
                <Text size={16} preset="bold">
                  {t('offers.allDiscounts')}
                </Text>
                <Switch
                  value={allOn}
                  onValueChange={toggleAll}
                  trackColor={{
                    false: colors.pallete.gray3,
                    true: colors.pallete.green1,
                  }}
                  thumbColor={allOn ? colors.pallete.green : '#f4f3f4'}
                />
              </View>
              <Divider style={styles.separator} height={1} />
            </>
          ) : null
        }
        renderItem={({item}: {item: any}) => (
          <View style={styles.row}>
            <Text size={16}>{localizeCategory(item.title)}</Text>
            <Switch
              value={selected.includes(item.id)}
              onValueChange={() => toggle(item.id)}
              trackColor={{
                false: colors.pallete.gray3,
                true: colors.pallete.green1,
              }}
              thumbColor={
                selected.includes(item.id) ? colors.pallete.green : '#f4f3f4'
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <ListState
            isLoading={isLoading}
            isError={isError}
            emptyMessage={t('offers.noCategoriesDefined')}
          />
        }
      />
      <DiscountMenuSheet visible={menu} onClose={() => setMenu(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: {
    padding: 16,
    color: colors.pallete.grayText,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  separator: {
    backgroundColor: colors.pallete.gray1,
  },
});
