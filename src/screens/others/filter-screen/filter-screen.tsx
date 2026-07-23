import {ScrollView, StyleSheet, View} from 'react-native';
import React, {useMemo, useState} from 'react';
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
  SelectAdsCategory,
  AdsOptionsModal,
  Picker,
  OptionPicker,
} from '../../../components';
import {LocationSelectModal} from '../../../components/modal/location-select-modal';
import {colors} from '../../../theme';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {clearFilters, setFilters} from '../../../stateManager/reducers/filters';
import {RootState} from '../../../stateManager';

// Matches Figma's "فیلتر- <دسته>" frames exactly: 3 equal-width sort
// buttons (not the previous 5-chip wrapping row), right-to-left order
// ارزان‌ترین/جدیدترین/گران‌ترین. Values match the backend's
// AdvertisementSort enum (find-advertisements.dto.ts) 1:1.
const SORT_OPTIONS = [
  {value: 'price_asc', label: 'ارزان‌ترین'},
  {value: 'new', label: 'جدیدترین'},
  {value: 'price_desc', label: 'گران‌ترین'},
] as const;

const ROOMS = ['بدون اتاق', 'یک', 'دو', 'سه', 'چهار یا بیشتر'].map(title => ({
  id: title,
  title,
}));

// "متراژ" (Figma 106:5611) — a preset bucket list, not a free range input;
// each option maps to a min/max area threshold.
const AREA_BUCKETS = [
  {id: 'lt50', title: 'کمتر از 50 متر', maxArea: 50},
  {id: 'lt100', title: 'زیر 100 متر', maxArea: 100},
  {id: 'lt150', title: 'زیر 150 متر', maxArea: 150},
  {id: 'lt200', title: 'زیر 200 متر', maxArea: 200},
  {id: 'gt200', title: 'بالای 200 متر', minArea: 200},
];

// "سن بنا" (Figma 106:5695) — preset age buckets, converted to a
// minProductYear/maxProductYear range using the current Shamsi year (the
// app already depends on moment-jalaali; سال ساخت is entered in Shamsi by
// the user in EstateForm, same as وسایل نقلیه's سال تولید).
function buildAgeBuckets() {
  const currentYear = moment().jYear();
  return [
    {id: 'age1', title: 'حداکثر 1 سال', minProductYear: currentYear - 1},
    {id: 'age2', title: 'حداکثر 2 سال', minProductYear: currentYear - 2},
    {id: 'age5', title: 'حداکثر 5 سال', minProductYear: currentYear - 5},
    {id: 'age10', title: 'حداکثر 10 سال', minProductYear: currentYear - 10},
    {id: 'age15', title: 'حداکثر 15 سال', minProductYear: currentYear - 15},
    {id: 'age20', title: 'حداکثر 20 سال', minProductYear: currentYear - 20},
    {id: 'age20plus', title: 'بیش از 20سال', maxProductYear: currentYear - 20},
  ];
}

