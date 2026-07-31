import {I18nManager, Text, TextInput} from 'react-native';

/**
 * Startup settings that have to be in place before the first component
 * renders, so this module is imported at the top of index.js — ahead of App
 * and therefore ahead of every screen, component and navigator.
 */

type Defaultable = {defaultProps?: Record<string, unknown>};

/**
 * Take the OS "font size" / "display size" accessibility slider out of the
 * app's layout.
 *
 * React Native multiplies every fontSize by the system font scale by default.
 * This app's screens are drawn to fixed Figma measurements — a 29pt sort
 * button holding 19pt text, a 55pt field holding 18pt text — so a phone set to
 * "large" was rendering text that its own container had no room for: labels
 * clipped, rows wrapped into each other, buttons outgrew their bars. Nothing
 * about it was device size; it happened on any phone whose owner had raised
 * the slider, which on some Android skins is not even a deliberate choice.
 *
 * Set on the React Native components rather than only on this app's `Text`
 * wrapper, so it also covers the text this app never renders itself —
 * react-navigation's headers, third-party pickers and sliders — and any plain
 * `<Text>` a screen uses directly instead of the wrapper.
 *
 * At the default setting the system scale is 1, so this changes nothing on a
 * phone that was already showing the app correctly; it only removes the
 * multiplier on phones that had raised it. Callers can still opt a specific
 * piece of text back in by passing `allowFontScaling` explicitly — a default
 * is a default, not an override.
 */
function disableSystemFontScaling() {
  const text = Text as unknown as Defaultable;
  text.defaultProps = {...text.defaultProps, allowFontScaling: false};

  const textInput = TextInput as unknown as Defaultable;
  textInput.defaultProps = {
    ...textInput.defaultProps,
    allowFontScaling: false,
  };
}

/**
 * Belt to the native code's braces (AppDelegate.mm, MainActivity.java), which
 * is what actually pins the layout direction on a released build.
 *
 * This call cannot fix the current launch — both platforms read the direction
 * when the root view is created, before any of this runs — so it is not the
 * mechanism, it is the fallback: it keeps the preference written on the device
 * even if the app is ever run from a JS bundle whose native side predates
 * those two files (a stale dev client, an `expo prebuild` that regenerated
 * them), so at worst the mirroring lasts one launch instead of forever.
 */
function pinLayoutDirection() {
  I18nManager.allowRTL(false);
  if (I18nManager.isRTL) {
    I18nManager.forceRTL(false);
  }
}

disableSystemFontScaling();
pinLayoutDirection();
