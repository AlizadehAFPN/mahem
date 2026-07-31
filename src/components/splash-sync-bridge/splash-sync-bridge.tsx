import {useEffect} from 'react';
import {Image} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../stateManager';
import {setSplashCache} from '../../stateManager/reducers/splash';
import {useSplashCityId} from '../../hooks/use-splash';
import {getSplashScreens, getSplashScreensVersion} from '../../services';

// Renders nothing. Same pattern as CitiesSyncBridge/AppSettingsSyncBridge:
// the splash set changes only when an admin edits it, so instead of asking
// per city on demand this checks the backend's cheap /splash-screens/version
// counter once per launch and re-downloads the whole set only if it moved.
//
// The difference from the other bridges is what "cached" has to mean here.
// For categories it's enough to have the data; for a splash the image *file*
// has to already be on disk, because the screen it's needed on is shown
// before anything could be downloaded. So every city's image is prefetched,
// not just the current one — the whole point is to be ready for a city the
// user hasn't switched to yet.
export function SplashSyncBridge() {
  const dispatch = useDispatch();
  const cached = useSelector((s: RootState) => s.splash);
  const cityId = useSplashCityId();

  useEffect(() => {
    (async () => {
      try {
        const remoteVersion = await getSplashScreensVersion();
        const upToDate = cached.version === remoteVersion;

        // Even when nothing changed the files still get re-warmed: the OS can
        // evict images from the disk cache at any time, and an evicted splash
        // is a default-image launch for a city we already know the URL of.
        // Re-prefetching a file that is still cached costs nothing.
        const byCity = upToDate ? cached.byCity : await getSplashScreens();

        if (!upToDate) {
          dispatch(setSplashCache({version: remoteVersion, byCity}));
        }

        prefetchAll(byCity, cityId);
      } catch {
        // Offline/unreachable — keep serving whatever was already persisted.
        // A city whose image is cached still shows it; the rest fall back to
        // the bundled default until a launch that reaches the network.
        prefetchAll(cached.byCity, cityId);
      }
    })();
    // Once per app launch, not on every city change — the whole set is
    // already local, so switching city needs no request at all. redux-persist
    // has rehydrated `cached` by the time this mounts (it renders inside
    // PersistGate, see App.tsx).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// The city being shown right now goes first and is awaited; the others follow
// without blocking it. On a fresh install this is the difference between the
// user's own city appearing on the second launch and waiting behind every
// other city's download.
async function prefetchAll(
  byCity: Record<string, string>,
  currentCityId?: string,
) {
  const current = currentCityId ? byCity[currentCityId] : undefined;
  if (current) {
    await Image.prefetch(current).catch(() => {});
  }

  for (const [id, url] of Object.entries(byCity)) {
    if (id === currentCityId) {
      continue;
    }
    // Sequential on purpose — these are full-screen photos and this runs
    // while the user is starting to use the app; firing them all at once
    // would compete with the requests the first screen actually needs.
    await Image.prefetch(url).catch(() => {});
  }
}
