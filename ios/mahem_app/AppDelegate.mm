#import "AppDelegate.h"
#import <Firebase.h>

#import <React/RCTBundleURLProvider.h>
#import <React/RCTI18nUtil.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // The app draws its own right-to-left layout: every row is a
  // `flexDirection: 'row-reverse'` (see components/row) over a left-to-right
  // base, and text is right-aligned by the Text preset. That construction is
  // correct only while the base direction actually is left-to-right.
  //
  // iOS decides that base from the device language, not from us, so on a phone
  // set to Persian the whole tree became RTL — and every row-reverse, being a
  // reversal of a direction that had itself already reversed, drew
  // left-to-right. The app mirrored itself: rows ran the wrong way and content
  // sat against the left edge, on exactly the phones whose owners read Persian.
  //
  // Pinning the base direction here makes the layout the same on every device
  // rather than a function of the user's language setting. Nothing changes for
  // a phone that was already left-to-right, which is why the screens that look
  // right today go on looking right. It must run before the bridge starts, as
  // RCTRootView reads the direction when it is created and JS receives it as a
  // launch-time constant.
  [[RCTI18nUtil sharedInstance] allowRTL:NO];
  [[RCTI18nUtil sharedInstance] forceRTL:NO];

  self.moduleName = @"mahem_app";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  [FIRApp configure];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
