import {useQuery} from 'react-query';
import {getAllAttributeOptionsGrouped} from '../services';

// One shared cache entry for every admin-managed option list (brand, floor,
// education, contractType, ...), instead of a separate query per field/type
// — treated as fresh forever (`staleTime`/`cacheTime: Infinity`) since
// AttributeOptionsSyncBridge is what actually keeps it honest: it primes
// this from the persisted copy on launch and refreshes it in the background
// only when the backend's /attribute-options/version counter has moved.
export const ATTRIBUTE_OPTIONS_QUERY_KEY = ['attribute-options-all'];

export function useAttributeOptions() {
  return useQuery(ATTRIBUTE_OPTIONS_QUERY_KEY, getAllAttributeOptionsGrouped, {
    staleTime: Infinity,
    cacheTime: Infinity,
  });
}
