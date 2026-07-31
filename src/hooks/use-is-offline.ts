import {useEffect, useRef, useState} from 'react';
import {AppState} from 'react-native';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {domainName} from '../services/axios-config';

// Public, returns a 12-byte string — the cheapest "can this app work?" probe
// there is. Reaching the backend is the only definition of online that matters
// here, so it stands in for a generic internet check everywhere below.
const REACHABILITY_URL = `${domainName}/api`;

// Runs once at import time: NetInfo reads its configuration when the first
// listener subscribes, so it has to be in place before any of them do.
//
// This only affects iOS — `configure()` forwards to the native side on iOS
// alone; see the Android note on probeApi() below. There, the defaults probe
// https://clients3.google.com/generate_204 and expect a 204, and that endpoint
// is not dependably reachable from Iran, so a perfectly good connection would
// report `isInternetReachable: false` forever and the offline screen would
// never come off.
NetInfo.configure({
  reachabilityUrl: REACHABILITY_URL,
  reachabilityMethod: 'GET',
  reachabilityTest: response => Promise.resolve(response.status === 200),
  useNativeReachability: false,
});

/**
 * Asks the backend directly whether it can be reached.
 *
 * Needed because on Android none of the configuration above applies:
 * `isInternetReachable` there is always the OS's own NET_CAPABILITY_VALIDATED
 * flag, which Android computes by probing Google's captive-portal servers. On
 * networks where those are blocked, Android marks a perfectly working
 * connection as unvalidated — the familiar "connected, no internet" — and
 * trusting that flag alone would pin the whole app behind the offline screen.
 * So whenever the platform claims the internet is unreachable, ask our own
 * server before believing it.
 */
async function probeApi(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(REACHABILITY_URL, {signal: controller.signal});
    return response.status === 200;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Offline means the app cannot reach its backend: either the device has no
 * connection at all (`isConnected`), or it has one that doesn't actually carry
 * traffic — a captive portal/login-page wifi, data with no quota left, our
 * server unreachable.
 */
export function useIsOffline() {
  const [isOffline, setIsOffline] = useState(false);
  // Connectivity can change again while a probe is in flight; only the newest
  // one is allowed to have an opinion when it comes back.
  const latestCheck = useRef(0);

  useEffect(() => {
    const handleState = async (state: NetInfoState) => {
      const check = ++latestCheck.current;

      // No network interface at all: airplane mode, wifi and data both off, no
      // signal. Nothing to double-check.
      if (state.isConnected === false) {
        setIsOffline(true);
        return;
      }
      // null means the reachability answer isn't in yet — NetInfo reports it
      // that way on the first event and right after every transition. Hold the
      // previous answer instead of guessing, so reconnecting doesn't let the
      // app through before anything is confirmed, and a launch with a working
      // connection doesn't flash the offline screen while it's being checked.
      if (state.isInternetReachable === null) {
        return;
      }
      if (state.isInternetReachable) {
        setIsOffline(false);
        return;
      }

      const reachable = await probeApi();
      if (check === latestCheck.current) {
        setIsOffline(!reachable);
      }
    };

    const unsubscribe = NetInfo.addEventListener(handleState);

    // Returning from the background is exactly when the connection is most
    // likely to have changed unnoticed (walked out of wifi range, airplane mode
    // toggled). Force a fresh reading rather than waiting for the next event.
    const appStateSubscription = AppState.addEventListener('change', status => {
      if (status === 'active') {
        NetInfo.refresh();
      }
    });

    return () => {
      unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  return isOffline;
}
