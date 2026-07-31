import {useEffect} from 'react';
import {Alert} from 'react-native';
import {useSelector} from 'react-redux';
import {useQueryClient} from 'react-query';
import {RootState} from '../../stateManager';
import {registerDeviceToken, updateMyLocation} from '../../services';
import {getCurrentPosition} from '../../utiles';
import i18n from '../../i18n';
import {openTarget} from '../../navigation/navigation-ref';
import {resolveNotificationTarget} from '../../screens/others/notif/notification-target';

/**
 * Where a tapped push should land.
 *
 * `data` on an FCM message is a flat string map, so this normalizes the shapes
 * the backend actually sends onto the entityType/entityId pair
 * resolveNotificationTarget already understands — the same function the
 * in-app پیام‌ها list routes through, so a notification opens the same screen
 * whether it was tapped in the tray or in the list.
 *
 * `advertisementId` is the nearby-discount payload
 * (AdvertisementsService.notifyNearby). It is read as well as entityType/
 * entityId because installed builds are still receiving that shape.
 */
function targetForPushData(data: Record<string, any> | undefined) {
  if (!data) {
    return null;
  }
  if (data.entityType && data.entityId) {
    return resolveNotificationTarget({
      type: data.type,
      entityType: data.entityType,
      entityId: data.entityId,
    });
  }
  if (data.advertisementId) {
    return resolveNotificationTarget({
      type: data.type,
      entityType: 'Advertisement',
      entityId: data.advertisementId,
    });
  }
  // An admin broadcast carries no entity. Opening the app on its normal first
  // screen is the honest outcome — resolveNotificationTarget's notifDetail
  // fallback needs the stored notification row, which a bare push doesn't have.
  return null;
}

// Renders nothing. While the user is signed in it (1) obtains FCM permission,
// registers this device's push token with the backend, and keeps it fresh on
// rotation, (2) shows an in-app alert for discount pushes that arrive while the
// app is foregrounded, (3) routes a tapped push to the thing it is about, and
// (4) syncs the device's location once so nearby alerts can be targeted.
// Everything is wrapped defensively so a missing native module (e.g. before a
// rebuild) or denied permission never crashes the app.
export function NotificationsBridge() {
  const token = useSelector((s: RootState) => s.user.token);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) {
      return;
    }

    let unsubscribeOnMessage: (() => void) | undefined;
    let unsubscribeOnRefresh: (() => void) | undefined;
    let unsubscribeOnOpened: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        // Imported lazily so the JS bundle still loads if the native module
        // isn't linked yet (the app keeps working, just without push).
        const messaging = require('@react-native-firebase/messaging').default;

        const authStatus = await messaging().requestPermission();
        const enabled = authStatus === 1 /* AUTHORIZED */ || authStatus === 2;

        if (enabled) {
          const fcmToken = await messaging().getToken();
          if (fcmToken && !cancelled) {
            await registerDeviceToken(fcmToken).catch(() => {});
          }
          unsubscribeOnRefresh = messaging().onTokenRefresh((t: string) => {
            registerDeviceToken(t).catch(() => {});
          });
        }

        unsubscribeOnMessage = messaging().onMessage(async (msg: any) => {
          const title =
            msg?.notification?.title ?? i18n.t('notifications.newDiscount');
          const body = msg?.notification?.body ?? '';
          Alert.alert(title, body);
          queryClient.invalidateQueries(['notifications']);
        });

        // Tapping a notification in the tray. Two entry points, because the
        // OS reports them separately — and until both were wired the tap did
        // nothing at all beyond opening the app on its first screen:
        //
        //   onNotificationOpenedApp — app was in the background
        //   getInitialNotification  — app was not running, this tap launched it
        //
        // openTarget covers the second case's timing problem: it resolves
        // before there is a navigator, so the target waits for AppStack.
        const openFromMessage = (msg: any) => {
          const target = targetForPushData(msg?.data);
          if (target) {
            openTarget(target);
          }
          queryClient.invalidateQueries(['notifications']);
        };

        unsubscribeOnOpened =
          messaging().onNotificationOpenedApp(openFromMessage);

        const initialMessage = await messaging().getInitialNotification();
        if (initialMessage && !cancelled) {
          openFromMessage(initialMessage);
        }
      } catch {
        // Native module unavailable or permission flow failed — skip push.
      }

      // Best-effort one-time location sync for nearby-discount targeting.
      try {
        const {lat, lng} = await getCurrentPosition();
        if (!cancelled) {
          await updateMyLocation(lat, lng).catch(() => {});
        }
      } catch {
        // Location denied/unavailable — nearby alerts simply won't target
        // this user until a discount screen updates the location later.
      }
    })();

    return () => {
      cancelled = true;
      unsubscribeOnMessage?.();
      unsubscribeOnRefresh?.();
      unsubscribeOnOpened?.();
    };
  }, [token, queryClient]);

  return null;
}
