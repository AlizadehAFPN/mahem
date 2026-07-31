import {createNavigationContainerRef} from '@react-navigation/native';

/**
 * A handle on the navigator for the two things that can ask the app to open a
 * screen from outside the React tree: a tapped push notification
 * (NotificationsBridge) and an opened deep link (DeepLinkBridge).
 *
 * Both arrive at moments when navigating naively fails silently:
 *
 *  - Cold start. `getInitialNotification()` / `getInitialURL()` resolve while
 *    RootNavigator is still showing CheckingSessionSplash — there is no
 *    navigator mounted yet, so the call goes nowhere.
 *  - Signed out, or a half-finished account. RootNavigator swaps whole stacks
 *    on `token`/`username`/`cityId`, and the target route names only exist in
 *    AppStack; asking AuthStack for `singleProduct` throws.
 *
 * So a target is remembered rather than dispatched, and replayed once a
 * navigator that actually contains it is mounted (see flushPendingTarget,
 * called from NavigationContainer's onReady and from AppStack's mount).
 */
export const navigationRef = createNavigationContainerRef<any>();

export interface NavigationTarget {
  route: string;
  params?: Record<string, unknown>;
}

// At most one. A second notification tapped before the first could be replayed
// means the user asked for the second one — the first is stale, not queued.
let pendingTarget: NavigationTarget | null = null;

/**
 * Go to `target` now if that is possible, otherwise remember it.
 * Safe to call at any point in the app's lifecycle, from outside React.
 */
export function openTarget(target: NavigationTarget) {
  pendingTarget = target;
  flushPendingTarget();
}

/**
 * Replay a remembered target, if the mounted navigator can serve it.
 * A no-op when there is nothing pending or the app isn't ready — deliberately
 * cheap, because it is called on every navigation-container ready and every
 * AppStack mount.
 */
export function flushPendingTarget() {
  const target = pendingTarget;
  if (!target || !navigationRef.isReady()) {
    return;
  }

  // Only dispatch once the mounted stack actually declares the route.
  // Otherwise the target stays pending: the user is still signing in or
  // picking a city, and this same check runs again when AppStack mounts.
  const routeNames = navigationRef.getRootState()?.routeNames ?? [];
  if (!routeNames.includes(target.route)) {
    return;
  }

  pendingTarget = null;
  navigationRef.navigate(target.route as never, target.params as never);
}

// Test seam — nothing in the app clears a target without navigating.
export function __resetPendingTarget() {
  pendingTarget = null;
}
