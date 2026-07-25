import {useQuery} from 'react-query';
import {getCities} from '../services';

// The city list rarely changes (a fixed set of Golestan-province towns) —
// treated as fresh forever (`staleTime`/`cacheTime: Infinity`) since
// CitiesSyncBridge is what actually keeps it honest: it primes this from the
// persisted copy on launch and refreshes it in the background only when the
// backend's /cities/version counter has moved. Replaces the previous
// per-screen `useQuery(['cities'], getCities)` calls in CityPicker,
// CitySelectionScreen, and CitySelectionMenu.
export const CITIES_QUERY_KEY = ['cities'];

export function useCities() {
  return useQuery(CITIES_QUERY_KEY, getCities, {
    staleTime: Infinity,
    cacheTime: Infinity,
  });
}
