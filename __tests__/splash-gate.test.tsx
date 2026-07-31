/**
 * The splash has to be *seen*. A warm launch can rehydrate redux and validate
 * the session in well under a fifth of a second, so without a guaranteed
 * floor an admin would upload their city's image and the app would flash past
 * it — the feature would be invisible in exactly the case it's most often
 * tested in. And because a city switch happens with the app already mounted
 * and nothing navigating, the same splash has to be raised from outside the
 * navigator too.
 *
 * These are the two behaviours worth pinning down, plus the transitions that
 * must stay silent: signing in and out also move the city value, and a splash
 * in the middle of those flows would be an interruption.
 */
import React from 'react';
import {Text} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from '@reduxjs/toolkit';
import userReducer, {
  ALL_CITIES_ID,
  removeUser,
  setBrowseCity,
  setUserCity,
} from '../src/stateManager/reducers/user';
import splashReducer, {
  setSplashCache,
} from '../src/stateManager/reducers/splash';
import {SplashGate} from '../src/components/splash-gate/splash-gate';

// The overlay renders the real SplashScreen, which pulls in Screen ->
// safe-area insets and a bundled png. Neither is what's under test here; a
// marker keeps the assertions about *when* the splash is up and which image
// it was handed.
jest.mock('../src/screens/splash/splash-screen', () => ({
  SplashScreen: ({imageUrl}: {imageUrl?: string}) =>
    require('react').createElement(require('react-native').Text, {
      testID: 'splash',
      accessibilityLabel: imageUrl ?? 'default',
    }),
}));

const GORGAN = {cityId: 'city-gorgan', city: 'گرگان'};
const GONBAD = {cityId: 'city-gonbad', city: 'گنبد'};

function makeStore() {
  return configureStore({
    reducer: combineReducers({user: userReducer, splash: splashReducer}),
  });
}

function render(store: ReturnType<typeof makeStore>) {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <Provider store={store}>
        <SplashGate>
          <Text testID="app">app</Text>
        </SplashGate>
      </Provider>,
    );
  });
  return tree;
}

// Host instances only — findAll otherwise matches the composite element and
// the host node it renders to, counting one on-screen view twice.
function byTestID(tree: renderer.ReactTestRenderer, testID: string) {
  return tree.root.findAll(
    n => typeof n.type === 'string' && n.props?.testID === testID,
  );
}

function splashNode(tree: renderer.ReactTestRenderer) {
  return byTestID(tree, 'splash')[0];
}

function isSplashUp(tree: renderer.ReactTestRenderer) {
  return byTestID(tree, 'splash').length > 0;
}

function advance(ms: number) {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
}

