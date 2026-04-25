import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { SearchFilterState } from "../../types/searchFilters";

export interface CalendarDates {
  startDate: string | null;
  endDate: string | null;
}

export interface PreservedRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface ListingsFiltersState {
  preservedFilter: string | null;
  preservedDates: CalendarDates;
  preservedCity: string;
  preservedSearchFilters: SearchFilterState | null;
  /** User's current/last map region (e.g. from GPS) so list/map don't reset to Riyadh on tab focus */
  preservedRegion: PreservedRegion | null;
}

const initialState: ListingsFiltersState = {
  preservedFilter: null,
  preservedDates: { startDate: null, endDate: null },
  preservedCity: "",
  preservedSearchFilters: null,
  preservedRegion: null,
};

const listingsFiltersSlice = createSlice({
  name: "listingsFilters",
  initialState,
  reducers: {
    setPreservedFilter: (state, action: PayloadAction<string | null>) => {
      state.preservedFilter = action.payload;
    },
    setPreservedDates: (state, action: PayloadAction<CalendarDates>) => {
      state.preservedDates = action.payload;
    },
    setPreservedCity: (state, action: PayloadAction<string>) => {
      state.preservedCity = action.payload;
    },
    setPreservedSearchFilters: (
      state,
      action: PayloadAction<SearchFilterState | null>,
    ) => {
      state.preservedSearchFilters = action.payload;
    },
    setPreservedRegion: (
      state,
      action: PayloadAction<PreservedRegion | null>,
    ) => {
      state.preservedRegion = action.payload;
    },
  },
});

export const {
  setPreservedFilter,
  setPreservedDates,
  setPreservedCity,
  setPreservedSearchFilters,
  setPreservedRegion,
} = listingsFiltersSlice.actions;

export default listingsFiltersSlice.reducer;
