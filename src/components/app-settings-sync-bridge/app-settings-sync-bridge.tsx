import {useEffect} from 'react';
import {useQueryClient} from 'react-query';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../stateManager';
import {setAppSettingsCache} from '../../stateManager/reducers/app-settings';
import {APP_SETTINGS_QUERY_KEY} from '../../hooks/use-cached-app-settings';
import {getAppSettings, getAppSettingsVersion} from '../../services';

// Renders nothing. The app's editable content (درباره ما / تماس با ما text +
// contact links) rarely changes on the backend, so rather than refetching it
// on every app launch/foreground (react-query's default), this:
//   1. primes react-query's cache from the last persisted copy (redux-persist,
//      see stateManager/reducers/app-settings.ts) so the About/Contact screens
//      render instantly with no network wait, even offline;
//   2. checks the backend's cheap /app-settings/version counter once per
//      launch, and only refetches + re-persists the content if it has moved.
// Same architecture as CategoriesSyncBridge.
export function AppSettingsSyncBridge() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const cached = useSelector((s: RootState) => s.appSettings);

  useEffect(() => {
    if (cached.settings) {
      queryClient.setQueryData(APP_SETTINGS_QUERY_KEY, {
        data: cached.settings,
      });
    }

    (async () => {
      try {
        const remoteVersion = await getAppSettingsVersion();
        const upToDate = cached.version === remoteVersion && cached.settings;
        if (upToDate) {
          return;
        }

        const res = await getAppSettings();
        queryClient.setQueryData(APP_SETTINGS_QUERY_KEY, res);
        dispatch(
          setAppSettingsCache({version: remoteVersion, settings: res.data}),
        );
      } catch {
        // Offline/unreachable — keep serving whatever was already
        // cached/persisted; useAppSettings() will retry independently.
      }
    })();
    // Runs once per app launch, not on every re-render — redux-persist has
    // already rehydrated `cached` by the time this bridge mounts (it's
    // rendered inside PersistGate, see App.tsx).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
