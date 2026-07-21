import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface userState {
  token?: string;
  refreshToken?: string;
  mobile?: string;
  username?: string;
  avatar?: string;
  cityId?: string;
  sex?: string;
  id?: string;
  city?: string;
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
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<userState>>) => {
      Object.assign(state, action.payload);
    },
    removeUser: state => {
      state.token = undefined;
      state.refreshToken = undefined;
      state.mobile = '';
      state.username = '';
      state.cityId = '';
    },
    setUserCity: (
      state,
      action: PayloadAction<{cityId: string; city: string}>,
    ) => {
      state.cityId = action.payload.cityId;
      state.city = action.payload.city;
    },
  },
});

export const {setUser, removeUser, setUserCity} = userSlice.actions;

export default userSlice.reducer;
