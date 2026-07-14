import type { TimeSlot } from '../types/index';

interface Props {
  slot: TimeSlot;
  selected: boolean;
  onSelect: () => void;
}

export default function SlotCard({ slot, selected, onSelect }: Props) {
  const pct = Math.round((slot.available_tickets / slot.totalCapacity) * 100);
  const isFull = slot.available_tickets === 0;

  const barColor = pct > 50 ? '#4fa87e' : pct > 20 ? '#c9a764' : '#d4614a';
  const statusLabel = isFull ? 'Sold Out' : pct > 50 ? 'Available' : pct > 20 ? 'Filling Up' : 'Almost Full';
  const statusColor = isFull ? 'var(--ember)' : pct > 50 ? 'var(--jade)' : pct > 20 ? 'var(--gold)' : 'var(--ember)';

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isFull}
      className={`slot-card${selected ? ' selected' : ''}`}
    >
      {/* Time range */}
      <div style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '1.25rem', fontWeight: 500,
        color: selected ? 'var(--gold-light)' : 'var(--cream)',
        marginBottom: '0.375rem',
        transition: 'color 0.25s ease',
      }}>
        {slot.startTime} – {slot.endTime}
      </div>

      {/* Status row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: '0.7rem', fontWeight: 600,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: statusColor,
        }}>
          {statusLabel}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--smoke)', fontWeight: 300 }}>
          {isFull ? '0' : slot.available_tickets} / {slot.totalCapacity}
        </span>
      </div>

      {/* Availability bar */}
      <div className="avail-track">
        <div
          className="avail-fill"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>

      {/* Percent label */}
      <p style={{
        fontSize: '0.68rem', color: 'var(--mist)',
        marginTop: '0.375rem', fontWeight: 300,
      }}>
        {pct}% capacity available
      </p>
    </button>
  );
}
