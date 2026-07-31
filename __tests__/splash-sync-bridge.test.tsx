/**
 * The splash set is reference data, like the city list or the About/Contact
 * text: an admin edits it rarely, so the app keeps it and only asks whether
 * anything changed. What makes it different from the others is that holding
 * the *data* isn't enough — the image file has to be on disk before the user
 * reaches the city, because the screen that needs it is drawn before anything
 * could be downloaded. So every city is prefetched, not just the current one.
 */
import React from 'react';
import {Image} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import {Provider} from 'react-redux';
import {combineReducers, configureStore} from '@reduxjs/toolkit';
import userReducer, {setUserCity} from '../src/stateManager/reducers/user';
import splashReducer, {
  setSplashCache,
} from '../src/stateManager/reducers/splash';
import {SplashSyncBridge} from '../src/components/splash-sync-bridge/splash-sync-bridge';

// `mock`-prefixed so jest's factory allows referencing them — the whole
// services barrel is stubbed because importing it for real pulls in the axios
// instance and the redux store it reads tokens from.
const mockGetSplashScreens = jest.fn();
const mockGetSplashScreensVersion = jest.fn();

jest.mock('../src/services', () => ({
  getSplashScreens: () => mockGetSplashScreens(),
  getSplashScreensVersion: () => mockGetSplashScreensVersion(),
}));

const GORGAN = {cityId: 'city-gorgan', city: 'گرگان'};
const GONBAD = {cityId: 'city-gonbad', city: 'گنبد'};

const REMOTE = {
  [GORGAN.cityId]: 'http://x/gorgan.png',
  [GONBAD.cityId]: 'http://x/gonbad.png',
};

function makeStore() {
  return configureStore({
    reducer: combineReducers({user: userReducer, splash: splashReducer}),
  });
}

// Lets the bridge's async chain run to completion between assertions.
async function mount(store: ReturnType<typeof makeStore>) {
  await act(async () => {
    renderer.create(
      <Provider store={store}>
        <SplashSyncBridge />
      </Provider>,
    );
  });
}

let prefetch: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  prefetch = jest.spyOn(Image, 'prefetch').mockResolvedValue(true);
});

afterEach(() => prefetch.mockRestore());

describe('SplashSyncBridge', () => {
  it('downloads every city on a fresh install and caches it with its version', async () => {
    mockGetSplashScreensVersion.mockResolvedValue(4);
    mockGetSplashScreens.mockResolvedValue(REMOTE);

    const store = makeStore();
    store.dispatch(setUserCity(GORGAN));
    await mount(store);

    expect(store.getState().splash).toEqual({version: 4, byCity: REMOTE});
    // Gonbad is fetched too, even though the user is in Gorgan — that is the
    // whole point: switching city later must not need a download.
    expect(prefetch.mock.calls.map(c => c[0]).sort()).toEqual(
      Object.values(REMOTE).sort(),
    );
  });

  it("puts the user's own city at the front of the prefetch queue", async () => {
    mockGetSplashScreensVersion.mockResolvedValue(4);
    mockGetSplashScreens.mockResolvedValue(REMOTE);

    const store = makeStore();
    store.dispatch(setUserCity(GONBAD));
    await mount(store);

    // Otherwise a fresh install waits for every other city's photo before the
    // one it is about to show.
    expect(prefetch.mock.calls[0][0]).toBe(REMOTE[GONBAD.cityId]);
  });

  it('skips the download entirely while the version has not moved', async () => {
    mockGetSplashScreensVersion.mockResolvedValue(4);

    const store = makeStore();
    store.dispatch(setUserCity(GORGAN));
    store.dispatch(setSplashCache({version: 4, byCity: REMOTE}));
    await mount(store);

    expect(mockGetSplashScreens).not.toHaveBeenCalled();
    // The files are still re-warmed: the OS evicts cached images on its own,
    // and an evicted splash is a default-image launch for a city we have the
    // URL of.
    expect(prefetch).toHaveBeenCalledTimes(2);
  });

  it('re-downloads and replaces the set when the version moves', async () => {
    mockGetSplashScreensVersion.mockResolvedValue(5);
    mockGetSplashScreens.mockResolvedValue({
      [GORGAN.cityId]: 'http://x/gorgan-new.png',
    });

    const store = makeStore();
    store.dispatch(setUserCity(GORGAN));
    store.dispatch(setSplashCache({version: 4, byCity: REMOTE}));
    await mount(store);

    // Gonbad's splash was deleted in the panel, so it has to disappear here
    // rather than linger from the previous cache.
    expect(store.getState().splash).toEqual({
      version: 5,
      byCity: {[GORGAN.cityId]: 'http://x/gorgan-new.png'},
    });
  });

  it('keeps serving the cached set when the network is unreachable', async () => {
    mockGetSplashScreensVersion.mockRejectedValue(new Error('offline'));

    const store = makeStore();
    store.dispatch(setUserCity(GORGAN));
    store.dispatch(setSplashCache({version: 4, byCity: REMOTE}));
    await mount(store);

    // Nothing is dropped on a failed check — an offline launch in a city
    // whose image is already on disk still shows it.
    expect(store.getState().splash).toEqual({version: 4, byCity: REMOTE});
    expect(prefetch).toHaveBeenCalled();
  });
});
