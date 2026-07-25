import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// Persisted (see stateManager/index.ts's persist whitelist) so the last
// known city list survives an app restart — CitiesSyncBridge primes
// react-query's cache from this on launch and only hits the network again
// if the backend's /cities/version counter has moved.
export interface CitiesState {
  version?: number;
  cities?: {id: string; title: string}[];
}

const initialState: CitiesState = {
  version: undefined,
  cities: undefined,
};

export const citiesSlice = createSlice({
  name: 'cities',
  initialState,
  reducers: {
    setCitiesCache: (
      state,
      action: PayloadAction<{
        version: number;
        cities: {id: string; title: string}[];
      }>,
    ) => {
      state.version = action.payload.version;
      state.cities = action.payload.cities;
    },
  },
});

export const {setCitiesCache} = citiesSlice.actions;

export default citiesSlice.reducer;
