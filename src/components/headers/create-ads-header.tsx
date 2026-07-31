import {StyleSheet, View, BackHandler} from 'react-native';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Row} from '../row/row';
import {Button} from '../button/button';
import {Text} from '../text/text';
import {Divider} from '../divider/divider';
import {AdsImageSelection} from '../file-picker/ads-image-selection';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import {colors, scaled} from '../../theme';
import {useNavigation} from '@react-navigation/native';

// The «ثبت رایگان آگهی» bar: back + title on one side, «ارسال» on the other.
// Split out of CreateAdsHeader so a screen can pin it to the top and let the
// image picker below scroll away with the form (see CreateAdsDetailsScreen).
export function CreateAdsTopBar({
  onCreatePress,
  onBack,
  isSending,
  title,
}: any) {
  const {t} = useTranslation();
  const {goBack} = useNavigation<any>();
  const headerTitle = title ?? t('createAds.postFreeAd');
  const handleBack = () => {
    if (onBack) {
      onBack();
      return true;
    }
    goBack();
    return true;
  };
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBack,
    );

    return () => subscription.remove();
  }, []);
  return (
    <View style={styles.continer}>
      <Row
        style={{
          justifyContent: 'space-between',
          paddingHorizontal: scaled(8),
          paddingBottom: scaled(4),
        }}>
        <Button onPress={handleBack}>
          <Row>
            <MaterialIcons
              color="white"
              size={scaled(25)}
              name="keyboard-arrow-right"
            />
            <Text color="white" size={17}>
              {headerTitle}
            </Text>
          </Row>
        </Button>
        <Button onPress={onCreatePress} loading={isSending}>
          <Row>
            <Text size={15} color="white">
              {t('common.send')}
            </Text>
            <Feather color="white" name="check" size={scaled(20)} />
          </Row>
        </Button>
      </Row>
      <LinearGradient
        style={{height: 1, width: '100%'}}
        colors={[colors.main, 'white', 'white', 'white', colors.main]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
      />
    </View>
  );
}

// «انتخاب تصویر مناسب برای آگهی» + the five image slots. Carries its own brand
// background so it can live inside a ScrollView, on top of the white form.
export function CreateAdsImagePicker({
  onSelectImage,
  onRemoveImage,
  uploadingIndexes = [],
  initialImages = [],
}: any) {
  const {t} = useTranslation();
  return (
    <View style={styles.continer}>
      <Divider height={10} />
      <Text preset="bold" size={20} style={{textAlign: 'center'}}>
        {t('createAds.chooseImage')}
      </Text>
      <Divider height={10} />
      <Text style={{textAlign: 'center'}}>{t('createAds.imageBoostHint')}</Text>
      <Divider />
      <Row style={{justifyContent: 'space-around'}}>
        {[...new Array(5)].map((item, index) => (
          <AdsImageSelection
            key={String(index + 3132)}
            onSelectImage={(image: any) => onSelectImage(image, index)}
            onRemoveImage={() => onRemoveImage && onRemoveImage(index)}
            uploading={uploadingIndexes.includes(index)}
            initialImageUri={initialImages[index]}
          />
        ))}
      </Row>
      <Divider height={10} />
    </View>
  );
}

// Both halves together, as one fixed block — what screens that don't need the
// image picker to scroll (edit-ad) still use.
export function CreateAdsHeader({
  onCreatePress,
  onSelectImage,
  onRemoveImage,
  onBack,
  isSending,
  uploadingIndexes = [],
  initialImages = [],
  title,
}: any) {
  return (
    <View style={styles.continer}>
      <CreateAdsTopBar
        onCreatePress={onCreatePress}
        onBack={onBack}
        isSending={isSending}
        title={title}
      />
      <CreateAdsImagePicker
        onSelectImage={onSelectImage}
        onRemoveImage={onRemoveImage}
        uploadingIndexes={uploadingIndexes}
        initialImages={initialImages}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  continer: {
    backgroundColor: colors.main,
  },
});
