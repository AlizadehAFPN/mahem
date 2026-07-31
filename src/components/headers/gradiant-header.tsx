import {View, StyleSheet} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import {Button} from '../button/button';
import {Divider} from '../divider/divider';
import {Row} from '../row/row';
import {SocialShare} from '../social-share/social-share';
import {Text} from '../text/text';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import {colors as allColors, scaled} from '../../theme';
/**
 * Typed rather than left to inference. With a bare destructured parameter,
 * TypeScript makes every property without a default *required* — so callers
 * that legitimately pass only what they need (SingleJobScreen passes a share
 * text and nothing else) were type errors, and adding a prop turned every
 * existing call site into one. Everything here is genuinely optional; the
 * component already guards each use.
 */
export interface GradiantHeaderProps {
  title?: string;
  /** Gradient stops. Defaults to flat white. */
  colors?: string[];
  /** Show the share/bookmark actions. */
  details?: boolean;
  /** Show the «ارسال» submit action (the create/edit forms). */
  create?: boolean;
  onCreatePress?: () => void;
  onBookMark?: () => void;
  isBookmarked?: boolean;
  iconColor?: string;
  /**
   * Text shared via the share icon — falls back to `title`, since every
   * caller already passes one, rather than a fixed string written for the
   * real-estate screen this header started on.
   */
  shareText?: string;
  /**
   * Deep link to whatever this screen is showing, from deep-links.ts. Without
   * it the share is a line of text the recipient can read but not act on;
   * screens that aren't showing one shareable thing (the create-ad and
   * create-store forms) correctly pass nothing.
   */
  shareLink?: string;
}

export function GradiantHeader({
  title,
  colors,
  details = true,
  create = false,
  onCreatePress,
  onBookMark,
  isBookmarked = false,
  iconColor = 'black',
  shareText,
  shareLink,
}: GradiantHeaderProps) {
  const {t} = useTranslation();
  const {goBack} = useNavigation<any>();
  const onShare = () => {
    SocialShare({
      message: shareText || title || t('common.appName'),
      link: shareLink,
      dialogTitle: t('common.appName'),
    });
  };
  const onBookMarkPress = () => {
    onBookMark && onBookMark();
  };
  return (
    <LinearGradient
      style={styles.container}
      colors={colors || ['#FFFFFF', '#FFFFFF']}
      start={{x: 0, y: 1}}
      end={{x: 0, y: 0}}>
      <Button onPress={goBack}>
        <Row>
          <MaterialIcons
            color={iconColor}
            size={scaled(25)}
            name="keyboard-arrow-right"
          />
          <Text color={iconColor}>{title}</Text>
        </Row>
      </Button>
      {details ? (
        <Row>
          <Button onPress={onShare}>
            <Octicons
              size={scaled(20)}
              name="share-android"
              color={iconColor}
            />
          </Button>
          <Divider style={{width: scaled(5)}} />
          <Button onPress={onBookMarkPress}>
            {isBookmarked ? (
              <Ionicons
                color={allColors.pallete.yellow}
                size={scaled(20)}
                name="moon"
              />
            ) : (
              <Ionicons
                size={scaled(20)}
                name="moon-outline"
                color={iconColor}
              />
            )}
          </Button>
        </Row>
      ) : create ? (
        <Button onPress={onCreatePress}>
          <Row>
            {/* Drawn in the header's own icon colour, like the back arrow
                opposite it. It used to be hard-coded white, which is invisible
                on the white gradient this header defaults to — the store form
                only got away with it by passing iconColor="white" over a dark
                one. */}
            <Text size={15} color={iconColor}>
              {t('common.send')}
            </Text>
            <Feather color={iconColor} name="check" size={scaled(20)} />
          </Row>
        </Button>
      ) : (
        <View />
      )}
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    height: scaled(26),
    paddingHorizontal: scaled(8),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
