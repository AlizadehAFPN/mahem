/**
 * Which city's splash the app shows. The app carries two city values that both
 * change independently — the account's home/posting city and the header
 * dropdown's browse city — and the splash has to pick between them the same
 * way every time, including for the «کل استان» option, which is a filter mode
 * rather than a city and so has no splash of its own.
 *
 * The resolution is exercised through the reducer rather than the hook so the
 * two stay honest about each other: these are the exact state shapes
 * setUserCity/setBrowseCity produce.
 */
import userReducer, {
  ALL_CITIES_ID,
  removeUser,
  setBrowseCity,
  setUserCity,
} from '../src/stateManager/reducers/user';
import splashReducer, {
  setSplashCache,
} from '../src/stateManager/reducers/splash';
import {resolveConcreteCityId} from '../src/hooks/use-browse-city';

const GORGAN = {cityId: 'city-gorgan', city: 'گرگان'};
const GONBAD = {cityId: 'city-gonbad', city: 'گنبد'};

function userStateAfter(actions: Array<{type: string; payload?: unknown}>) {
  return actions.reduce(
    (state, action) => userReducer(state, action as never),
    userReducer(undefined, {type: '@@INIT'}),
  );
}

describe('resolveConcreteCityId', () => {
  it('uses the home city before the dropdown has ever been touched', () => {
    const user = userStateAfter([setUserCity(GORGAN)]);
    expect(resolveConcreteCityId(user.browseCityId, user.cityId)).toBe(
      GORGAN.cityId,
    );
  });

  it('follows the header dropdown to another city', () => {
    const user = userStateAfter([
      setUserCity(GORGAN),
      setBrowseCity({cityId: GONBAD.cityId, cityName: GONBAD.city}),
    ]);
    // The city the user is browsing right now wins over their home city —
    // this is the case the whole feature exists for.
    expect(resolveConcreteCityId(user.browseCityId, user.cityId)).toBe(
      GONBAD.cityId,
    );
  });

  it('falls back to the home city for «کل استان»', () => {
    const user = userStateAfter([
      setUserCity(GORGAN),
      setBrowseCity({cityId: ALL_CITIES_ID}),
    ]);
    // ALL_CITIES_ID is a filter mode, not a city: it can never be looked up in
    // the splash cache, so the account's own city stands in.
    expect(resolveConcreteCityId(user.browseCityId, user.cityId)).toBe(
      GORGAN.cityId,
    );
  });

  it('has no city at all on a fresh install or after signing out', () => {
    const fresh = userReducer(undefined, {type: '@@INIT'});
    expect(
      resolveConcreteCityId(fresh.browseCityId, fresh.cityId),
    ).toBeUndefined();

    // removeUser leaves cityId as '' rather than undefined — an empty string
    // must not be treated as a lookup key.
    const signedOut = userStateAfter([setUserCity(GORGAN), removeUser()]);
    expect(
      resolveConcreteCityId(signedOut.browseCityId, signedOut.cityId),
    ).toBeUndefined();
  });

  it('moves with the home city when it is changed from Settings', () => {
    // setUserCity deliberately drags the browse selection along with it, so
    // changing home city in Settings must change the splash too.
    const user = userStateAfter([
      setUserCity(GORGAN),
      setBrowseCity({cityId: ALL_CITIES_ID}),
      setUserCity(GONBAD),
    ]);
    expect(resolveConcreteCityId(user.browseCityId, user.cityId)).toBe(
      GONBAD.cityId,
    );
  });
});

describe('splash cache', () => {
  it('starts with nothing cached, so a fresh install shows the default', () => {
    const state = splashReducer(undefined, {type: '@@INIT'});
    expect(state.version).toBeUndefined();
    expect(state.byCity).toEqual({});
  });

  it('stores every city at once alongside the version it came from', () => {
    const state = splashReducer(
      undefined,
      setSplashCache({
        version: 7,
        byCity: {
          [GORGAN.cityId]: 'http://x/gorgan.png',
          [GONBAD.cityId]: 'http://x/gonbad.png',
        },
      }),
    );

    // The version is what lets the next launch skip the download entirely,
    // so it has to be stored with the data it describes, not separately.
    expect(state.version).toBe(7);
    expect(state.byCity[GONBAD.cityId]).toBe('http://x/gonbad.png');
  });

  it('replaces the whole set rather than merging into it', () => {
    let state = splashReducer(
      undefined,
      setSplashCache({
        version: 7,
        byCity: {
          [GORGAN.cityId]: 'http://x/gorgan.png',
          [GONBAD.cityId]: 'http://x/gonbad.png',
        },
      }),
    );
    state = splashReducer(
      state,
      setSplashCache({
        version: 8,
        byCity: {[GORGAN.cityId]: 'http://x/gorgan-new.png'},
      }),
    );

    // An admin deleting Gonbad's splash makes it vanish from the response; a
    // merge would leave its old image on screen there forever.
    expect(state.byCity).toEqual({[GORGAN.cityId]: 'http://x/gorgan-new.png'});
    expect(state.version).toBe(8);
  });
});
