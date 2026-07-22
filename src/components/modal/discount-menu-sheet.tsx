import React from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors} from '../../theme';
import {Row} from '../row/row';
import {Text} from '../text/text';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface Option {
  key: string;
  label: string;
  icon: string;
  onPress: (navigate: (route: string, params?: object) => void) => void;
}

// The تخفیف‌یاب hub (screenshot 9): opened from the header menu button, it
// offers the four ways into the section. "دسته‌بندی" reuses the existing
// category list inside the menu tab; the other three are dedicated screens.
const OPTIONS: Option[] = [
  {
    key: 'nearby',
    label: 'تخفیف‌های نزدیک من',
    icon: 'navigate',
    onPress: navigate => navigate('nearbyDiscounts'),
  },
  {
    key: 'categories',
    label: 'دسته‌بندی',
    icon: 'grid',
    onPress: navigate => navigate('menuStack', {screen: 'offerDetection'}),
  },
  {
    key: 'alerts',
    label: 'اطلاع از تخفیف‌های نزدیک من',
    icon: 'notifications',
    onPress: navigate => navigate('discountAlertCategories'),
  },
  {
    key: 'map',
    label: 'تخفیف‌های روی نقشه',
    icon: 'map',
    onPress: navigate => navigate('discountMap'),
  },
];

export function DiscountMenuSheet({visible, onClose}: Props) {
  const {navigate} = useNavigation<any>();

  const handleSelect = (option: Option) => {
    onClose();
    // Defer so the modal is fully dismissed before the navigation transition.
    requestAnimationFrame(() => option.onPress(navigate));
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Row style={styles.header}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text preset="bold" size={16} style={{marginRight: 8}}>
            تخفیف یاب
          </Text>
        </Row>
        {OPTIONS.map((option, index) => (
          <TouchableOpacity
            key={option.key}
            activeOpacity={0.7}
            onPress={() => handleSelect(option)}
            style={[styles.row, index === 0 && styles.firstRow]}>
            <Ionicons
              name={option.icon}
              size={22}
              color={colors.main}
              style={{marginLeft: 12}}
            />
            <Text size={16} style={{flex: 1, textAlign: 'right'}}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.pallete.gray3,
    marginBottom: 8,
  },
  header: {
    justifyContent: 'center',
    paddingVertical: 10,
  },
  logo: {
    width: 36,
    height: 36,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.pallete.gray1,
  },
  firstRow: {
    borderTopWidth: 0,
  },
});