function dispatch(store: ReturnType<typeof makeStore>, action: unknown) {
  act(() => {
    store.dispatch(action as never);
  });
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('SplashGate', () => {
  it('holds the splash for two seconds on launch, then reveals the app', () => {
    const store = makeStore();
    dispatch(store, setUserCity(GORGAN));
    dispatch(
      store,
      setSplashCache({
        version: 1,
        byCity: {[GORGAN.cityId]: 'http://x/gorgan.png'},
      }),
    );

    const tree = render(store);
    expect(isSplashUp(tree)).toBe(true);
    // The persisted image is used from the very first frame — no fetch, no
    // loading state. That is the whole point of caching it per city.
    expect(splashNode(tree).props.accessibilityLabel).toBe(
      'http://x/gorgan.png',
    );

    // Still up just short of the floor, even though nothing is loading.
    advance(1999);
    expect(isSplashUp(tree)).toBe(true);

    advance(1);
    expect(isSplashUp(tree)).toBe(false);
    // The app was mounted underneath the whole time — the splash covers it
    // rather than replacing it, so no screen remounts when it lifts.
    expect(byTestID(tree, 'app').length).toBe(1);
  });

  it('falls back to the bundled default for a city with no splash', () => {
    const store = makeStore();
    dispatch(store, setUserCity(GORGAN));
    dispatch(store, setSplashCache({version: 1, byCity: {}}));

    const tree = render(store);
    expect(splashNode(tree).props.accessibilityLabel).toBe('default');
  });

  it('does not swap image mid-splash when the cache fills in behind it', () => {
    const store = makeStore();
    dispatch(store, setUserCity(GORGAN));

    // Nothing cached — the first launch after an install, where the bridge is
    // still downloading the set.
    const tree = render(store);
    expect(splashNode(tree).props.accessibilityLabel).toBe('default');

    advance(800);
    dispatch(
      store,
      setSplashCache({
        version: 1,
        byCity: {[GORGAN.cityId]: 'http://x/gorgan.png'},
      }),
    );

    // The arriving image must NOT replace the default now: a visible swap
    // partway through the splash is exactly the flicker this design exists to
    // remove. It shows from the next launch, like all other cached data.
    expect(splashNode(tree).props.accessibilityLabel).toBe('default');

    advance(1200);
    expect(isSplashUp(tree)).toBe(false);
  });

  it('shows the newly cached image on the next launch', () => {
    const store = makeStore();
    dispatch(store, setUserCity(GORGAN));
    dispatch(
      store,
      setSplashCache({
        version: 1,
        byCity: {[GORGAN.cityId]: 'http://x/gorgan.png'},
      }),
    );

    // Same store, freshly mounted — a relaunch with the cache already warm.
    const tree = render(store);
    expect(splashNode(tree).props.accessibilityLabel).toBe(
      'http://x/gorgan.png',
    );
  });

  it('raises the splash again when the user switches city', () => {
    const store = makeStore();
    dispatch(store, setUserCity(GORGAN));
    dispatch(
      store,
      setSplashCache({
        version: 1,
        byCity: {[GONBAD.cityId]: 'http://x/gonbad.png'},
      }),
    );

    const tree = render(store);
    advance(2000);
    expect(isSplashUp(tree)).toBe(false);

    dispatch(
      store,
      setBrowseCity({cityId: GONBAD.cityId, cityName: GONBAD.city}),
    );
    expect(isSplashUp(tree)).toBe(true);
    expect(splashNode(tree).props.accessibilityLabel).toBe(
      'http://x/gonbad.png',
    );

    advance(2000);
    expect(isSplashUp(tree)).toBe(false);
  });

  it('restarts the two seconds when a second switch interrupts the first', () => {
    const store = makeStore();
    dispatch(store, setUserCity(GORGAN));
    const tree = render(store);
    advance(2000);

    dispatch(store, setBrowseCity({cityId: GONBAD.cityId}));
    advance(1500);
    // A rapid second switch must not inherit the first one's deadline, or the
    // new city's splash would be dismissed half a second after appearing.
    dispatch(store, setBrowseCity({cityId: GORGAN.cityId}));
    advance(1500);
    expect(isSplashUp(tree)).toBe(true);

    advance(500);
    expect(isSplashUp(tree)).toBe(false);
  });

  it('stays down for «کل استان», which resolves to the same city', () => {
    const store = makeStore();
    dispatch(store, setUserCity(GORGAN));
    const tree = render(store);
    advance(2000);

    // The dropdown moved, but the splash city did not — «کل استان» falls back
    // to the home city, so re-showing the identical image would be a flash
    // for no reason.
    dispatch(store, setBrowseCity({cityId: ALL_CITIES_ID}));
    expect(isSplashUp(tree)).toBe(false);
  });

  it('stays down through signing out and back in', () => {
    const store = makeStore();
    dispatch(store, setUserCity(GORGAN));
    const tree = render(store);
    advance(2000);

    // Signing out clears the city; the sign-in flow then sets a new one.
    // Neither is the user "changing city", and a splash mid-flow would read
    // as the app restarting.
    dispatch(store, removeUser());
    expect(isSplashUp(tree)).toBe(false);

    dispatch(store, setUserCity(GONBAD));
    expect(isSplashUp(tree)).toBe(false);
  });
});
