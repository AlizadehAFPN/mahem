import React, {useEffect} from 'react';
import {
  BackHandler,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {colors} from '../../theme';
import {Text} from '../text/text';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface Option {
  key: string;
  labelKey: string;
  onPress: (navigate: (route: string, params?: object) => void) => void;
}

// The badge is a true red semicircle whose flat edge sits on the card's top
// line, with the logo straddling that edge — half inside the dome, half out on
// the white card.
//
// A half-height box with rounded top corners does NOT give a semicircle: iOS
// clamps borderRadius to half the view's smallest dimension, so it renders as
// an arch with straight sides. Instead we draw a FULL circle inside a
// half-height overflow:hidden container, revealing only its top half. The logo
// is a separate element on top (not inside the clip) so its lower half isn't
// cut off.
const SCREEN_WIDTH = Dimensions.get('window').width;
const DOME_WIDTH = Math.round(SCREEN_WIDTH * 0.35);
const DOME_RADIUS = Math.round(DOME_WIDTH / 2);
// The logo nearly fills the dome (matching the reference design) rather than
// floating small inside an oversized disc.
const LOGO_WIDTH = Math.round(DOME_WIDTH * 0.8);
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * 34) / 72); // logo.png is 72x34
// Title sits just under the logo's lower (outside) half — hugging it, not
// spaced out like a menu item.
const CARD_PADDING_TOP = Math.round(LOGO_HEIGHT / 2) + 6;
// Thickness of the red band between the dome's flat edge and the white body
// (the card's top border). The other three sides stay at 4.
const TOP_BAND = 10;

// The تخفیف‌یاب hub (Figma node 106:4176), opened from the header menu button:
// a red-bordered card, topped by the app logo on a red disc that peeks above
// the card, offering the four ways into the section. "دسته‌بندی" opens the
// category list inside the menu tab; the other three are dedicated screens.
const OPTIONS: Option[] = [
  {
    key: 'nearby',
    labelKey: 'discountMenu.nearby',
    onPress: navigate => navigate('nearbyDiscounts'),
  },
  {
    key: 'categories',
    labelKey: 'discountMenu.categories',
    onPress: navigate => navigate('menuStack', {screen: 'offerCategories'}),
  },
  {
    key: 'alerts',
    labelKey: 'discountMenu.alerts',
    onPress: navigate => navigate('discountAlertCategories'),
  },
  {
    key: 'map',
    labelKey: 'discountMenu.map',
    onPress: navigate => navigate('discountMap'),
  },
  // Not in the original design (Figma only shows the four options above) —
  // added as the only entry point into the store creation/management flow,
  // since Figma never designed one.
  {
    key: 'myStore',
    labelKey: 'discountMenu.myStore',
    onPress: navigate => navigate('myStore'),
  },
];

export function DiscountMenuSheet({visible, onClose}: Props) {
  const {navigate} = useNavigation<any>();
  const {t} = useTranslation();

  useEffect(() => {
    if (!visible) {
      return;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onClose();
        return true;
      },
    );
    return () => subscription.remove();
  }, [visible, onClose]);

  const handleSelect = (option: Option) => {
    onClose();
    // Defer so the modal is fully dismissed before the navigation transition.
    requestAnimationFrame(() => option.onPress(navigate));
  };

  if (!visible) {
    return null;
  }

  // Rendered as a plain in-tree overlay rather than RN's <Modal>. On Android,
  // <Modal> opens a separate native Window, and react-native-maps' MapView
  // (a SurfaceView) draws above other Windows regardless of JS z-index,
  // punching through the sheet wherever a MapView sits behind it (see
  // discount-map-screen.tsx). A same-tree absolutely-positioned overlay stays
  // within the screen's own Window, so normal view stacking applies and it
  // correctly covers the map.
  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.content}>
        <View style={styles.sheet}>
          <Text style={{...styles.title, marginTop: -32, marginRight: 16}}>
            {t('home.discountFinder')}
          </Text>
          {OPTIONS.map(option => (
            <TouchableOpacity
              key={option.key}
              activeOpacity={0.7}
              onPress={() => handleSelect(option)}
              style={styles.row}>
              <Text style={styles.rowText}>{t(option.labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Clipped to its top half → a true semicircle peeking above the line. */}
        <View style={styles.domeClip} pointerEvents="none">
          <View style={styles.domeCircle} />
        </View>
        {/* Straddles the line, on top of everything, so neither half is cut. */}
        <View style={styles.logoWrap} pointerEvents="none">
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  content: {
    width: '100%',
  },
  sheet: {
    backgroundColor: 'white',
    borderWidth: 4,
    borderTopWidth: TOP_BAND,
    borderColor: colors.pallete.red3,
    // Compensate for the thicker top border so the caption/logo keep position.
    paddingTop: CARD_PADDING_TOP - (TOP_BAND - 4),
    paddingBottom: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 13,
    // Gap below the caption before the menu list's first divider, so it reads
    // as attached to the logo rather than as the first menu row.
    paddingBottom: 12,
  },
  domeClip: {
    position: 'absolute',
    top: -DOME_RADIUS,
    left: (SCREEN_WIDTH - DOME_WIDTH) / 2,
    width: DOME_WIDTH,
    height: DOME_RADIUS,
    overflow: 'hidden',
  },
  domeCircle: {
    width: DOME_WIDTH,
    height: DOME_WIDTH,
    borderRadius: DOME_RADIUS,
    backgroundColor: colors.pallete.red3,
  },
  logoWrap: {
    position: 'absolute',
    top: -LOGO_HEIGHT / 2,
    left: (SCREEN_WIDTH - LOGO_WIDTH) / 2,
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    marginTop: -10,
  },
  row: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#DBDBDB',
  },
  rowText: {
    textAlign: 'center',
    fontSize: 17,
  },
});
