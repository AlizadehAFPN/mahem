import {useEffect} from 'react';
import {useQueryClient} from 'react-query';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../stateManager';
import {setCitiesCache} from '../../stateManager/reducers/cities';
import {CITIES_QUERY_KEY} from '../../hooks/use-cached-cities';
import {getCities, getCitiesVersion} from '../../services';

// Renders nothing. Same pattern as CategoriesSyncBridge/
// AttributeOptionsSyncBridge: the city list is a fixed set of Golestan-
// province towns that essentially never changes, so instead of every
// CityPicker/city-selection screen fetching it fresh on first open, this:
//   1. primes react-query's cache from the last persisted copy (redux-persist,
//      see stateManager/reducers/cities.ts) so every screen renders
//      instantly with no network wait, even offline;
//   2. checks the backend's cheap /cities/version counter, and only
//      refetches+re-persists the full list if it has moved.
export function CitiesSyncBridge() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const cached = useSelector((s: RootState) => s.cities);

  useEffect(() => {
    if (cached.cities) {
      queryClient.setQueryData(CITIES_QUERY_KEY, {data: cached.cities});
    }

    (async () => {
      try {
        const remoteVersion = await getCitiesVersion();
        const upToDate = cached.version === remoteVersion && cached.cities;
        if (upToDate) {
          return;
        }

        const citiesRes = await getCities();
        queryClient.setQueryData(CITIES_QUERY_KEY, citiesRes);
        dispatch(
          setCitiesCache({version: remoteVersion, cities: citiesRes.data}),
        );
      } catch {
        // Offline/unreachable — keep serving whatever was already
        // cached/persisted; useCities() will retry on its own.
      }
    })();
    // Runs once per app launch, not on every re-render — redux-persist has
    // already rehydrated `cached` by the time this bridge mounts (it's
    // rendered inside PersistGate, see App.tsx).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
