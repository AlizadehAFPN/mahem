import {ScrollView, StyleSheet, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import {
  Row,
  Text,
  Button,
  MainHeader,
  Screen,
  Divider,
  UnderlineTextField,
  SelectAdsCategory,
  CitySelectModal,
  AdsOptionsModal,
} from '../../../components';
import {colors} from '../../../theme';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {clearFilters, setFilters} from '../../../stateManager/reducers/filters';
import {RootState} from '../../../stateManager';

// Matches the backend's AdvertisementSort enum values exactly (see
// find-advertisements.dto.ts) so `state.sort` can be dispatched straight
// through to GET /advertisements with no extra mapping step.
const SORT_OPTIONS = [
  {value: 'new', label: 'جدیدترین'},
  {value: 'old', label: 'قدیمی‌ترین'},
  {value: 'price_desc', label: 'گران‌ترین'},
  {value: 'price_asc', label: 'ارزان‌ترین'},
  {value: 'most_viewed', label: 'پربازدیدترین'},
] as const;

// Every field here is collected into local `state` and only reaches redux
// (via one setFilters dispatch) when "اعمال" is pressed — the previous
// version dispatched sort immediately and navigated back on tap, so sort
// could never be combined with category/city/price in the same visit to
// this screen even though the reducer itself merges filters fine.
export function FilterScreen() {
  const {goBack} = useNavigation();
  const dispatch = useDispatch();
  const {
    city,
    mainCategory,
    subCategory,
    subSubCategory,
    minPrice,
    maxPrice,
    onlyImages,
    sort,
  } = useSelector((s: RootState) => s.filter);

  const [state, setState] = useState({
    selectCategoryModal: false,
    mainCategory,
    subCategory,
    subSubCategory,
    city,
    cityModal: false,
    optionModal: false,
    minPrice: minPrice !== undefined ? String(minPrice) : '',
    maxPrice: maxPrice !== undefined ? String(maxPrice) : '',
    onlyImages: !!onlyImages,
    sort: sort || 'new',
  });

  const onToggleSelectCategory = () => {
    setState(s => ({...s, selectCategoryModal: !s.selectCategoryModal}));
  };

  const groupTitle = useMemo(() => {
    let title = '';
    if (state.mainCategory) {
      title = state.mainCategory?.title;
    }
    if (state.subCategory) {
      title = title + ' / ' + state.subCategory?.title;
    }
    if (state.subSubCategory) {
      title = title + ' / ' + state.subSubCategory?.title;
    }
    return title;
  }, [state.mainCategory, state.subCategory, state.subSubCategory]);

  const handleApply = () => {
    dispatch(
      setFilters({
        mainCategory: state.mainCategory,
        subCategory: state.subCategory,
        subSubCategory: state.subSubCategory,
        city: state.city,
        minPrice: state.minPrice ? Number(state.minPrice) : undefined,
        maxPrice: state.maxPrice ? Number(state.maxPrice) : undefined,
        onlyImages: state.onlyImages,
        sort: state.sort as any,
      }),
    );
    goBack();
  };

  const handleClear = () => {
    dispatch(clearFilters());
    goBack();
  };

  return (
    <Screen withoutScroll style={{flex: 1}}>
      <MainHeader title="فیلتر و مرتب‌سازی" />
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 24}}
        keyboardShouldPersistTaps="handled">
        <Text size={14} color={colors.pallete.gray2} style={styles.sectionTitle}>
          مرتب‌سازی
        </Text>
        <View style={styles.sortWrap}>
          {SORT_OPTIONS.map(option => {
            const active = state.sort === option.value;
            return (
              <Button
                key={option.value}
                onPress={() => setState(s => ({...s, sort: option.value}))}
                style={active ? styles.sortChipActive : styles.sortChip}>
                <Text size={14} color={active ? 'white' : colors.main}>
                  {option.label}
                </Text>
              </Button>
            );
          })}
        </View>

        <Divider height={16} />
        <Text size={14} color={colors.pallete.gray2} style={styles.sectionTitle}>
          دسته‌بندی و شهر
        </Text>
        <Button onPress={onToggleSelectCategory}>
          <UnderlineTextField
            placeholder="انتخاب گروه"
            editable={false}
            onPressIn={onToggleSelectCategory}
            value={state.mainCategory ? groupTitle : undefined}
          />
        </Button>
        <Divider />
        <Button onPress={() => setState(s => ({...s, cityModal: true}))}>
          <UnderlineTextField
            onPressIn={() => setState(s => ({...s, cityModal: true}))}
            placeholder="شهر"
            value={state.city?.title}
            editable={false}
          />
        </Button>

        <Divider height={16} />
        <Text size={14} color={colors.pallete.gray2} style={styles.sectionTitle}>
          بازه قیمت (تومان)
        </Text>
        <Row>
          <View style={{flex: 1}}>
            <UnderlineTextField
              value={state.minPrice}
              onChangeText={(text: any) => setState(s => ({...s, minPrice: text}))}
              placeholder="حداقل قیمت"
              keyboardType="number-pad"
            />
          </View>
          <Divider style={{width: 12}} />
          <View style={{flex: 1}}>
            <UnderlineTextField
              value={state.maxPrice}
              onChangeText={(text: any) => setState(s => ({...s, maxPrice: text}))}
              placeholder="حداکثر قیمت"
              keyboardType="number-pad"
            />
          </View>
        </Row>

        <Divider height={16} />
        <Button onPress={() => setState(s => ({...s, optionModal: true}))}>
          <UnderlineTextField
            onPressIn={() => setState(s => ({...s, optionModal: true}))}
            placeholder="فقط آگهی‌های عکس‌دار"
            value={state.onlyImages ? 'بله' : 'خیر'}
            editable={false}
          />
        </Button>

        <Divider height={24} />
        <Button onPress={handleClear} style={styles.clearButton}>
          <Text size={15} color={colors.main}>
            پاک کردن همه فیلترها
          </Text>
        </Button>
        <Divider height={64} />
      </ScrollView>

      <SelectAdsCategory
        onSelect={(m, sc, ssc) =>
          setState(s => ({
            ...s,
            mainCategory: m,
            subCategory: sc,
            subSubCategory: ssc,
          }))
        }
        onClose={onToggleSelectCategory}
        visible={state.selectCategoryModal}
      />
      <CitySelectModal
        onSelect={selectedCity =>
          setState(s => ({...s, city: selectedCity, cityModal: false}))
        }
        visible={state.cityModal}
        onClose={() => setState(s => ({...s, cityModal: false}))}
      />
      <AdsOptionsModal
        type="image"
        visible={state.optionModal}
        onSelect={item =>
          setState(s => ({
            ...s,
            onlyImages: item === 'بله',
            optionModal: false,
          }))
        }
        onClose={() => setState(s => ({...s, optionModal: false}))}
      />
      <Button onPress={handleApply} style={styles.Button}>
        <Text size={19} color="white">
          اعمال
        </Text>
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: 8,
  },
  sortWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
  },
  sortChip: {
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.main,
    backgroundColor: 'white',
    marginLeft: 8,
    marginBottom: 8,
  },
  sortChipActive: {
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.main,
    backgroundColor: colors.main,
    marginLeft: 8,
    marginBottom: 8,
  },
  clearButton: {
    alignSelf: 'center',
  },
  Button: {
    flex: undefined,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.main,
  },
});
