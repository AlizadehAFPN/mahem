import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import i18n from '../i18n';

export interface Coords {
  lat: number;
  lng: number;
}

// Asks for foreground location permission. On iOS the native prompt is driven
// by Geolocation itself (backed by the Info.plist usage string); on Android we
// request ACCESS_FINE_LOCATION explicitly. Returns whether permission is granted.
export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: i18n.t('location.permissionTitle'),
          message: i18n.t('location.permissionMessage'),
          buttonPositive: i18n.t('common.ok'),
          buttonNegative: i18n.t('common.cancel'),
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }
  // iOS: authorization is requested implicitly on first getCurrentPosition;
  // ask upfront so the prompt appears before we need a fix.
  return new Promise(resolve => {
    try {
      Geolocation.requestAuthorization(
        () => resolve(true),
        () => resolve(false),
      );
    } catch {
      resolve(true);
    }
  });
}

async function getCurrentPositionUnsafe(): Promise<Coords> {
  if (Platform.OS === 'android') {
    const granted = await requestLocationPermission();
    if (!granted) {
      throw new Error('LOCATION_PERMISSION_DENIED');
    }
  } else {
    // iOS: fire the authorization request so the system prompt appears on
    // first use, but DON'T await its delegate callback. That callback only
    // fires on an authorization *change*, so on every session after the
    // user's first decision it never resolves — awaiting it (the old code)
    // hung here forever until the outer 20s timeout rejected, so the screen
    // showed a location error even though permission was granted and a fix
    // was readily available. Since skipPermissionRequests defaults to false,
    // getCurrentPosition below also triggers the prompt when needed and
    // reports denial through its own error callback, so gating on
    // requestAuthorization is unnecessary.
    try {
      Geolocation.requestAuthorization(
        () => {},
        () => {},
      );
    } catch {}
  }
  return new Promise<Coords>((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos => resolve({lat: pos.coords.latitude, lng: pos.coords.longitude}),
      err => reject(err),
      {enableHighAccuracy: false, timeout: 15000, maximumAge: 60000},
    );
  });
}

// Resolves the device's current position, requesting permission first. Rejects
// if permission is denied or the fix times out, so callers can fall back to
// the city center or a default region.
//
// getCurrentPositionUnsafe already avoids awaiting iOS's requestAuthorization
// delegate (which never fires on sessions after the user's first decision, so
// awaiting it hung forever). This hard timeout stays as a final safety net so
// callers always get a resolve/reject even if the native getCurrentPosition
// itself stalls without invoking either callback.
export function getCurrentPosition(): Promise<Coords> {
  return new Promise<Coords>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('LOCATION_TIMEOUT'));
      }
    }, 20000);
    getCurrentPositionUnsafe().then(
      coords => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(coords);
        }
      },
      err => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(err);
        }
      },
    );
  });
}
