import {Image, ScrollView, StyleSheet, View, Alert} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {
  Button,
  FilePickerModal,
  GradiantHeader,
  MainHeader,
  Screen,
  Text,
  UnderlineTextField,
} from '../../../components';
import {colors, scaled} from '../../../theme';

type PickerTarget = 'cover' | 'logo' | null;

// A readable dark scrim works over any background (plain white placeholder
// or an actual cover photo) — the lighter glass gradient used elsewhere only
// reads over a sufficiently dark/colorful photo, and this screen usually has
// no photo yet.
const READABLE_HEADER_GRADIENT = ['rgba(0,0,0,0.45)', 'rgba(0,0,0,0.45)'];

// "ثبت فروشگاه" step 1 (store_v1.png design): cover photo, logo, store name.
// Just collects the fields here — submitting hands them to StoreTermsScreen
// (store_v2.png design, "فروشگاه – 2"), which shows the rules + exact fee and
// is where the store is actually created ("پرداخت" — see that screen for why).
export function CreateStoreScreen() {
  const {t} = useTranslation();
  const {navigate} = useNavigation<any>();
  const [name, setName] = useState('');
  const [cover, setCover] = useState<any>(null);
  const [logo, setLogo] = useState<any>(null);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

  const onNext = () => {
    if (!name.trim()) {
      Alert.alert(t('store.enterStoreName'));
      return;
    }
    navigate('storeTerms', {name: name.trim(), cover, logo});
  };

  return (
    <Screen withoutScroll>
      <MainHeader title={t('home.discountFinder')} />
      <View style={{flex: 1}}>
        <View style={styles.overlayNav}>
          <GradiantHeader
            title=""
            shareText={t('common.appName')}
            details={false}
            create
            onCreatePress={onNext}
            onBookMark={undefined}
            colors={READABLE_HEADER_GRADIENT}
            iconColor="white"
          />
        </View>
        <ScrollView contentContainerStyle={{paddingBottom: scaled(40)}}>
          <Button
            style={styles.coverBox}
            onPress={() => setPickerTarget('cover')}>
            {cover?.uri ? (
              <Image
                source={{uri: cover.uri}}
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <Ionicons name="camera-outline" size={scaled(80)} color="black" />
            )}
          </Button>

          <View style={styles.nameStrip}>
            <Button
              style={styles.logoBox}
              onPress={() => setPickerTarget('logo')}>
              {logo?.uri ? (
                <Image
                  source={{uri: logo.uri}}
                  style={StyleSheet.absoluteFill}
                />
              ) : (
                <Ionicons
                  name="camera-outline"
                  size={scaled(26)}
                  color={colors.pallete.gray3}
                />
              )}
            </Button>
            <View style={styles.nameField}>
              <UnderlineTextField
                value={name}
                onChangeText={setName}
                placeholder={t('store.enterStoreName')}
                placeholderTextColor={colors.main}
                inputStyle={styles.nameInput}
              />
            </View>
          </View>

          <Text style={styles.hint}>{t('store.monthlyFeeHint')}</Text>
        </ScrollView>
      </View>

      <FilePickerModal
        visible={!!pickerTarget}
        handleClose={() => setPickerTarget(null)}
        onSelectFile={(image: any) => {
          if (pickerTarget === 'cover') {
            setCover(image);
          } else if (pickerTarget === 'logo') {
            setLogo(image);
          }
          setPickerTarget(null);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  overlayNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
  },
  coverBox: {
    width: '100%',
    aspectRatio: 360 / 156,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pallete.gray1,
    paddingHorizontal: scaled(16),
    paddingVertical: scaled(8),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  logoBox: {
    width: scaled(69),
    height: scaled(69),
    marginTop: scaled(-46),
    borderRadius: scaled(8),
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  nameField: {
    flex: 1,
    marginRight: scaled(12),
  },
  nameInput: {
    color: colors.main,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingVertical: scaled(4),
    flex: 1,
  },
  hint: {
    textAlign: 'center',
    color: colors.pallete.grayText,
    marginTop: scaled(24),
  },
});
