import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchSlots, selectSite } from '../store/siteSlice';
import { createBooking, clearBookingStatus } from '../store/bookingSlice';
import { api } from '../api/client';
import type { Site } from '../types/index';
import SlotCard from '../components/SlotCard';

const schema = z.object({
  date: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(10),
});
type FormData = z.infer<typeof schema>;

export default function BookingPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { selectedSite, slots, slotsLoading } = useAppSelector((s) => s.sites);
  const { loading, error, lastBooking } = useAppSelector((s) => s.booking);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [siteLoading, setSiteLoading] = useState(false);

  // Restore site from API on page reload when Redux state is empty
  useEffect(() => {
    if (!selectedSite && siteId) {
      setSiteLoading(true);
      api.get<Site>(`/sites/${siteId}`)
        .then((site) => dispatch(selectSite(site)))
        .catch(() => {/* navigate to home on error below */})
        .finally(() => setSiteLoading(false));
    }
  }, [siteId, selectedSite, dispatch]);

  const today = new Date().toISOString().split('T')[0]!;

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData, any, FormData>,
    defaultValues: { date: today, quantity: 1 },
  });

  const watchDate = watch('date');

  useEffect(() => {
    if (siteId && watchDate) dispatch(fetchSlots({ siteId, date: watchDate }));
    setSelectedSlot(null);
  }, [dispatch, siteId, watchDate]);

  useEffect(() => {
    return () => { dispatch(clearBookingStatus()); };
  }, [dispatch]);

  const onSubmit = async (data: FormData) => {
    if (!selectedSlot || !siteId) return;
    await dispatch(createBooking({ slotId: selectedSlot, siteId, quantity: data.quantity }));
  };

  if (siteLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '8rem 0' }}>
        <div className="spinner" />
        <p className="eyebrow" style={{ fontSize: '0.65rem' }}>Loading Site…</p>
      </div>
    );
  }

  if (!selectedSite) {
    return (
      <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.75rem', fontWeight: 300,
          color: 'var(--cream)', marginBottom: '1rem',
        }}>
          Site not found
        </p>
        <p style={{ color: 'var(--smoke)', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 300 }}>
          Please choose a heritage site to continue.
        </p>
        <button onClick={() => navigate('/')} className="btn btn-outline">
          Browse Sites
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: '2.5rem 2rem 5rem' }}>
      {/* ── Back link ── */}
      <button
        onClick={() => navigate('/')}
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: '1.75rem', paddingLeft: 0 }}
      >
        ← Back to Sites
      </button>

      {/* ── Site header ── */}
      <div className="anim-up d-0" style={{ marginBottom: '2.5rem' }}>
        <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>{selectedSite.location}</p>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 300, color: 'var(--cream)',
          lineHeight: 1.1,
        }}>
          {selectedSite.name}
        </h1>
        <div className="gold-line" style={{ marginTop: '1.25rem' }} />
      </div>

      {/* ── Alerts ── */}
      {lastBooking && (
        <div className="alert alert-success anim-down" style={{ marginBottom: '1.5rem' }}>
          <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Booking Confirmed!</strong>
          Tickets remaining for this slot: {lastBooking.available_tickets}
        </div>
      )}
      {error && (
        <div className="alert alert-error anim-down" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>

          {/* ── Date selection ── */}
          <div className="card-panel anim-up d-80" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(201,167,100,0.12)', border: '1px solid var(--gold-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem',
              }}>📅</div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 500, color: 'var(--cream)' }}>
                Select Date
              </h2>
            </div>
            <input
              {...register('date')}
              type="date"
              min={today}
              className="input"
              style={{ width: 'auto' }}
            />
            {errors.date && <p className="input-error">{errors.date.message}</p>}
          </div>

          {/* ── Tickets ── */}
          <div className="card-panel anim-up d-160" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(201,167,100,0.12)', border: '1px solid var(--gold-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem',
              }}>🎟</div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 500, color: 'var(--cream)' }}>
                Number of Tickets
              </h2>
            </div>
            <input
              {...register('quantity')}
              type="number" min={1} max={10}
              className="input"
              style={{ width: 96 }}
            />
            {errors.quantity && <p className="input-error">{errors.quantity.message}</p>}
            <p style={{ fontSize: '0.75rem', color: 'var(--mist)', marginTop: '0.625rem', fontWeight: 300 }}>
              Max 10 tickets per booking
            </p>
          </div>
        </div>

        {/* ── Slot grid ── */}
        <div className="card-panel anim-up d-240" style={{ padding: '1.75rem', marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(201,167,100,0.12)', border: '1px solid var(--gold-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem',
            }}>🕐</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 500, color: 'var(--cream)' }}>
              Select Time Slot
            </h2>
          </div>

          {slotsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '1.5rem 0' }}>
              <div className="spinner spinner-sm" />
              <span style={{ color: 'var(--smoke)', fontSize: '0.875rem', fontWeight: 300 }}>Loading available slots…</span>
            </div>
          ) : slots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p style={{ color: 'var(--smoke)', fontSize: '0.875rem', fontWeight: 300 }}>
                No slots available for this date. Try another date.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.875rem' }}>
              {slots.map((slot) => (
                <SlotCard
                  key={slot._id}
                  slot={slot}
                  selected={selectedSlot === slot._id}
                  onSelect={() => setSelectedSlot(slot._id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Submit ── */}
        <div className="anim-up d-320" style={{ marginTop: '1.75rem' }}>
          <button
            type="submit"
            disabled={loading || !selectedSlot}
            className="btn btn-gold btn-full btn-lg"
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spinner-sm" />
                Processing Reservation…
              </span>
            ) : 'Confirm Reservation'}
          </button>
          {!selectedSlot && (
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--mist)', marginTop: '0.625rem' }}>
              Please select a time slot to continue
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
