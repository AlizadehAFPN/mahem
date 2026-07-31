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

// Matches the backend's AdvertisementSort enum (find-advertisements.dto.ts)
// so it can be passed straight through to GET /advertisements.
type SortOrder =
  | 'new'
  | 'old'
  | 'price_asc'
  | 'price_desc'
  | 'most_viewed'
  | '';

interface filterState {
  mainCategory?: Category;
  subCategory?: Category;
  subSubCategory?: Category;
  sort: SortOrder;
  // "نمایش فقط آگهی های عکس‌دار" — a general filter, offered for every
  // category and sub-category (see FilterScreen). Three states, because Figma
  // draws it as a بله/خیر field rather than a checkbox: undefined = never
  // chosen (field shows its placeholder), false = خیر, true = بله. Only `true`
  // narrows the results — the other two both mean "don't filter" — but they
  // are kept apart so reopening the filter still shows what was picked.
  onlyImages?: boolean;
  minPrice?: number | string;
  maxPrice?: number | string;
  // "تعیین موقعیت" (FilterScreen) — an explicit near-me override; when
  // unset, search-screen.tsx falls back to the account's city (see
  // ads.ts's createAds cityId fallback), same as ad-posting.
  lat?: number;
  lng?: number;
  // Category-specific attribute filters (see FilterScreen / backend's
  // FindAdvertisementsDto) — all optional, shown only for the relevant
  // category.
  rooms?: string;
  minArea?: number;
  maxArea?: number;
  minProductYear?: number;
  maxProductYear?: number;
  minOperationAmount?: number;
  maxOperationAmount?: number;
  minRehn?: number;
  maxRehn?: number;
  minEjare?: number;
  maxEjare?: number;
  isPersonalSeller?: boolean;
  hasSuburb?: boolean;
  brand?: string;
  adType?: string;
  contractType?: string;
  education?: string;
  allAds: boolean;
}

const initialState: filterState = {
  mainCategory: undefined,
  subCategory: undefined,
  subSubCategory: undefined,
  sort: '',
  onlyImages: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  lat: undefined,
  lng: undefined,
  rooms: undefined,
  minArea: undefined,
  maxArea: undefined,
  minProductYear: undefined,
  maxProductYear: undefined,
  minOperationAmount: undefined,
  maxOperationAmount: undefined,
  minRehn: undefined,
  maxRehn: undefined,
  minEjare: undefined,
  maxEjare: undefined,
  isPersonalSeller: undefined,
  hasSuburb: undefined,
  brand: undefined,
  adType: undefined,
  contractType: undefined,
  education: undefined,
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
