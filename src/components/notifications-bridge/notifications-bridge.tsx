import {useEffect} from 'react';
import {Alert} from 'react-native';
import {useSelector} from 'react-redux';
import {useQueryClient} from 'react-query';
import {RootState} from '../../stateManager';
import {registerDeviceToken, updateMyLocation} from '../../services';
import {getCurrentPosition} from '../../utiles';
import i18n from '../../i18n';

// Renders nothing. While the user is signed in it (1) obtains FCM permission,
// registers this device's push token with the backend, and keeps it fresh on
// rotation, (2) shows an in-app alert for discount pushes that arrive while the
// app is foregrounded, and (3) syncs the device's location once so nearby
// alerts can be targeted. Everything is wrapped defensively so a missing native
// module (e.g. before a rebuild) or denied permission never crashes the app.
export function NotificationsBridge() {
  const token = useSelector((s: RootState) => s.user.token);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) {
      return;
    }

    let unsubscribeOnMessage: (() => void) | undefined;
    let unsubscribeOnRefresh: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        // Imported lazily so the JS bundle still loads if the native module
        // isn't linked yet (the app keeps working, just without push).
        const messaging = require('@react-native-firebase/messaging').default;

        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === 1 /* AUTHORIZED */ ||
          authStatus === 2 /* PROVISIONAL */;

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
          const title = msg?.notification?.title ?? i18n.t('notifications.newDiscount');
          const body = msg?.notification?.body ?? '';
          Alert.alert(title, body);
          queryClient.invalidateQueries(['notifications']);
        });
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
    };
  }, [token, queryClient]);

  return null;
}
