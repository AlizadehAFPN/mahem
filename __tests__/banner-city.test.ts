/**
 * Which city's banners the home screen asks for. Banners are uploaded per
 * city from the admin panel and there is no province-wide set, so this can
 * never resolve to «کل استان» the way a list filter does — but it also must
 * not stay pinned to the account's home city, which is the bug this locks
 * down: picking another city from the header dropdown changed every list on
 * the home screen while the banner strip kept showing the home city's, so a
 * banner uploaded for a city was unreachable unless you moved house to it in
 * Settings.
 *
 * Exercised through the reducer so the state shapes are the real ones
 * setUserCity/setBrowseCity produce.
 */
import userReducer, {
  ALL_CITIES_ID,
  setBrowseCity,
  setUserCity,
} from '../src/stateManager/reducers/user';
import {resolveConcreteCityId} from '../src/hooks/use-browse-city';

const GORGAN = {cityId: 'city-gorgan', city: 'گرگان'};
const JALIN = {cityId: 'city-jalin', city: 'جلین'};

function bannerCityAfter(actions: Array<{type: string; payload?: unknown}>) {
  const user = actions.reduce(
    (state, action) => userReducer(state, action as never),
    userReducer(undefined, {type: '@@INIT'}),
  );
  return resolveConcreteCityId(user.browseCityId, user.cityId);
}

describe('banner city', () => {
  it('follows the header dropdown to a city that is not the home city', () => {
    // The reported bug, exactly: home city گرگان, dropdown moved to جلین.
    expect(
      bannerCityAfter([
        setUserCity(GORGAN),
        setBrowseCity({cityId: JALIN.cityId, cityName: JALIN.city}),
      ]),
    ).toBe(JALIN.cityId);
  });

  it('uses the home city while the dropdown is untouched', () => {
    expect(bannerCityAfter([setUserCity(GORGAN)])).toBe(GORGAN.cityId);
  });

  it('never resolves to «کل استان»', () => {
    const cityId = bannerCityAfter([
      setUserCity(GORGAN),
      setBrowseCity({cityId: ALL_CITIES_ID}),
    ]);
    // Passing the sentinel to /banners would return nothing and empty the
    // strip; the account's own city stands in instead.
    expect(cityId).not.toBe(ALL_CITIES_ID);
    expect(cityId).toBe(GORGAN.cityId);
  });

  it('switches back when the dropdown returns to the home city', () => {
    expect(
      bannerCityAfter([
        setUserCity(GORGAN),
        setBrowseCity({cityId: JALIN.cityId, cityName: JALIN.city}),
        setBrowseCity({cityId: GORGAN.cityId, cityName: GORGAN.city}),
      ]),
    ).toBe(GORGAN.cityId);
  });

  it('is undefined before any city is known, so the query stays disabled', () => {
    // getBanner 400s without a cityId — the home screen gates its query on
    // this being defined rather than firing a request that cannot succeed.
    expect(bannerCityAfter([])).toBeUndefined();
  });
});
