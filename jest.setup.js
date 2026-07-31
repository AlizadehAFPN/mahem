/* eslint-env jest */

// NetInfo's native module isn't present under Jest, and its JS entry throws on
// import when it's missing. The package ships a mock for exactly this; it is a
// plain module export, so it has to be wired up with jest.mock rather than
// loaded as a setup file.
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

// Same for AsyncStorage, which the redux store (and so anything importing the
// axios config) pulls in.
//
// A plain in-memory implementation rather than the mock the package ships.
// That one builds its methods out of jest.fn(), which return `undefined` once
// the module registry has been torn down — and redux-persist writes on a
// timer, so App.test.tsx's persistor fired one *after* the run finished and
// took the Node process down on
// `storage.setItem(...).catch is not a function`. Real promises, always.
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  return {
    __esModule: true,
    default: {
      getItem: key => Promise.resolve(store.has(key) ? store.get(key) : null),
      setItem: (key, value) => {
        store.set(key, value);
        return Promise.resolve();
      },
      removeItem: key => {
        store.delete(key);
        return Promise.resolve();
      },
      mergeItem: (key, value) => {
        store.set(key, value);
        return Promise.resolve();
      },
      clear: () => {
        store.clear();
        return Promise.resolve();
      },
      getAllKeys: () => Promise.resolve([...store.keys()]),
      multiGet: keys =>
        Promise.resolve(keys.map(key => [key, store.get(key) ?? null])),
      multiSet: pairs => {
        pairs.forEach(([key, value]) => store.set(key, value));
        return Promise.resolve();
      },
      multiRemove: keys => {
        keys.forEach(key => store.delete(key));
        return Promise.resolve();
      },
    },
  };
});

// The remaining native modules App reaches, none of which ship a jest mock.
// They throw "doesn't seem to be linked" at *import* time — geolocation builds
// a NativeEventEmitter as a module side effect — so a stub has to exist before
// the module graph is walked, not just before a call.
//
// These are the modules that App.test.tsx's whole-tree render touches. A
// component test that exercises one of them should mock it with the behaviour
// it needs; this is only the floor that keeps `import App` from throwing.
jest.mock('@react-native-community/geolocation', () => ({
  __esModule: true,
  default: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
    stopObserving: jest.fn(),
    setRNConfiguration: jest.fn(),
    requestAuthorization: jest.fn(),
  },
}));

// Sentry's native module isn't linked under Jest, and index.js calls init()
// at import time. Stubbed rather than left to no-op on its own, so a test can
// never send a real event to the production project.
jest.mock('@sentry/react-native', () => ({
  __esModule: true,
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  addBreadcrumb: jest.fn(),
  flush: jest.fn(() => Promise.resolve(true)),
}));

// expo-constants warns on import when its native module is absent, which under
// Jest it always is — @expo/vector-icons pulls it in through expo-font ->
// expo-asset. Nothing under test reads it; the stub just keeps a guaranteed
// warning out of every run's output, where it would train people to ignore it.
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {expoConfig: null, manifest: null, manifest2: null},
}));

jest.mock('react-native-maps', () => {
  const React = require('react');
  // Rendered, not just constructed — the discount map and the location picker
  // put a <MapView> in the tree — so these have to be real components.
  const Stub = ({children}) => React.createElement('MapView', null, children);
  return {
    __esModule: true,
    default: Stub,
    Marker: Stub,
    Callout: Stub,
    Polyline: Stub,
    Circle: Stub,
    PROVIDER_GOOGLE: 'google',
    PROVIDER_DEFAULT: 'default',
  };
});
