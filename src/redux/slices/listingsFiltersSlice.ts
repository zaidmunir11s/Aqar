import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { SearchFilterState } from "../../types/searchFilters";

export interface CalendarDates {
  startDate: string | null;
  endDate: string | null;
}

interface ListingsFiltersState {
  preservedFilter: string | null;
  preservedDates: CalendarDates;
  preservedCity: string;
  preservedSearchFilters: SearchFilterState | null;
}

const initialState: ListingsFiltersState = {
  preservedFilter: null,
  preservedDates: { startDate: null, endDate: null },
  preservedCity: "",
  preservedSearchFilters: null,
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
      action: PayloadAction<SearchFilterState | null>
    ) => {
      state.preservedSearchFilters = action.payload;
    },
  },
});

export const {
  setPreservedFilter,
  setPreservedDates,
  setPreservedCity,
  setPreservedSearchFilters,
} = listingsFiltersSlice.actions;

export default listingsFiltersSlice.reducer;
