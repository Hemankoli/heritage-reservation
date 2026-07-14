import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchAllReservations, cancelBooking } from '../store/bookingSlice';
import type { Reservation } from '../types/index';

type BookingStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

function deriveStatus(reservation: Reservation): BookingStatus {
  if (reservation.status === 'cancelled') return 'cancelled';
  const slot = reservation.timeSlot;
  const start = new Date(`${slot.date}T${slot.startTime}:00`);
  const end = new Date(`${slot.date}T${slot.endTime}:00`);
  const now = new Date();
  if (now >= start && now <= end) return 'active';
  if (now < start) return 'upcoming';
  return 'completed';
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  upcoming: 'Upcoming',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_STYLE: Record<BookingStatus, { bg: string; color: string }> = {
  upcoming: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  active: { bg: 'rgba(245,148,51,0.12)', color: '#f59433' },
  completed: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
  cancelled: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 12px',
      borderRadius: 20,
      fontSize: '0.72rem',
      fontWeight: 600,
      background: s.bg,
      color: s.color,
      letterSpacing: '0.02em',
    }}>
      {status === 'active' && <span style={{ marginRight: 4 }}>●</span>}
      {STATUS_LABEL[status]}
    </span>
  );
}

interface CancelTarget {
  reservationId: string;
  siteName: string;
  date: string;
  startTime: string;
}

function ConfirmDialog({
  target,
  onConfirm,
  onDismiss,
  cancelling,
}: {
  target: CancelTarget;
  onConfirm: () => void;
  onDismiss: () => void;
  cancelling: boolean;
}) {
  const formatted = new Date(target.date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--surface, #13131a)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14,
        padding: '2rem',
        maxWidth: 420,
        width: '100%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem', color: 'var(--cream, #f5f0e8)' }}>
          Cancel booking?
        </h3>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: 'var(--cream-dim, #c9bfa8)', lineHeight: 1.55 }}>
          Cancel your booking at <strong style={{ color: 'var(--cream, #f5f0e8)' }}>{target.siteName}</strong> on {formatted} at {target.startTime}? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onDismiss}
            disabled={cancelling}
            className="btn btn-ghost btn-sm"
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            disabled={cancelling}
            style={{
              padding: '0.45rem 1.1rem',
              background: 'transparent',
              border: '1px solid #ef4444',
              color: '#ef4444',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: cancelling ? 'not-allowed' : 'pointer',
              opacity: cancelling ? 0.6 : 1,
            }}
          >
            {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

const COL = '2.2fr 1.3fr 1.4fr 0.6fr 1.1fr 1fr';

export default function MyBookingsPage() {
  const dispatch = useAppDispatch();
  const { allReservations, allReservationsLoading, allReservationsError } = useAppSelector((s) => s.booking);
  const user = useAppSelector((s) => s.auth.user);

  const [cancelTarget, setCancelTarget] = useState<CancelTarget | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    dispatch(fetchAllReservations());
  }, [dispatch]);

  const upcomingCount = allReservations.filter((r) => deriveStatus(r) === 'upcoming').length;
  const completedCount = allReservations.filter((r) => deriveStatus(r) === 'completed').length;

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    await dispatch(cancelBooking(cancelTarget.reservationId));
    await dispatch(fetchAllReservations());
    setCancelling(false);
    setCancelTarget(null);
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.3rem', fontSize: '1.75rem', fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, color: 'var(--cream, #f5f0e8)' }}>
            My Bookings
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--mist, #8a8070)' }}>
            All reservations for {user?.name ?? 'you'}
          </p>
        </div>
        {allReservations.length > 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {upcomingCount > 0 && (
              <span style={{ fontSize: '0.75rem', padding: '4px 12px', background: 'rgba(34,197,94,0.12)', color: '#22c55e', borderRadius: 20, fontWeight: 600 }}>
                {upcomingCount} Upcoming
              </span>
            )}
            {completedCount > 0 && (
              <span style={{ fontSize: '0.75rem', padding: '4px 12px', background: 'rgba(99,102,241,0.12)', color: '#818cf8', borderRadius: 20, fontWeight: 600 }}>
                {completedCount} Completed
              </span>
            )}
          </div>
        )}
      </div>

      {allReservationsLoading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--mist, #8a8070)' }}>
          Loading your bookings…
        </div>
      )}

      {allReservationsError && !allReservationsLoading && (
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#ef4444', fontSize: '0.875rem' }}>
          {allReservationsError}
        </div>
      )}

      {!allReservationsLoading && !allReservationsError && allReservations.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏛️</div>
          <p style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: 'var(--cream, #f5f0e8)' }}>No bookings yet</p>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: 'var(--mist, #8a8070)' }}>
            Explore heritage sites and make your first reservation.
          </p>
          <Link to="/" className="btn btn-gold btn-sm">Browse Sites</Link>
        </div>
      )}

      {!allReservationsLoading && allReservations.length > 0 && (
        <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>

          <div style={{ display: 'grid', gridTemplateColumns: COL, padding: '10px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {['SITE', 'DATE', 'TIME SLOT', 'QTY', 'STATUS', 'ACTION'].map((h) => (
              <span key={h} style={{ fontSize: '0.67rem', fontWeight: 700, color: 'var(--mist, #8a8070)', letterSpacing: '0.07em' }}>{h}</span>
            ))}
          </div>

          {allReservations.map((r, i) => {
            const status = deriveStatus(r);
            const isActive = status === 'active';
            const isUpcoming = status === 'upcoming';
            const isPast = status === 'completed' || status === 'cancelled';
            const isCancelled = status === 'cancelled';
            const isLast = i === allReservations.length - 1;

            return (
              <div
                key={r._id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: COL,
                  padding: '14px 20px',
                  alignItems: 'center',
                  borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
                  background: isActive ? 'rgba(245,148,51,0.05)' : 'transparent',
                  opacity: isPast ? (isCancelled ? 0.55 : 0.75) : 1,
                  transition: 'background 0.2s',
                }}
              >
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--cream, #f5f0e8)',
                    textDecoration: isCancelled ? 'line-through' : 'none',
                    textDecorationColor: 'rgba(239,68,68,0.5)',
                  }}>
                    {r.site.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--mist, #8a8070)' }}>{r.site.location}</div>
                </div>

                <span style={{ fontSize: '0.82rem', color: 'var(--cream-dim, #c9bfa8)' }}>
                  {formatDate(r.timeSlot.date)}
                </span>

                <span style={{ fontSize: '0.82rem', color: 'var(--cream-dim, #c9bfa8)' }}>
                  {r.timeSlot.startTime} – {r.timeSlot.endTime}
                </span>

                <span style={{ fontSize: '0.82rem', color: 'var(--cream-dim, #c9bfa8)' }}>
                  ×{r.quantity}
                </span>

                <StatusBadge status={status} />

                <div>
                  {isUpcoming ? (
                    <button
                      onClick={() => setCancelTarget({
                        reservationId: r._id,
                        siteName: r.site.name,
                        date: r.timeSlot.date,
                        startTime: r.timeSlot.startTime,
                      })}
                      style={{
                        padding: '4px 14px',
                        background: 'transparent',
                        border: '1px solid rgba(239,68,68,0.5)',
                        color: '#ef4444',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cancelTarget && (
        <ConfirmDialog
          target={cancelTarget}
          onConfirm={handleConfirmCancel}
          onDismiss={() => setCancelTarget(null)}
          cancelling={cancelling}
        />
      )}
    </div>
  );
}
