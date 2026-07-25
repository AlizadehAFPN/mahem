import {ScrollView, StyleSheet, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import moment from 'moment-jalaali';
import {
  Row,
  Text,
  Button,
  Checkbox,
  MainHeader,
  Screen,
  Divider,
  UnderlineTextField,
  AdsOptionsModal,
  Picker,
  OptionPicker,
} from '../../../components';
import {LocationSelectModal} from '../../../components/modal/location-select-modal';
import {FilterCategorySelect} from './filter-category-select';
import {useAdsCategories} from '../../../hooks/use-cached-categories';
import {colors} from '../../../theme';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {clearFilters, setFilters} from '../../../stateManager/reducers/filters';
import {RootState} from '../../../stateManager';
import {localizeCategory, localizeOption} from '../../../i18n/display-maps';

// Matches Figma's "فیلتر- <دسته>" frames exactly: 3 equal-width sort
// buttons (not the previous 5-chip wrapping row), right-to-left order
// ارزان‌ترین/جدیدترین/گران‌ترین. Values match the backend's
// AdvertisementSort enum (find-advertisements.dto.ts) 1:1.
const SORT_OPTIONS = [
  {value: 'price_asc', labelKey: 'filter.sortCheapest'},
  {value: 'new', labelKey: 'filter.sortNewest'},
  {value: 'price_desc', labelKey: 'filter.sortPriciest'},
] as const;

// Room counts double as the value sent to the backend (`rooms`), so the
// Persian title stays canonical; it's only translated for display via
// localizeOption. AREA/AGE bucket labels, by contrast, are display-only (the
// min/max carry the value) and are built localized inside the component.
const ROOMS = ['بدون اتاق', 'یک', 'دو', 'سه', 'چهار یا بیشتر'].map(title => ({
  id: title,
  title,
}));

type PickerField =
  | 'rooms'
  | 'area'
  | 'age'
  | 'suburb'
  | 'estateCreator'
  | 'carCreator'
  | 'adType'
  | 'brand'
  | 'contractType'
  | 'education';

// Every field here is collected into local `state` and only reaches redux
// (via one setFilters dispatch) when "اعمال" is pressed. Fields shown are
// category-conditional, matching Figma's per-category "فیلتر- <دسته>"
// frames exactly (املاک sale/rent/عقد‌مشارکت, وسایل نقلیه, استخدامی, and a
// generic set for the other 6 categories) — mirrors the same
// subCategory-title conditionals already used by EstateForm/CarForm when
// posting an ad, for consistency.
export function FilterScreen() {
  const {t} = useTranslation();
  const {goBack} = useNavigation();
  const dispatch = useDispatch();
  const filters = useSelector((s: RootState) => s.filter);
  const {data: adsCategories} = useAdsCategories();

  // "متراژ"/"سن بنا" preset buckets — display-only labels (the min/max carry
  // the value), so they're localized here at render time.
  const currentYear = moment().jYear();
  const areaBuckets = [
    {id: 'lt50', title: t('filter.areaLt50'), maxArea: 50},
    {id: 'lt100', title: t('filter.areaLt100'), maxArea: 100},
    {id: 'lt150', title: t('filter.areaLt150'), maxArea: 150},
    {id: 'lt200', title: t('filter.areaLt200'), maxArea: 200},
    {id: 'gt200', title: t('filter.areaGt200'), minArea: 200},
  ];
  const ageBuckets = [
    {id: 'age1', title: t('filter.ageMax', {years: 1}), minProductYear: currentYear - 1},
    {id: 'age2', title: t('filter.ageMax', {years: 2}), minProductYear: currentYear - 2},
    {id: 'age5', title: t('filter.ageMax', {years: 5}), minProductYear: currentYear - 5},
    {id: 'age10', title: t('filter.ageMax', {years: 10}), minProductYear: currentYear - 10},
    {id: 'age15', title: t('filter.ageMax', {years: 15}), minProductYear: currentYear - 15},
    {id: 'age20', title: t('filter.ageMax', {years: 20}), minProductYear: currentYear - 20},
    {id: 'age20plus', title: t('filter.ageOver20'), maxProductYear: currentYear - 20},
  ];
  const yesNo = [
    {id: 'yes', title: t('common.yes')},
    {id: 'no', title: t('common.no')},
  ];
  const estateCreatorOptions = [
    {id: 'personal', title: t('filter.personal')},
    {id: 'agency', title: t('filter.estateAgent')},
  ];

  const [state, setState] = useState({
    selectCategoryModal: false,
    mainCategory: filters.mainCategory,
    subCategory: filters.subCategory,
    subSubCategory: filters.subSubCategory,
    locationModal: false,
    lat: filters.lat as number | undefined,
    lng: filters.lng as number | undefined,
    minPrice: filters.minPrice !== undefined ? String(filters.minPrice) : '',
    maxPrice: filters.maxPrice !== undefined ? String(filters.maxPrice) : '',
    rooms: filters.rooms ?? '',
    areaLabel: '',
    minArea: filters.minArea,
    maxArea: filters.maxArea,
    ageLabel: '',
    minProductYear: filters.minProductYear as number | undefined,
    maxProductYear: filters.maxProductYear as number | undefined,
    minOperationAmount:
      filters.minOperationAmount !== undefined ? String(filters.minOperationAmount) : '',
    maxOperationAmount:
      filters.maxOperationAmount !== undefined ? String(filters.maxOperationAmount) : '',
    minRehn: filters.minRehn !== undefined ? String(filters.minRehn) : '',
    maxRehn: filters.maxRehn !== undefined ? String(filters.maxRehn) : '',
    minEjare: filters.minEjare !== undefined ? String(filters.minEjare) : '',
    maxEjare: filters.maxEjare !== undefined ? String(filters.maxEjare) : '',
    isPersonalSeller: filters.isPersonalSeller as boolean | undefined,
    hasSuburb: filters.hasSuburb as boolean | undefined,
    brand: filters.brand ?? '',
    adType: filters.adType ?? '',
    contractType: filters.contractType ?? '',
    education: filters.education ?? '',
    onlyImages: !!filters.onlyImages,
    imageModal: false,
    sort: filters.sort || 'new',
    pickerField: undefined as PickerField | undefined,
  });

  const openPicker = (field: PickerField) =>
    setState(s => ({...s, pickerField: field}));
  const closePicker = () => setState(s => ({...s, pickerField: undefined}));

  const onToggleSelectCategory = () => {
    setState(s => ({...s, selectCategoryModal: !s.selectCategoryModal}));
  };

  const groupTitle = useMemo(() => {
    let title = '';
    if (state.mainCategory) {
      title = localizeCategory(state.mainCategory?.title);
    }
    if (state.subCategory) {
      title = title + ' / ' + localizeCategory(state.subCategory?.title);
    }
    if (state.subSubCategory) {
      title = title + ' / ' + localizeCategory(state.subSubCategory?.title);
    }
    return title;
  }, [state.mainCategory, state.subCategory, state.subSubCategory, t]);

  const isEstate = state.mainCategory?.title === 'املاک';
  const isVehicle = state.mainCategory?.title === 'وسایل نقلیه';
  const isJob = state.mainCategory?.title === 'استخدامی';
  const isGeneric = !isEstate && !isVehicle && !isJob;

  const isPartnership = state.subCategory?.title?.includes('عقد مشارکت');
  const isRent = state.subCategory?.title?.includes('رهن و اجاره');
  const isPassengerCar = state.subCategory?.title?.includes('سواری');

  const handleApply = () => {
    dispatch(
      setFilters({
        mainCategory: state.mainCategory,
        subCategory: state.subCategory,
        subSubCategory: state.subSubCategory,
        lat: state.lat,
        lng: state.lng,
        minPrice: state.minPrice ? Number(state.minPrice) : undefined,
        maxPrice: state.maxPrice ? Number(state.maxPrice) : undefined,
        rooms: state.rooms || undefined,
        minArea: state.minArea,
        maxArea: state.maxArea,
        minProductYear: state.minProductYear,
        maxProductYear: state.maxProductYear,
        minOperationAmount: state.minOperationAmount
          ? Number(state.minOperationAmount)
          : undefined,
        maxOperationAmount: state.maxOperationAmount
          ? Number(state.maxOperationAmount)
          : undefined,
        minRehn: state.minRehn ? Number(state.minRehn) : undefined,
        maxRehn: state.maxRehn ? Number(state.maxRehn) : undefined,
        minEjare: state.minEjare ? Number(state.minEjare) : undefined,
        maxEjare: state.maxEjare ? Number(state.maxEjare) : undefined,
        isPersonalSeller: state.isPersonalSeller,
        hasSuburb: state.hasSuburb,
        brand: state.brand || undefined,
        adType: state.adType || undefined,
        contractType: state.contractType || undefined,
        education: state.education || undefined,
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
    <Screen
      withoutScroll
      style={{flex: 1}}
      bottomSafeAreaColor={colors.main}>
      <MainHeader title={t('filter.title')} showBack />
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 24}}
        keyboardShouldPersistTaps="handled">
        <Divider height={16} />
        <Row style={styles.sortRow}>
          {SORT_OPTIONS.map(option => {
            const active = state.sort === option.value;
            return (
              <Button
                key={option.value}
                onPress={() => setState(s => ({...s, sort: option.value}))}
                style={active ? styles.sortChipActive : styles.sortChip}>
                <Text size={14} color={active ? 'white' : colors.text}>
                  {t(option.labelKey)}
                </Text>
              </Button>
            );
          })}
        </Row>

        <Divider height={16} />
        <Button onPress={onToggleSelectCategory}>
          <UnderlineTextField
            placeholder={t('createAds.selectGroup')}
            editable={false}
            value={state.mainCategory ? groupTitle : undefined}
          />
        </Button>

        {/* املاک */}
        {isEstate && (
          <>
            {!isPartnership && (
              <>
                <Divider />
                <Button onPress={() => openPicker('rooms')}>
                  <UnderlineTextField
                    editable={false}
                    placeholder={t('filter.roomsPlaceholder')}
                    value={localizeOption(state.rooms)}
                  />
                </Button>
                <Divider />
                <Button onPress={() => openPicker('area')}>
                  <UnderlineTextField
                    editable={false}
                    placeholder={t('filter.areaPlaceholder')}
                    value={state.areaLabel}
                  />
                </Button>
              </>
            )}
            <Divider />
            <Button onPress={() => openPicker('estateCreator')}>
              <UnderlineTextField
                editable={false}
                placeholder={t('filter.advertiser')}
                value={
                  state.isPersonalSeller === undefined
                    ? ''
                    : state.isPersonalSeller
                    ? t('filter.personal')
                    : t('filter.estateAgent')
                }
              />
            </Button>
            {!isPartnership &&
              (isRent ? (
                <>
                  <Divider />
                  <Row>
                    <View style={{flex: 1}}>
                      <UnderlineTextField
                        value={state.minRehn}
                        onChangeText={text => setState(s => ({...s, minRehn: text}))}
                        placeholder={t('filter.mortgageFrom')}
                        keyboardType="number-pad"
                      />
                    </View>
                    <Divider style={{width: 12}} />
                    <View style={{flex: 1}}>
                      <UnderlineTextField
                        value={state.maxRehn}
                        onChangeText={text => setState(s => ({...s, maxRehn: text}))}
                        placeholder={t('filter.mortgageTo')}
                        keyboardType="number-pad"
                      />
                    </View>
                  </Row>
                  <Divider />
                  <Row>
                    <View style={{flex: 1}}>
                      <UnderlineTextField
                        value={state.minEjare}
                        onChangeText={text => setState(s => ({...s, minEjare: text}))}
                        placeholder={t('filter.rentFrom')}
                        keyboardType="number-pad"
                      />
                    </View>
                    <Divider style={{width: 12}} />
                    <View style={{flex: 1}}>
                      <UnderlineTextField
                        value={state.maxEjare}
                        onChangeText={text => setState(s => ({...s, maxEjare: text}))}
                        placeholder={t('filter.rentTo')}
                        keyboardType="number-pad"
                      />
                    </View>
                  </Row>
                </>
              ) : (
                <>
                  <Divider />
                  <Row>
                    <View style={{flex: 1}}>
                      <UnderlineTextField
                        value={state.minPrice}
                        onChangeText={text => setState(s => ({...s, minPrice: text}))}
                        placeholder={t('filter.priceFrom')}
                        keyboardType="number-pad"
                      />
                    </View>
                    <Divider style={{width: 12}} />
                    <View style={{flex: 1}}>
                      <UnderlineTextField
                        value={state.maxPrice}
                        onChangeText={text => setState(s => ({...s, maxPrice: text}))}
                        placeholder={t('filter.priceTo')}
                        keyboardType="number-pad"
                      />
                    </View>
                  </Row>
                </>
              ))}
            {!isPartnership && (
              <>
                <Divider />
                <Button onPress={() => openPicker('age')}>
                  <UnderlineTextField
                    editable={false}
                    placeholder={t('filter.buildingAge')}
                    value={state.ageLabel}
                  />
                </Button>
                <Divider />
                <Button onPress={() => openPicker('suburb')}>
                  <UnderlineTextField
                    editable={false}
                    placeholder={t('forms.suburb')}
                    value={
                      state.hasSuburb === undefined
                        ? ''
                        : state.hasSuburb
                        ? t('common.yes')
                        : t('common.no')
                    }
                  />
                </Button>
              </>
            )}
          </>
        )}

        {/* وسایل نقلیه */}
        {isVehicle && (
          <>
            {isPassengerCar && (
              <>
                <Divider />
                <Button onPress={() => openPicker('brand')}>
                  <UnderlineTextField
                    editable={false}
                    placeholder={t('forms.brand')}
                    value={localizeOption(state.brand)}
                  />
                </Button>
              </>
            )}
            <Divider />
            <Row>
              <View style={{flex: 1}}>
                <UnderlineTextField
                  value={state.minPrice}
                  onChangeText={text => setState(s => ({...s, minPrice: text}))}
                  placeholder={t('filter.priceFrom')}
                  keyboardType="number-pad"
                />
              </View>
              <Divider style={{width: 12}} />
              <View style={{flex: 1}}>
                <UnderlineTextField
                  value={state.maxPrice}
                  onChangeText={text => setState(s => ({...s, maxPrice: text}))}
                  placeholder={t('filter.priceTo')}
                  keyboardType="number-pad"
                />
              </View>
            </Row>
            <Divider />
            <Row>
              <View style={{flex: 1}}>
                <UnderlineTextField
                  value={
                    state.minProductYear !== undefined ? String(state.minProductYear) : ''
                  }
                  onChangeText={text =>
                    setState(s => ({
                      ...s,
                      minProductYear: text ? Number(text) : undefined,
                    }))
                  }
                  placeholder={t('filter.yearFrom')}
                  keyboardType="number-pad"
                />
              </View>
              <Divider style={{width: 12}} />
              <View style={{flex: 1}}>
                <UnderlineTextField
                  value={
                    state.maxProductYear !== undefined ? String(state.maxProductYear) : ''
                  }
                  onChangeText={text =>
                    setState(s => ({
                      ...s,
                      maxProductYear: text ? Number(text) : undefined,
                    }))
                  }
                  placeholder={t('filter.yearTo')}
                  keyboardType="number-pad"
                />
              </View>
            </Row>
            <Divider />
            <Button onPress={() => openPicker('adType')}>
              <UnderlineTextField
                editable={false}
                placeholder={t('filter.adTypePlaceholder')}
                value={localizeOption(state.adType)}
              />
            </Button>
            <Divider />
            <Row>
              <View style={{flex: 1}}>
                <UnderlineTextField
                  value={state.minOperationAmount}
                  onChangeText={text =>
                    setState(s => ({...s, minOperationAmount: text}))
                  }
                  placeholder={t('filter.mileageFrom')}
                  keyboardType="number-pad"
                />
              </View>
              <Divider style={{width: 12}} />
              <View style={{flex: 1}}>
                <UnderlineTextField
                  value={state.maxOperationAmount}
                  onChangeText={text =>
                    setState(s => ({...s, maxOperationAmount: text}))
                  }
                  placeholder={t('filter.mileageTo')}
                  keyboardType="number-pad"
                />
              </View>
            </Row>
          </>
        )}

        {/* استخدامی */}
        {isJob && (
          <>
            <Divider />
            <Button onPress={() => openPicker('contractType')}>
              <UnderlineTextField
                editable={false}
                placeholder={t('forms.contractType')}
                value={localizeOption(state.contractType)}
              />
            </Button>
            <Divider />
            <Button onPress={() => openPicker('education')}>
              <UnderlineTextField
                editable={false}
                placeholder={t('forms.education')}
                value={localizeOption(state.education)}
              />
            </Button>
          </>
        )}

        {/* لوازم الکترونیکی/لوازم خانگی/خدمات/تجهیزات و عمده‌فروشی/سرگرمی و
            فراغت/وسایل شخصی و هر دسته‌ی دیگر */}
        {isGeneric && (
          <>
            <Divider />
            <Button onPress={() => setState(s => ({...s, locationModal: true}))}>
              <UnderlineTextField
                editable={false}
                placeholder={t('filter.setLocation')}
                value={state.lat && state.lng ? t('forms.locationSelected') : ''}
              />
            </Button>
            <Divider />
            <Row>
              <View style={{flex: 1}}>
                <UnderlineTextField
                  value={state.minPrice}
                  onChangeText={text => setState(s => ({...s, minPrice: text}))}
                  placeholder={t('filter.priceFrom')}
                  keyboardType="number-pad"
                />
              </View>
              <Divider style={{width: 12}} />
              <View style={{flex: 1}}>
                <UnderlineTextField
                  value={state.maxPrice}
                  onChangeText={text => setState(s => ({...s, maxPrice: text}))}
                  placeholder={t('filter.priceTo')}
                  keyboardType="number-pad"
                />
              </View>
            </Row>
          </>
        )}

        <Divider height={16} />
        <Checkbox
          value={state.onlyImages}
          onToggle={() => setState(s => ({...s, onlyImages: !s.onlyImages}))}
          style={{flexDirection: 'row', alignSelf: 'center'}}
          text={t('filter.onlyWithImagesCheckbox')}
        />

        <Divider height={24} />
        <Button onPress={handleClear} style={styles.clearButton}>
          <Text size={15} color={colors.main}>
            {t('filter.clearAll')}
          </Text>
        </Button>
        <Divider height={64} />
      </ScrollView>

      <LocationSelectModal
        visible={state.locationModal}
        onClose={() => setState(s => ({...s, locationModal: false}))}
        onSelect={(lat, lng) => setState(s => ({...s, lat, lng}))}
      />
      <AdsOptionsModal
        type="image"
        visible={state.imageModal}
        onSelect={item =>
          setState(s => ({...s, onlyImages: item === 'بله', imageModal: false}))
        }
        onClose={() => setState(s => ({...s, imageModal: false}))}
      />

      {/* Single-select pickers shared by every category-conditional field
          above — each just needs a data list and an onSelect mapping, so
          one Picker instance (swapping `data`/`onSelect` per open field)
          avoids duplicating the same modal wiring per field. */}
      <Picker
        visible={state.pickerField === 'rooms'}
        onClose={closePicker}
        data={ROOMS}
        onSelect={(item: any) => {
          setState(s => ({...s, rooms: item.title}));
          closePicker();
        }}
      />
      <Picker
        visible={state.pickerField === 'area'}
        onClose={closePicker}
        data={areaBuckets}
        onSelect={(item: any) => {
          setState(s => ({
            ...s,
            areaLabel: item.title,
            minArea: item.minArea,
            maxArea: item.maxArea,
          }));
          closePicker();
        }}
      />
      <Picker
        visible={state.pickerField === 'age'}
        onClose={closePicker}
        data={ageBuckets}
        onSelect={(item: any) => {
          setState(s => ({
            ...s,
            ageLabel: item.title,
            minProductYear: item.minProductYear,
            maxProductYear: item.maxProductYear,
          }));
          closePicker();
        }}
      />
      <Picker
        visible={state.pickerField === 'suburb'}
        onClose={closePicker}
        data={yesNo}
        onSelect={(item: any) => {
          setState(s => ({...s, hasSuburb: item.id === 'yes'}));
          closePicker();
        }}
      />
      <Picker
        visible={state.pickerField === 'estateCreator'}
        onClose={closePicker}
        data={estateCreatorOptions}
        onSelect={(item: any) => {
          setState(s => ({...s, isPersonalSeller: item.id === 'personal'}));
          closePicker();
        }}
      />
      <OptionPicker
        type="brand"
        visible={state.pickerField === 'brand'}
        onClose={closePicker}
        onSelect={(label: string) => {
          setState(s => ({...s, brand: label}));
          closePicker();
        }}
      />
      <OptionPicker
        type="adsType"
        visible={state.pickerField === 'adType'}
        onClose={closePicker}
        onSelect={(label: string) => {
          setState(s => ({...s, adType: label}));
          closePicker();
        }}
      />
      <OptionPicker
        type="contractType"
        visible={state.pickerField === 'contractType'}
        onClose={closePicker}
        onSelect={(label: string) => {
          setState(s => ({...s, contractType: label}));
          closePicker();
        }}
      />
      <OptionPicker
        type="education"
        visible={state.pickerField === 'education'}
        onClose={closePicker}
        onSelect={(label: string) => {
          setState(s => ({...s, education: label}));
          closePicker();
        }}
      />

      <Button onPress={handleApply} style={styles.applyButton}>
        <Text size={19} color="white">
          {t('filter.apply')}
        </Text>
      </Button>

      {/* Step-by-step, full-screen category selection (Figma "فیلتر – 1" /
          "فیلتر- <دسته>"): rendered last so its absolute-fill overlay sits
          above the form and the اعمال bar while open. تخفیف‌یاب is part of the
          GENERAL tree but excluded here — it has its own تخفیف‌یاب browse
          flow and isn't one of the filter's 9 categories in Figma. */}
      <FilterCategorySelect
        visible={state.selectCategoryModal}
        data={adsCategories?.data || []}
        excludeTitles={['تخفیف']}
        onClose={onToggleSelectCategory}
        onSelect={path =>
          setState(s => ({
            ...s,
            mainCategory: path[0],
            subCategory: path[1],
            subSubCategory: path[2],
            selectCategoryModal: false,
          }))
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sortRow: {
    justifyContent: 'space-between',
  },
  sortChip: {
    flex: 1,
    height: 29,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    backgroundColor: colors.pallete.gray1,
    marginHorizontal: 2,
  },
  sortChipActive: {
    flex: 1,
    height: 29,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.main,
    backgroundColor: colors.main,
    marginHorizontal: 2,
  },
  clearButton: {
    alignSelf: 'center',
  },
  applyButton: {
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
