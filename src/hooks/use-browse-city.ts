import {useSelector} from 'react-redux';
import {RootState} from '../stateManager';
import {ALL_CITIES_ID} from '../stateManager/reducers/user';

// The header dropdown's browse filter, resolved for consumers. Separate from
// the account's home/posting city (user.cityId, changed only in Settings):
// this is which city's listings the user is currently *viewing*.
//
//   • isAllCities  — the «کل استان» option is selected (show every city).
//   • cityIdParam  — the value to pass to backend list endpoints; `undefined`
//                    in «کل استان» mode so the cityId filter is simply omitted
//                    (the backend treats a missing cityId as "all cities").
//   • cityKey      — an always-defined, stable segment for react-query keys
//                    (so switching browse city re-fetches instead of a full
//                    app remount, which is now reserved for home-city changes).
//   • cityName     — the city label to display; `undefined` in «کل استان» mode
//                    (callers render the translated «کل استان» label instead).
//   • concreteCityId — see resolveConcreteCityId below.
//
// The one city id that is always a real city, for the content that is *about*
// a city rather than filtered by one: the launch splash and the home banners.
// Those have no «کل استان» edition — the admin panel uploads them per city and
// there is no province-wide set — so «کل استان» resolves to the account's own
// city instead of to "no filter", which for a list means everything but for a
// banner would mean nothing at all.
//
// Note that both inputs can be `''` as well as undefined — removeUser blanks
// cityId rather than dropping it — and an empty string is not a lookup key.
export function resolveConcreteCityId(
  browseCityId?: string,
  homeCityId?: string,
): string | undefined {
  const cityId =
    browseCityId && browseCityId !== ALL_CITIES_ID ? browseCityId : homeCityId;

  return cityId || undefined;
}

export function useBrowseCity() {
  const browseCityId = useSelector((s: RootState) => s.user.browseCityId);
  const browseCityName = useSelector((s: RootState) => s.user.browseCityName);
  const homeCityId = useSelector((s: RootState) => s.user.cityId);
  const homeCityName = useSelector((s: RootState) => s.user.city);

  // Fall back to the home city until the dropdown has been touched — old
  // installs and fresh logins have no browse selection persisted yet, and
  // should behave exactly as before (scoped to the account's city).
  const effectiveId = browseCityId ?? homeCityId;
  const isAllCities = effectiveId === ALL_CITIES_ID;

  return {
    isAllCities,
    cityIdParam: isAllCities ? undefined : effectiveId || undefined,
    cityKey: effectiveId || 'none',
    cityName: isAllCities ? undefined : browseCityName ?? homeCityName,
    concreteCityId: resolveConcreteCityId(browseCityId, homeCityId),
  };
}
