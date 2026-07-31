import * as React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ScreenProps} from './screen.props';
import {offsets, presets} from './screen.presets';
import {colors} from '../../theme';

const isIos = Platform.OS === 'ios';

function ScreenWithoutScrolling(props: ScreenProps) {
  const insets = useSafeAreaInsets();
  const preset = presets.fixed;
  const style = props.style || {};
  const backgroundStyle = props.backgroundColor
    ? {backgroundColor: props.backgroundColor}
    : {};

  return (
    <KeyboardAvoidingView
      style={[preset.outer, backgroundStyle]}
      behavior={isIos ? 'padding' : undefined}
      keyboardVerticalOffset={offsets[props.keyboardOffset || 'none']}>
      <StatusBar
        backgroundColor={props.statusbarBackgroundColor || colors.main}
        barStyle={props.statusBar || 'light-content'}
      />
      {!props.unsafe && (
        <View
          style={{
            height: insets.top,
            backgroundColor: props.statusbarBackgroundColor || colors.main,
          }}
        />
      )}
      <View style={[preset.inner, style]}>{props.children}</View>
      {/* Bottom safe-area filler. Without it, any screen whose last child
          is a bottom button (payment/submit screens) renders it flush
          against the home indicator / gesture bar instead of above it.
          `inner` has flex: 1, so this fixed-height sibling just shrinks it
          by exactly insets.bottom. Transparent by default (shows the
          screen's white background); screens with a big bottom CTA pass
          `bottomSafeAreaColor` so this strip reads as an extension of the
          button rather than a white gap beneath it. */}
      {/* {!props.unsafe && (
        <View
          style={{
            height: insets.bottom,
            backgroundColor: props.bottomSafeAreaColor,
          }}
        />
      )} */}
    </KeyboardAvoidingView>
  );
}

function ScreenWithScrolling(props: ScreenProps) {
  const insets = useSafeAreaInsets();
  const preset = presets.scroll;
  const style = props.style || {};
  const backgroundStyle = props.backgroundColor
    ? {backgroundColor: props.backgroundColor}
    : {backgroundColor: 'white'};

  return (
    <KeyboardAvoidingView
      style={[preset.outer, backgroundStyle]}
      behavior={isIos ? 'padding' : undefined}
      keyboardVerticalOffset={offsets[props.keyboardOffset || 'none']}>
      <StatusBar
        backgroundColor={props.statusbarBackgroundColor || colors.main}
        barStyle={props.statusBar || 'light-content'}
      />
      {!props.unsafe && (
        <View
          style={{
            height: insets.top,
            backgroundColor: props.statusbarBackgroundColor || colors.main,
          }}
        />
      )}
      <View style={[preset.outer, backgroundStyle]}>
        <ScrollView
          style={[preset.outer, backgroundStyle]}
          contentContainerStyle={[
            preset.inner,
            // Pad the scroll content by the bottom inset so the last
            // scrolled-to item (often a submit button) clears the home
            // indicator / gesture bar. When a screen opts into a colored
            // bottom strip (below), that strip provides the clearance
            // instead, so the padding is skipped to avoid doubling it.
            !props.unsafe &&
              !props.bottomSafeAreaColor && {paddingBottom: insets.bottom},
            style,
          ]}
          keyboardShouldPersistTaps={
            props.keyboardShouldPersistTaps || 'handled'
          }
          // refreshControl={props.onRefresh ?
          //   <RefreshControl
          //     refreshing={props.refreshing}
          //     onRefresh={props.onRefresh}
          //   /> : <View />
          // }
        >
          {props.children}
        </ScrollView>
      </View>
      {/* Opt-in colored bottom safe-area strip (default: white). Screens
          with a big bottom CTA pass `bottomSafeAreaColor` so the
          home-indicator area reads as an extension of the button. */}
      {!props.unsafe && props.bottomSafeAreaColor && (
        <View
          style={{
            height: insets.bottom,
            backgroundColor: props.bottomSafeAreaColor,
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

/**
 * The starting component on every screen in the app.
 *
 * @param props The screen props
 */
export function Screen(props: ScreenProps) {
  if (props.withoutScroll) {
    return <ScreenWithoutScrolling {...props} />;
  } else {
    return <ScreenWithScrolling {...props} />;
  }
}
