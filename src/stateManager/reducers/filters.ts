import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface filterState {
  mainCategory?: any;
  subCategory?: any;
  subSubCategory?: any;
  sort: any;
  onlyImages: boolean;
  price: any;
  city: any;
  allAds: boolean;
}

const initialState: filterState = {
  mainCategory: undefined,
  subCategory: undefined,
  subSubCategory: undefined,
  sort: '',
  onlyImages: false,
  city: undefined,
  price: undefined,
  allAds: false,
};

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      return (state = {...state, ...action.payload});
    },
  },
});

export const {setFilters} = filterSlice.actions;

export default filterSlice.reducer;