const YES_NO = [
  {id: 'yes', title: 'بله'},
  {id: 'no', title: 'خیر'},
];

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
  const {goBack} = useNavigation();
  const dispatch = useDispatch();
  const filters = useSelector((s: RootState) => s.filter);

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
    <Screen withoutScroll style={{flex: 1}}>
      <MainHeader title="فیلتر" showBack />
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
                  {option.label}
                </Text>
              </Button>
            );
          })}
        </Row>

        <Divider height={16} />
        <Button onPress={onToggleSelectCategory}>
          <UnderlineTextField
            placeholder="انتخاب گروه"
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
                    placeholder="تعیین تعداد اتاق"
                    value={state.rooms}
                  />
                </Button>
                <Divider />
                <Button onPress={() => openPicker('area')}>
                  <UnderlineTextField
                    editable={false}
                    placeholder="تعیین متراژ"
                    value={state.areaLabel}
                  />
                </Button>
              </>
            )}
            <Divider />
            <Button onPress={() => openPicker('estateCreator')}>
              <UnderlineTextField
                editable={false}
                placeholder="آگهی دهنده"
                value={
                  state.isPersonalSeller === undefined
                    ? ''
                    : state.isPersonalSeller
                    ? 'شخصی'
                    : 'مشاور املاک'
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
                        placeholder="رهن از"
                        keyboardType="number-pad"
                      />
                    </View>
                    <Divider style={{width: 12}} />
                    <View style={{flex: 1}}>
                      <UnderlineTextField
                        value={state.maxRehn}
                        onChangeText={text => setState(s => ({...s, maxRehn: text}))}
                        placeholder="رهن تا"
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
                        placeholder="اجاره از"
                        keyboardType="number-pad"
                      />
                    </View>
                    <Divider style={{width: 12}} />
                    <View style={{flex: 1}}>
                      <UnderlineTextField
                        value={state.maxEjare}
                        onChangeText={text => setState(s => ({...s, maxEjare: text}))}
                        placeholder="اجاره تا"
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
                        placeholder="قیمت از"
                        keyboardType="number-pad"
                      />
                    </View>
                    <Divider style={{width: 12}} />
                    <View style={{flex: 1}}>
                      <UnderlineTextField
                        value={state.maxPrice}
                        onChangeText={text => setState(s => ({...s, maxPrice: text}))}
                        placeholder="قیمت تا"
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
                    placeholder="سن بنا"
                    value={state.ageLabel}
                  />
                </Button>
                <Divider />
                <Button onPress={() => openPicker('suburb')}>
                  <UnderlineTextField
                    editable={false}
                    placeholder="حومه شهر"
                    value={
                      state.hasSuburb === undefined
                        ? ''
                        : state.hasSuburb
                        ? 'بله'
                        : 'خیر'
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
                    placeholder="برند"
                    value={state.brand}
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
                  placeholder="قیمت از"
                  keyboardType="number-pad"
                />
              </View>
              <Divider style={{width: 12}} />
              <View style={{flex: 1}}>
                <UnderlineTextField
                  value={state.maxPrice}
                  onChangeText={text => setState(s => ({...s, maxPrice: text}))}
                  placeholder="قیمت تا"
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
                  placeholder="از سال"
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
                  placeholder="تا سال"
                  keyboardType="number-pad"
                />
              </View>
            </Row>
            <Divider />
            <Button onPress={() => openPicker('adType')}>
              <UnderlineTextField
                editable={false}
                placeholder="تعیین نوع آگهی"
                value={state.adType}
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
                  placeholder="کارکرد از"
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
                  placeholder="کارکرد تا"
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
                placeholder="نوع قرارداد"
                value={state.contractType}
              />
            </Button>
            <Divider />
            <Button onPress={() => openPicker('education')}>
              <UnderlineTextField
                editable={false}
                placeholder="میزان تحصیلات"
                value={state.education}
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
                placeholder="تعیین موقعیت"
                value={state.lat && state.lng ? 'موقعیت انتخاب شد' : ''}
              />
            </Button>
            <Divider />
            <Row>
              <View style={{flex: 1}}>
                <UnderlineTextField
                  value={state.minPrice}
                  onChangeText={text => setState(s => ({...s, minPrice: text}))}
                  placeholder="قیمت از"
                  keyboardType="number-pad"
                />
              </View>
              <Divider style={{width: 12}} />
              <View style={{flex: 1}}>
                <UnderlineTextField
                  value={state.maxPrice}
                  onChangeText={text => setState(s => ({...s, maxPrice: text}))}
                  placeholder="قیمت تا"
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
          text="نمایش فقط آگهی های عکس دار"
        />

        <Divider height={24} />
        <Button onPress={handleClear} style={styles.clearButton}>
          <Text size={15} color={colors.main}>
            پاک کردن همه فیلترها
          </Text>
        </Button>
        <Divider height={64} />
      </ScrollView>

      <SelectAdsCategory
        onSelect={(m: any, sc: any, ssc: any) =>
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
        data={AREA_BUCKETS}
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
        data={buildAgeBuckets()}
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
        data={YES_NO}
        onSelect={(item: any) => {
          setState(s => ({...s, hasSuburb: item.id === 'yes'}));
          closePicker();
        }}
      />
      <Picker
        visible={state.pickerField === 'estateCreator'}
        onClose={closePicker}
        data={[
          {id: 'personal', title: 'شخصی'},
          {id: 'agency', title: 'مشاور املاک'},
        ]}
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
          اعـمـال
        </Text>
      </Button>
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
