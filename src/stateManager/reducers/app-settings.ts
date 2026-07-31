import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppSettingsData} from '../../services/app-settings';

// Persisted (see stateManager/index.ts's persist whitelist) so the last known
// app content (درباره ما / تماس با ما text + contact links) survives a restart
// and renders instantly/offline — AppSettingsSyncBridge primes react-query
// from this on launch and only hits the network again when the backend's
// /app-settings/version counter has moved.
export interface AppSettingsState {
  version?: number;
  settings?: AppSettingsData;
}

const initialState: AppSettingsState = {
  version: undefined,
  settings: undefined,
};

export const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState,
  reducers: {
    setAppSettingsCache: (
      state,
      action: PayloadAction<{version: number; settings: AppSettingsData}>,
    ) => {
      state.version = action.payload.version;
      state.settings = action.payload.settings;
    },
  },
});

export const {setAppSettingsCache} = appSettingsSlice.actions;

export default appSettingsSlice.reducer;
