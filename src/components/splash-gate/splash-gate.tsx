import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {StyleSheet, View} from 'react-native';
import {SplashScreen} from '../../screens/splash/splash-screen';
import {useSplashCityId, useSplashImageUrl} from '../../hooks/use-splash';

// How long the splash is guaranteed to stay on screen. Without a floor the
// whole feature is invisible on a warm launch: rehydration plus checkUser()
// can finish in well under 200ms, so the city's image would be replaced by
// the app before it had faded in — an admin would upload a splash and never
// see it. The same duration is reused for a city switch so both entry points
// feel like one behaviour.
const SPLASH_DURATION_MS = 2000;

// Holds the splash over the whole app rather than living inside one screen.
//
// The two moments a city splash has to appear are structurally different:
// a cold launch, where the navigator underneath is still deciding which stack
// to render, and a city switch, where the app is already up and no navigation
// happens at all. A screen can't cover both — the first has no mounted screen
// yet and the second never unmounts one. An overlay above the navigator does,
// and it also means neither RootNavigator nor the header dropdown has to know
// anything about splash timing.
//
// RootNavigator keeps rendering its own splash while it validates the session
// (see CheckingSessionSplash): the two are the same component showing the same
// image, so a session check that outlives this overlay is seamless — the
// overlay lifts and the identical screen is still underneath.
export function SplashGate({children}: {children: ReactNode}) {
  const imageUrl = useSplashImageUrl();
  const cityId = useSplashCityId();
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Always the value from the latest render, so `show` — which is created
  // once — still captures the current city's image. Declared before the
  // effects that call show(), because effects run in declaration order and
  // this has to be up to date by the time they do.
  const latestImageUrl = useRef(imageUrl);
  useEffect(() => {
    latestImageUrl.current = imageUrl;
  }, [imageUrl]);

  // The image is captured when the splash goes up and held until it comes
  // down, rather than tracking the cache live. On the first launch after an
  // install the set hasn't been downloaded yet, and SplashSyncBridge finishes
  // partway through this very splash — reading the cache live would put the
  // default on screen and then visibly swap to the city's image a second
  // later, which is the one thing this screen must never do. Holding what it
  // started with means the city's image simply arrives on the next launch,
  // exactly like every other piece of cached reference data.
  const [shown, setShown] = useState<{imageUrl?: string} | null>(() => ({
    imageUrl,
  }));

  // One timer, restarted on each showing. Launch and city-switch can overlap
  // (a switch during the launch window), and two independent timers would let
  // the earlier one dismiss a splash the later one had just raised.
  const show = useCallback(() => {
    setShown({imageUrl: latestImageUrl.current});
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShown(null), SPLASH_DURATION_MS);
  }, []);

  useEffect(() => {
    show();
    return () => clearTimeout(timer.current);
  }, [show]);

  const previousCityId = useRef(cityId);
  useEffect(() => {
    const previous = previousCityId.current;
    previousCityId.current = cityId;

    // Only a move between two real cities counts as "the user changed city".
    // Signing in and out also move this value (removeUser clears it, then
    // onboarding sets it), and a splash in the middle of those flows would be
    // an interruption, not branding — so transitions to or from "no city" are
    // deliberately silent. The launch effect above already covers the first
    // render, which is why an unchanged value is ignored too.
    if (!previous || !cityId || previous === cityId) {
      return;
    }
    show();
  }, [cityId, show]);

  return (
    <View style={styles.container}>
      {children}
      {shown && (
        // `box-only` makes this view itself the hit target and none of its
        // children, so every touch is swallowed here. Without it a tap during
        // a city switch — when the app underneath is fully mounted and
        // interactive, unlike at launch — would land on the outgoing city's
        // screen through what looks like a solid image.
        <View style={StyleSheet.absoluteFill} pointerEvents="box-only">
          <SplashScreen imageUrl={shown.imageUrl} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
