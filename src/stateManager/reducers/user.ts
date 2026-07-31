import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// Sentinel stored in `browseCityId` for the header dropdown's «کل استان»
// option — means "browse every city's listings, no city filter" (the backend
// simply omits the cityId filter, see useBrowseCity). A real city id can
// never collide with it since those are UUIDs.
export const ALL_CITIES_ID = 'ALL';

export interface userState {
  token?: string;
  refreshToken?: string;
  mobile?: string;
  username?: string;
  avatar?: string;
  // The account's home city — the default city an ad/job/store is posted
  // under (see ads.ts/job.ts createAds/createJob) and the only city changed
  // from the Settings screen. Distinct from `browseCityId` below.
  cityId?: string;
  sex?: string;
  id?: string;
  city?: string;
  // The header dropdown's browse filter — which city's listings to *view*,
  // independent of the home/posting city above. `ALL_CITIES_ID` means «کل
  // استان» (no city filter). Undefined until first set: consumers fall back
  // to the home city (see useBrowseCity), so old installs/fresh logins behave
  // exactly as before until the user opens the dropdown.
  browseCityId?: string;
  browseCityName?: string;
}

const initialState: userState = {
  token: undefined,
  refreshToken: undefined,
  mobile: undefined,
  id: undefined,
  username: '',
  cityId: '',
  sex: '',
  city: '',
  browseCityId: undefined,
  browseCityName: undefined,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<userState>>) => {
      Object.assign(state, action.payload);
    },
    // Clears every account-scoped field, not just the token. The complete-
    // profile screen seeds its photo from `avatar`, and the header/settings
    // read `city`/`id` — leaving any of them behind would show one account's
    // details to whoever signs in next on the same device.
    removeUser: state => {
      state.token = undefined;
      state.refreshToken = undefined;
      state.mobile = '';
      state.username = '';
      state.avatar = undefined;
      state.id = undefined;
      state.sex = '';
      state.cityId = '';
      state.city = '';
      // Don't let one account's browse selection (especially «کل استان») leak
      // into the next account signed in on this device.
      state.browseCityId = undefined;
      state.browseCityName = undefined;
    },
    // Changing the account's home city (Settings/onboarding). The header's
    // browse filter follows the home city here on purpose — picking a new home
    // city also moves what you're browsing to that city; only the header
    // dropdown (setBrowseCity) changes browse *without* touching the home city.
    setUserCity: (
      state,
      action: PayloadAction<{cityId: string; city: string}>,
    ) => {
      state.cityId = action.payload.cityId;
      state.city = action.payload.city;
      state.browseCityId = action.payload.cityId;
      state.browseCityName = action.payload.city;
    },
    // Header dropdown only — changes which city's listings are shown, never
    // the home/posting city. `cityId` is a real city id or `ALL_CITIES_ID`.
    setBrowseCity: (
      state,
      action: PayloadAction<{cityId: string; cityName?: string}>,
    ) => {
      state.browseCityId = action.payload.cityId;
      state.browseCityName = action.payload.cityName;
    },
  },
});

export const {setUser, removeUser, setUserCity, setBrowseCity} =
  userSlice.actions;

export default userSlice.reducer;
