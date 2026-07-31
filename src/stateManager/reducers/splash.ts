import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// Persisted (see stateManager/index.ts's persist whitelist). The per-city
// splash image an admin uploaded from the panel has to be on screen from the
// *first* frame, and the moments it's needed — a cold launch and a city
// switch — are exactly the moments there is no time to ask the network:
// fetching the URL and then downloading the image both finish long after the
// splash would have been dismissed.
//
// So the whole table is downloaded once and kept, the same way categories,
// cities and the About/Contact text are (see CategoriesSyncBridge and
// friends): every city's image, not just the current one, because the point
// is to already have the image of a city the user *hasn't switched to yet*.
// `version` is the backend's counter for the set; while it hasn't moved,
// launches do no work beyond one cheap request.
export interface SplashState {
  version?: number;
  // cityId → image URL. A city absent from the map has no splash configured
  // and shows the app's bundled default; there's no need to distinguish that
  // from "never asked" any more, since the set is always fetched whole.
  byCity: Record<string, string>;
}

const initialState: SplashState = {
  version: undefined,
  byCity: {},
};

export const splashSlice = createSlice({
  name: 'splash',
  initialState,
  reducers: {
    // Replaces the whole set rather than merging: a city whose splash the
    // admin deleted has to disappear from the cache, and a merge would leave
    // its old image showing forever.
    setSplashCache: (
      state,
      action: PayloadAction<{version: number; byCity: Record<string, string>}>,
    ) => {
      state.version = action.payload.version;
      state.byCity = action.payload.byCity;
    },
  },
});

export const {setSplashCache} = splashSlice.actions;

export default splashSlice.reducer;
