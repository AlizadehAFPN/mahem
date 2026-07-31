package com.mahem_app;
import expo.modules.ReactActivityDelegateWrapper;

import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.facebook.react.modules.i18nmanager.I18nUtil;

public class MainActivity extends ReactActivity {

  /**
   * The app draws its own right-to-left layout: every row is a
   * `flexDirection: 'row-reverse'` (see components/row) over a left-to-right
   * base, and text is right-aligned by the Text preset. That construction is
   * correct only while the base direction actually is left-to-right.
   *
   * Android derives that base from the device's preferred language, not from
   * us, so on a phone set to Persian the whole tree became RTL — and every
   * row-reverse, being a reversal of a direction that had itself already
   * reversed, drew left-to-right. The app mirrored itself: rows ran the wrong
   * way and content sat against the left edge, on exactly the phones whose
   * owners read Persian.
   *
   * Pinning the base direction here makes the layout the same on every device
   * rather than a function of the user's language setting. Nothing changes for
   * a phone that was already left-to-right, which is why the screens that look
   * right today go on looking right.
   *
   * This has to happen before super.onCreate: that is where the ReactRootView
   * is built, and it reads the direction from these preferences once, on the
   * way up. savedInstanceState is still passed through untouched — restoring
   * it is existing behaviour and none of this is a reason to change it.
   */
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    I18nUtil i18nUtil = I18nUtil.getInstance();
    i18nUtil.allowRTL(getApplicationContext(), false);
    i18nUtil.forceRTL(getApplicationContext(), false);
    super.onCreate(savedInstanceState);
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "mahem_app";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegateWrapper(this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED, new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled()));
  }
}
