import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface Category {
  // `id` is optional because home-screen/menu's "همه‌ی آگهی‌ها" entries use a
  // pseudo-category ({title, allAds: true}) with no real id to mean "no
  // category filter".
  id?: string;
  title: string;
  slug?: string;
  sub_categories?: Category[];
  [key: string]: unknown;
}

interface City {
  id: string;
  title: string;
}

// Matches the backend's AdvertisementSort enum (find-advertisements.dto.ts)
// so it can be passed straight through to GET /advertisements.
type SortOrder = 'new' | 'old' | 'price_asc' | 'price_desc' | 'most_viewed' | '';

interface filterState {
  mainCategory?: Category;
  subCategory?: Category;
  subSubCategory?: Category;
  sort: SortOrder;
  onlyImages: boolean;
  minPrice?: number | string;
  maxPrice?: number | string;
  city?: City;
  allAds: boolean;
}

const initialState: filterState = {
  mainCategory: undefined,
  subCategory: undefined,
  subSubCategory: undefined,
  sort: '',
  onlyImages: false,
  city: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  allAds: false,
};

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<filterState>>) => {
      Object.assign(state, action.payload);
    },
    clearFilters: () => initialState,
  },
});

export const {setFilters, clearFilters} = filterSlice.actions;

export default filterSlice.reducer;
