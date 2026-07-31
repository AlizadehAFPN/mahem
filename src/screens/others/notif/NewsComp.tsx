import {
  Animated,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import React, {useMemo, useRef} from 'react';
import {
  Swipeable,
  // Not react-native's: a plain RN touchable nested inside a gesture-handler
  // tree can lose the touch to the enclosing pan handler on Android, which
  // would leave the revealed delete button unresponsive there.
  TouchableOpacity as GestureTouchableOpacity,
} from 'react-native-gesture-handler';
import Svg, {Path} from 'react-native-svg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components';
import {boldFont, colors, scaled} from '../../../theme';
import {
  formatNotificationAge,
  formatNotificationDate,
} from './notification-date';
import {
  barPath,
  bubblePath,
  cardGeometry,
  DESIGN,
  INSET,
  OUTLINE,
  SCREEN_PADDING,
  STROKE_W,
} from './notification-card-geometry';

const ACTION_WIDTH = scaled(84);

// Mirrors the (unexported) type Swipeable hands its render-actions callbacks.
type AnimatedInterpolation = ReturnType<Animated.Value['interpolate']>;

// Read state is the whole point of this row: خوانده‌شده turns both ticks green,
// نخوانده leaves them grey (Figma 106:530 / 106:545).
const TICK_READ = '#00CC00';
const TICK_UNREAD = '#7C7C7C';

// Figma's tick is a plain round-capped polyline; drawing it beats shipping two
// PNGs, since the only thing that changes between states is the colour.
function Tick({
  color,
  size,
  style,
}: {
  color: string;
  size: number;
  style: object;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      style={style}
      pointerEvents="none">
      <Path
        d="M25.5 270 L161.5 405.5 L485.5 81.5"
        stroke={color}
        strokeWidth={51}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function NewsComp({
  item,
  onPress,
  onDelete,
  onSwipeOpen,
  swipeableRef,
}: {
  item: any;
  onPress?: () => void;
  onDelete?: () => void;
  onSwipeOpen?: () => void;
  swipeableRef?: (ref: Swipeable | null) => void;
}) {
  const {t} = useTranslation();
  const {width} = useWindowDimensions();
  const localRef = useRef<Swipeable | null>(null);
  const cardWidth = width - SCREEN_PADDING * 2;
  // The card is a traced vector, so nothing here is a fixed pixel value: the
  // screen width feeds the scale.
  //
  // The device's text-size setting deliberately does not. This card used to
  // fold it in itself — the one place in the app that honoured it, because a
  // shape traced around its own text has to grow with that text rather than
  // let RN grow the text inside a fixed shape. The app now takes the OS text
  // size out of its layout everywhere (see src/bootstrap.ts), so reading it
  // here would leave this one row growing on a phone where every screen around
  // it holds still. Passing 1 keeps the card at its design size, and the
  // reason the parameter still exists is that the shape must never be scaled
  // independently of the text it was traced around.
  const g = useMemo(() => cardGeometry(cardWidth, 1), [cardWidth]);
  const tickColor = item?.isRead ? TICK_READ : TICK_UNREAD;

  // The base layout direction is pinned left-to-right on both platforms
  // (AppDelegate.mm / MainActivity.java), which would otherwise decide which
  // edge a swipe uncovers. Rather than pick one for a right-to-left reading
  // list, the same delete panel is mounted on both edges, so either direction
  // works whatever the phone's own language is.
  const renderAction =
    (side: 'left' | 'right') => (progress: AnimatedInterpolation) => {
      // Icon+label slide in from the row's edge as the panel widens instead of
      // sitting pre-positioned in a panel that grows out from under them.
      const translateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [
          side === 'left' ? -ACTION_WIDTH / 2 : ACTION_WIDTH / 2,
          0,
        ],
        extrapolate: 'clamp',
      });
      return (
        <GestureTouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            // Close first so the row doesn't sit half-open for the frame
            // between the tap and the list re-rendering without this item.
            localRef.current?.close();
            onDelete?.();
          }}
          style={[
            styles.action,
            side === 'left' ? styles.actionLeft : styles.actionRight,
          ]}>
          <Animated.View
            style={[styles.actionContent, {transform: [{translateX}]}]}>
            <MaterialIcons
              name="delete-outline"
              size={scaled(26)}
              color="white"
            />
            <Text style={styles.actionLabel}>{t('common.delete')}</Text>
          </Animated.View>
        </GestureTouchableOpacity>
      );
    };

  return (
    <View style={[styles.row, {marginTop: g.gap}]}>
      <Swipeable
        ref={ref => {
          localRef.current = ref;
          swipeableRef?.(ref);
        }}
        onSwipeableWillOpen={onSwipeOpen}
        renderLeftActions={renderAction('left')}
        renderRightActions={renderAction('right')}
        leftThreshold={ACTION_WIDTH / 2}
        rightThreshold={ACTION_WIDTH / 2}
        // Without this the row can be dragged past the action panel, exposing
        // the screen background behind it.
        overshootLeft={false}
        overshootRight={false}
        friction={2}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          style={{width: cardWidth, height: g.cardH}}>
          <Svg
            width={cardWidth}
            height={g.cardH}
            style={StyleSheet.absoluteFill}
            pointerEvents="none">
            <Path
              d={bubblePath(cardWidth, g)}
              fill={colors.pallete.gray1}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
            />
            <Path
              d={barPath(g)}
              fill={colors.pallete.gray1}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
            />
          </Svg>

          <Image
            style={[
              styles.logo,
              {width: g.avatar, height: g.avatar, borderRadius: g.radius},
            ]}
            source={require('../../../assets/images/logo.png')}
          />

          <View
            style={[
              styles.texts,
              {
                left: g.bubbleLeft + g.textPad,
                right: g.textPad,
                height: g.bubbleBottom,
              },
            ]}>
            <Text
              size={g.textSize}
              // The card's height is derived from this size (cardGeometry), so
              // anything that grew the text without growing the shape would
              // overflow the bubble. Stated here as well as in the app-wide
              // default (src/bootstrap.ts) because this row is the one place
              // where that coupling is load-bearing.
              allowFontScaling={false}
              style={[
                {lineHeight: g.lineHeight},
                item?.isRead ? undefined : styles.unread,
              ]}
              numberOfLines={1}>
              {item?.title}
            </Text>
            <Text
              size={g.textSize}
              allowFontScaling={false}
              style={{lineHeight: g.lineHeight}}
              numberOfLines={1}>
              {item?.body}
            </Text>
          </View>

          {/* Held to the bar's flat section: past tailX the outline dives away,
              and a stamp reaching into that wedge would hang out of the card. */}
          <View
            style={[
              styles.stamps,
              {
                top: g.barTop,
                height: g.shapeBottom - g.barTop,
                width: g.tailX,
                paddingLeft: g.textPad,
              },
            ]}>
            <Text
              size={g.stampSize}
              allowFontScaling={false}
              style={[
                styles.stamp,
                {width: g.ageSlot, lineHeight: g.stampLineHeight},
              ]}
              numberOfLines={1}>
              {formatNotificationAge(item?.createdAt, t)}
            </Text>
            <Text
              size={g.stampSize}
              allowFontScaling={false}
              style={[
                styles.stamp,
                styles.date,
                {width: g.dateSlot, lineHeight: g.stampLineHeight},
              ]}
              numberOfLines={1}>
              {formatNotificationDate(item?.createdAt)}
            </Text>
          </View>

          <Tick
            color={tickColor}
            size={g.tick}
            style={[
              styles.tick,
              {right: g.tickBackRight, bottom: g.tickBottom},
            ]}
          />
          <Tick
            color={tickColor}
            size={g.tick}
            style={[
              styles.tick,
              {right: g.tickFrontRight, bottom: g.tickBottom},
            ]}
          />
        </TouchableOpacity>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: SCREEN_PADDING,
  },
  logo: {
    position: 'absolute',
    left: INSET,
    top: INSET,
    borderWidth: STROKE_W,
    borderColor: OUTLINE,
    backgroundColor: 'white',
    resizeMode: 'contain',
  },
  // Two lines, vertically centred in the bubble — same block Figma fills with
  // one wrapped sentence, except the notification's title gets the first line.
  texts: {
    position: 'absolute',
    top: 0,
    justifyContent: 'center',
  },
  // The Persian face ships bold as its own file — fontWeight: 'bold' leaves the
  // title regular on Android instead of picking it up.
  unread: {
    fontFamily: boldFont,
  },
  stamps: {
    position: 'absolute',
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stamp: {
    color: colors.main,
    textAlign: 'left',
  },
  // Both stamps sit in fixed slots that together fill the bar's flat section,
  // so the date starts at the same x on every row however long the age label
  // is. flexShrink stays as a safety valve for a caller that opts back into OS
  // text scaling, where the slots could add up past the bar.
  date: {
    flexShrink: 1,
  },
  tick: {
    position: 'absolute',
  },
  action: {
    width: ACTION_WIDTH,
    backgroundColor: colors.pallete.red2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLeft: {
    borderTopLeftRadius: DESIGN.radius,
    borderBottomLeftRadius: DESIGN.radius,
  },
  actionRight: {
    borderTopRightRadius: DESIGN.radius,
    borderBottomRightRadius: DESIGN.radius,
  },
  actionContent: {
    alignItems: 'center',
  },
  actionLabel: {
    color: 'white',
    fontSize: scaled(13),
    marginTop: 2,
  },
});
