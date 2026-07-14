import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Site, TimeSlot } from '../types/index';
import { api } from '../api/client';

interface SiteState {
  sites: Site[];
  selectedSite: Site | null;
  slots: TimeSlot[];
  slotsLoading: boolean;
  sitesLoading: boolean;
  error: string | null;
}

const initialState: SiteState = {
  sites: [], selectedSite: null, slots: [], slotsLoading: false, sitesLoading: false, error: null,
};

export const fetchSites = createAsyncThunk('sites/fetchAll', () => api.get<Site[]>('/sites'));
export const fetchSlots = createAsyncThunk(
  'sites/fetchSlots',
  ({ siteId, date }: { siteId: string; date?: string }) =>
    api.get<TimeSlot[]>(`/sites/${siteId}/slots${date ? `?date=${date}` : ''}`)
);

const siteSlice = createSlice({
  name: 'sites',
  initialState,
  reducers: {
    selectSite(state, action: PayloadAction<Site>) {
      state.selectedSite = action.payload;
      state.slots = [];
    },
    updateSlotCapacity(state, action: PayloadAction<{ slotId: string; available_tickets: number }>) {
      const slot = state.slots.find((s) => s._id === action.payload.slotId);
      if (slot) slot.available_tickets = action.payload.available_tickets;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSites.pending, (state) => { state.sitesLoading = true; state.error = null; })
      .addCase(fetchSites.fulfilled, (state, action) => { state.sitesLoading = false; state.sites = action.payload; })
      .addCase(fetchSites.rejected, (state, action) => { state.sitesLoading = false; state.error = action.error.message ?? 'Failed'; })
      .addCase(fetchSlots.pending, (state) => { state.slotsLoading = true; state.error = null; })
      .addCase(fetchSlots.fulfilled, (state, action) => { state.slotsLoading = false; state.slots = action.payload; })
      .addCase(fetchSlots.rejected, (state, action) => { state.slotsLoading = false; state.error = action.error.message ?? 'Failed'; });
  },
});

export const { selectSite, updateSlotCapacity } = siteSlice.actions;
export default siteSlice.reducer;
