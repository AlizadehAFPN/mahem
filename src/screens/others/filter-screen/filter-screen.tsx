import {ScrollView, StyleSheet, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import moment from 'moment-jalaali';
import {
  Row,
  Text,
  Button,
  MainHeader,
  Screen,
  Divider,
  UnderlineTextField,
  Picker,
  OptionPicker,
} from '../../../components';
import {LocationSelectModal} from '../../../components/modal/location-select-modal';
import {FilterCategorySelect} from './filter-category-select';
import {useAdsCategories} from '../../../hooks/use-cached-categories';
import {colors, scaled} from '../../../theme';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {clearFilters, setFilters} from '../../../stateManager/reducers/filters';
import {RootState} from '../../../stateManager';
import {localizeCategory, localizeOption} from '../../../i18n/display-maps';

// Every measurement below is read off Figma's "فیلتر" (106:4897) and
// "فیلتر- <دسته>" frames, which are drawn on a 360×640 artboard. On a device
// that size or larger `scaled` hands each one back untouched, so these stay the
// literal Figma numbers there and only come in on a screen smaller than the
// artboard — where the three sort buttons and the "از/تا" field pairs are the
// first things to collide. Two different horizontal insets are deliberate: the
// sort bar spans x 19…341 while the field rules span x 37…323, i.e. the fields
// sit 18px further in on each side.
const FIGMA = {
  pagePadding: scaled(19),
  fieldInset: scaled(18),
  sortHeight: scaled(29),
  sortGap: scaled(6),
  sortRadius: scaled(5),
  sortFontSize: scaled(19),
  fieldFontSize: scaled(15),
  // Rules sit on a 39px pitch (y 153/192/231/270); a 15px field is ~29px tall
  // once its padding and rule are counted, leaving this as the gap.
  fieldGap: scaled(10),
  // Sort bar ends at y114, the first field's label starts at y136.
  sortToFields: scaled(22),
};

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

// One row of the Figma filter form: a 15px right-aligned label sitting on the
// shared red rule. UnderlineTextField replaces its whole `inputStyle` with any
// the caller passes (it spreads props after its own), so the base style is
// restated here rather than merged — that's the only way to reach Figma's 15px
// without restyling the component for every other form in the app.
const FIELD_INPUT_STYLE = {
  paddingVertical: scaled(4),
  textAlign: 'right' as const,
  textDecorationColor: colors.main,
  flex: 1,
  fontSize: FIGMA.fieldFontSize,
};

// A row that opens a picker instead of taking typed input. The TextField is
// non-editable and lets touches through (see TextField's pointerEvents), so
// the tap lands on this Button.
function FilterRow({
  onPress,
  placeholder,
  value,
}: {
  onPress: () => void;
  placeholder: string;
  value?: string;
}) {
  return (
    <Button onPress={onPress}>
      <UnderlineTextField
        editable={false}
        placeholder={placeholder}
        value={value}
        inputStyle={FIELD_INPUT_STYLE}
      />
    </Button>
  );
}

// The "از/تا" pairs (price, rent, year, mileage) — two numeric fields sharing
// one row, as drawn in the per-category frames. `money` opts the pair into
// comma grouping while typing, so it goes on the price/رهن/اجاره rows and not
// on the year or mileage ones — the values the row hands back are plain digits
// either way.
function RangeRow({
  min,
  max,
  minPlaceholder,
  maxPlaceholder,
  onChangeMin,
  onChangeMax,
  money,
}: {
  min: string;
  max: string;
  minPlaceholder: string;
  maxPlaceholder: string;
  onChangeMin: (text: string) => void;
  onChangeMax: (text: string) => void;
  money?: boolean;
}) {
  return (
    <Row>
      <View style={{flex: 1}}>
        <UnderlineTextField
          value={min}
          onChangeText={onChangeMin}
          placeholder={minPlaceholder}
          keyboardType="number-pad"
          thousandSeparator={money}
          inputStyle={FIELD_INPUT_STYLE}
        />
      </View>
      <Divider style={{width: scaled(12)}} />
      <View style={{flex: 1}}>
        <UnderlineTextField
          value={max}
          onChangeText={onChangeMax}
          placeholder={maxPlaceholder}
          keyboardType="number-pad"
          thousandSeparator={money}
          inputStyle={FIELD_INPUT_STYLE}
        />
      </View>
    </Row>
  );
}

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
  | 'education'
  | 'onlyImages';

// Every field here is collected into local `state` and only reaches redux
// (via one setFilters dispatch) when "اعمال" is pressed. Fields shown are
// category-conditional, matching Figma's per-category "فیلتر- <دسته>"
// frames exactly (املاک sale/rent/عقد‌مشارکت, وسایل نقلیه, استخدامی, and a
// generic set for the other 6 categories) — mirrors the same
// subCategory-title conditionals already used by EstateForm/CarForm when
// posting an ad, for consistency.
export function FilterScreen() {
  const {t} = useTranslation();
  const {goBack} = useNavigation<any>();
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
    {
      id: 'age1',
      title: t('filter.ageMax', {years: 1}),
      minProductYear: currentYear - 1,
    },
    {
      id: 'age2',
      title: t('filter.ageMax', {years: 2}),
      minProductYear: currentYear - 2,
    },
    {
      id: 'age5',
      title: t('filter.ageMax', {years: 5}),
      minProductYear: currentYear - 5,
    },
    {
      id: 'age10',
      title: t('filter.ageMax', {years: 10}),
      minProductYear: currentYear - 10,
    },
    {
      id: 'age15',
      title: t('filter.ageMax', {years: 15}),
      minProductYear: currentYear - 15,
    },
    {
      id: 'age20',
      title: t('filter.ageMax', {years: 20}),
      minProductYear: currentYear - 20,
    },
    {
      id: 'age20plus',
      title: t('filter.ageOver20'),
      maxProductYear: currentYear - 20,
    },
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
      filters.minOperationAmount !== undefined
        ? String(filters.minOperationAmount)
        : '',
    maxOperationAmount:
      filters.maxOperationAmount !== undefined
        ? String(filters.maxOperationAmount)
        : '',
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
    onlyImages: filters.onlyImages as boolean | undefined,
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
    <Screen withoutScroll style={{flex: 1}} bottomSafeAreaColor={colors.main}>
      <MainHeader title={t('filter.title')} showBack />
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{
          paddingHorizontal: FIGMA.pagePadding,
          paddingBottom: scaled(24),
        }}
        keyboardShouldPersistTaps="handled">
        <Divider height={FIGMA.sortToFields} />
        {/* Segmented sort bar: three equal buttons, only the outer corners
            rounded. `Row` lays out row-reverse (the app draws its RTL that way
            over a base direction pinned left-to-right, rather than through
            I18nManager), so the first option renders rightmost — which is where
            Figma puts ارزان‌ترین. */}
        <Row>
          {SORT_OPTIONS.map((option, index) => {
            const active = state.sort === option.value;
            return (
              <Button
                key={option.value}
                onPress={() => setState(s => ({...s, sort: option.value}))}
                style={{
                  ...styles.sortChip,
                  ...(index === 0 ? styles.sortChipFirst : {}),
                  ...(index === SORT_OPTIONS.length - 1
                    ? styles.sortChipLast
                    : {}),
                  ...(active ? styles.sortChipActive : {}),
                }}>
                <Text
                  numberOfLines={1}
                  size={FIGMA.sortFontSize}
                  color={active ? 'white' : colors.pallete.red3}>
                  {t(option.labelKey)}
                </Text>
              </Button>
            );
          })}
        </Row>

        <Divider height={FIGMA.sortToFields} />
        {/* The field rules are inset a further 18px each side (Figma x 37…323). */}
        <View style={styles.fields}>
          <FilterRow
            onPress={onToggleSelectCategory}
            placeholder={t('createAds.selectGroup')}
            value={state.mainCategory ? groupTitle : undefined}
          />

          {/* املاک */}
          {isEstate && (
            <>
              {!isPartnership && (
                <>
                  <Divider height={FIGMA.fieldGap} />
                  <FilterRow
                    onPress={() => openPicker('rooms')}
                    placeholder={t('filter.roomsPlaceholder')}
                    value={localizeOption(state.rooms)}
                  />
                  <Divider height={FIGMA.fieldGap} />
                  <FilterRow
                    onPress={() => openPicker('area')}
                    placeholder={t('filter.areaPlaceholder')}
                    value={state.areaLabel}
                  />
                </>
              )}
              <Divider height={FIGMA.fieldGap} />
              <FilterRow
                onPress={() => openPicker('estateCreator')}
                placeholder={t('filter.advertiser')}
                value={
                  state.isPersonalSeller === undefined
                    ? ''
                    : state.isPersonalSeller
                    ? t('filter.personal')
                    : t('filter.estateAgent')
                }
              />
              {!isPartnership &&
                (isRent ? (
                  <>
                    <Divider height={FIGMA.fieldGap} />
                    <RangeRow
                      min={state.minRehn}
                      max={state.maxRehn}
                      money
                      minPlaceholder={t('filter.mortgageFrom')}
                      maxPlaceholder={t('filter.mortgageTo')}
                      onChangeMin={text =>
                        setState(s => ({...s, minRehn: text}))
                      }
                      onChangeMax={text =>
                        setState(s => ({...s, maxRehn: text}))
                      }
                    />
                    <Divider height={FIGMA.fieldGap} />
                    <RangeRow
                      min={state.minEjare}
                      max={state.maxEjare}
                      money
                      minPlaceholder={t('filter.rentFrom')}
                      maxPlaceholder={t('filter.rentTo')}
                      onChangeMin={text =>
                        setState(s => ({...s, minEjare: text}))
                      }
                      onChangeMax={text =>
                        setState(s => ({...s, maxEjare: text}))
                      }
                    />
                  </>
                ) : (
                  <>
                    <Divider height={FIGMA.fieldGap} />
                    <RangeRow
                      min={state.minPrice}
                      max={state.maxPrice}
                      money
                      minPlaceholder={t('filter.priceFrom')}
                      maxPlaceholder={t('filter.priceTo')}
                      onChangeMin={text =>
                        setState(s => ({...s, minPrice: text}))
                      }
                      onChangeMax={text =>
                        setState(s => ({...s, maxPrice: text}))
                      }
                    />
                  </>
                ))}
              {!isPartnership && (
                <>
                  <Divider height={FIGMA.fieldGap} />
                  <FilterRow
                    onPress={() => openPicker('age')}
                    placeholder={t('filter.buildingAge')}
                    value={state.ageLabel}
                  />
                  <Divider height={FIGMA.fieldGap} />
                  <FilterRow
                    onPress={() => openPicker('suburb')}
                    placeholder={t('forms.suburb')}
                    value={
                      state.hasSuburb === undefined
                        ? ''
                        : state.hasSuburb
                        ? t('common.yes')
                        : t('common.no')
                    }
                  />
                </>
              )}
            </>
          )}

          {/* وسایل نقلیه */}
          {isVehicle && (
            <>
              {isPassengerCar && (
                <>
                  <Divider height={FIGMA.fieldGap} />
                  <FilterRow
                    onPress={() => openPicker('brand')}
                    placeholder={t('forms.brand')}
                    value={localizeOption(state.brand)}
                  />
                </>
              )}
              <Divider height={FIGMA.fieldGap} />
              <RangeRow
                min={state.minPrice}
                max={state.maxPrice}
                money
                minPlaceholder={t('filter.priceFrom')}
                maxPlaceholder={t('filter.priceTo')}
                onChangeMin={text => setState(s => ({...s, minPrice: text}))}
                onChangeMax={text => setState(s => ({...s, maxPrice: text}))}
              />
              <Divider height={FIGMA.fieldGap} />
              <RangeRow
                min={
                  state.minProductYear !== undefined
                    ? String(state.minProductYear)
                    : ''
                }
                max={
                  state.maxProductYear !== undefined
                    ? String(state.maxProductYear)
                    : ''
                }
                minPlaceholder={t('filter.yearFrom')}
                maxPlaceholder={t('filter.yearTo')}
                onChangeMin={text =>
                  setState(s => ({
                    ...s,
                    minProductYear: text ? Number(text) : undefined,
                  }))
                }
                onChangeMax={text =>
                  setState(s => ({
                    ...s,
                    maxProductYear: text ? Number(text) : undefined,
                  }))
                }
              />
              <Divider height={FIGMA.fieldGap} />
              <FilterRow
                onPress={() => openPicker('adType')}
                placeholder={t('filter.adTypePlaceholder')}
                value={localizeOption(state.adType)}
              />
              <Divider height={FIGMA.fieldGap} />
              <RangeRow
                min={state.minOperationAmount}
                max={state.maxOperationAmount}
                minPlaceholder={t('filter.mileageFrom')}
                maxPlaceholder={t('filter.mileageTo')}
                onChangeMin={text =>
                  setState(s => ({...s, minOperationAmount: text}))
                }
                onChangeMax={text =>
                  setState(s => ({...s, maxOperationAmount: text}))
                }
              />
            </>
          )}

          {/* استخدامی */}
          {isJob && (
            <>
              <Divider height={FIGMA.fieldGap} />
              <FilterRow
                onPress={() => openPicker('contractType')}
                placeholder={t('forms.contractType')}
                value={localizeOption(state.contractType)}
              />
              <Divider height={FIGMA.fieldGap} />
              <FilterRow
                onPress={() => openPicker('education')}
                placeholder={t('forms.education')}
                value={localizeOption(state.education)}
              />
            </>
          )}

          {/* لوازم الکترونیکی/لوازم خانگی/خدمات/تجهیزات و عمده‌فروشی/سرگرمی و
            فراغت/وسایل شخصی و هر دسته‌ی دیگر */}
          {isGeneric && (
            <>
              <Divider height={FIGMA.fieldGap} />
              <FilterRow
                onPress={() => setState(s => ({...s, locationModal: true}))}
                placeholder={t('filter.setLocation')}
                value={
                  state.lat && state.lng ? t('forms.locationSelected') : ''
                }
              />
              <Divider height={FIGMA.fieldGap} />
              <RangeRow
                min={state.minPrice}
                max={state.maxPrice}
                money
                minPlaceholder={t('filter.priceFrom')}
                maxPlaceholder={t('filter.priceTo')}
                onChangeMin={text => setState(s => ({...s, minPrice: text}))}
                onChangeMax={text => setState(s => ({...s, maxPrice: text}))}
              />
            </>
          )}

          {/* "نمایش فقط آگهی های عکس‌دار" — the one row Figma draws in every
            filter frame, general and category-independent, so it stays
            outside all the conditionals above and always sits last. */}
          <Divider height={FIGMA.fieldGap} />
          <FilterRow
            onPress={() => openPicker('onlyImages')}
            placeholder={t('filter.onlyWithImages')}
            value={
              state.onlyImages === undefined
                ? ''
                : state.onlyImages
                ? t('common.yes')
                : t('common.no')
            }
          />
        </View>

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
      {/* عکس‌دار: بله narrows to ads that carry at least one image, خیر is an
          explicit "don't narrow" — the backend treats a missing/false
          onlyImages identically (see FindAdvertisementsDto). */}
      <Picker
        visible={state.pickerField === 'onlyImages'}
        onClose={closePicker}
        data={yesNo}
        onSelect={(item: any) => {
          setState(s => ({...s, onlyImages: item.id === 'yes'}));
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
  fields: {
    paddingHorizontal: FIGMA.fieldInset,
  },
  sortChip: {
    flex: 1,
    height: FIGMA.sortHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    backgroundColor: colors.pallete.gray1,
    marginHorizontal: FIGMA.sortGap / 2,
    // Figma's drop shadow on each button (0 3 6 rgba(0,0,0,0.16)).
    shadowColor: '#000',
    shadowOffset: {width: 0, height: scaled(3)},
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
  // Only the two ends of the bar are rounded, so the three buttons read as one
  // segmented control. These are physical (not start/end) corners on purpose:
  // the row is `row-reverse` rather than an RTL layout, so the first option is
  // the one on the right.
  sortChipFirst: {
    borderTopRightRadius: FIGMA.sortRadius,
    borderBottomRightRadius: FIGMA.sortRadius,
    marginRight: 0,
  },
  sortChipLast: {
    borderTopLeftRadius: FIGMA.sortRadius,
    borderBottomLeftRadius: FIGMA.sortRadius,
    marginLeft: 0,
  },
  // Figma only draws the resting state; the selected one reuses the app's
  // primary red so the choice is legible against the other two.
  sortChipActive: {
    borderColor: colors.main,
    backgroundColor: colors.main,
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
    height: scaled(48),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.main,
  },
});
