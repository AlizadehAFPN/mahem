import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// Persisted (see stateManager/index.ts's persist whitelist) so the last
// known option lists survive an app restart — AttributeOptionsSyncBridge
// primes react-query's cache from this on launch and only hits the network
// again if the backend's /attribute-options/version counter has moved.
export interface AttributeOptionsState {
  version?: number;
  optionsByGroup?: Record<string, {title: string}[]>;
}

const initialState: AttributeOptionsState = {
  version: undefined,
  optionsByGroup: undefined,
};

export const attributeOptionsSlice = createSlice({
  name: 'attributeOptions',
  initialState,
  reducers: {
    setAttributeOptionsCache: (
      state,
      action: PayloadAction<{
        version: number;
        optionsByGroup: Record<string, {title: string}[]>;
      }>,
    ) => {
      state.version = action.payload.version;
      state.optionsByGroup = action.payload.optionsByGroup;
    },
  },
});

export const {setAttributeOptionsCache} = attributeOptionsSlice.actions;

export default attributeOptionsSlice.reducer;
