import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// Persisted (see stateManager/index.ts's persist whitelist) so the last
// known category tree survives an app restart — CategoriesSyncBridge primes
// react-query's cache from this on launch and only hits the network again
// if the backend's /categories/version counter has moved.
export interface CategoriesState {
  version?: number;
  adsCategories?: any[];
  jobCategories?: any[];
}

const initialState: CategoriesState = {
  version: undefined,
  adsCategories: undefined,
  jobCategories: undefined,
};

export const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategoriesCache: (
      state,
      action: PayloadAction<{
        version: number;
        adsCategories: any[];
        jobCategories: any[];
      }>,
    ) => {
      state.version = action.payload.version;
      state.adsCategories = action.payload.adsCategories;
      state.jobCategories = action.payload.jobCategories;
    },
  },
});

export const {setCategoriesCache} = categoriesSlice.actions;

export default categoriesSlice.reducer;
