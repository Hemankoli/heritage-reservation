import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import type { Reservation } from '../types/index';

interface BookingState {
  myReservations: Reservation[];
  loading: boolean;
  error: string | null;
  lastBooking: { reservationId: string; available_tickets: number } | null;
}

const initialState: BookingState = {
  myReservations: [], loading: false, error: null, lastBooking: null,
};

export const createBooking = createAsyncThunk(
  'booking/create',
  async (payload: { slotId: string; siteId: string; quantity: number }) =>
    api.post<{ reservationId: string; available_tickets: number }>('/reservations', payload)
);

export const cancelBooking = createAsyncThunk(
  'booking/cancel',
  async (reservationId: string) =>
    api.delete<{ message: string }>(`/reservations/${reservationId}`)
);

export const fetchMyReservations = createAsyncThunk(
  'booking/fetchMine',
  () => api.get<Reservation[]>('/reservations/my')
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookingStatus(state) { state.error = null; state.lastBooking = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => { state.loading = true; state.error = null; state.lastBooking = null; })
      .addCase(createBooking.fulfilled, (state, action) => { state.loading = false; state.lastBooking = action.payload; })
      .addCase(createBooking.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? 'Booking failed'; })
      .addCase(fetchMyReservations.fulfilled, (state, action) => { state.myReservations = action.payload; })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const id = action.meta.arg as string;
        state.myReservations = state.myReservations.filter((r) => r._id !== id);
      });
  },
});

export const { clearBookingStatus } = bookingSlice.actions;
export default bookingSlice.reducer;
