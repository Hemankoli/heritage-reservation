import { useRef } from 'react';
import type { TimeSlot } from '../types/index';

interface Props {
  slots: TimeSlot[];
  siteName: string;
}

function getCellStyle(pct: number, isSoldOut: boolean): { background: string; color: string } {
  if (isSoldOut)  return { background: 'rgba(212,97,74,0.22)',  color: '#e8886f' };
  if (pct < 25)   return { background: 'rgba(212,97,74,0.14)',  color: '#e8886f' };
  if (pct < 60)   return { background: 'rgba(201,167,100,0.14)',color: 'var(--gold)' };
  return           { background: 'rgba(79,168,126,0.14)',        color: '#6dcba0' };
}

export default function CapacityMatrix({ slots, siteName }: Props) {
  const prevTickets = useRef<Record<string, number>>({});

  if (slots.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--smoke)', fontSize: '0.875rem', fontWeight: 300 }}>
        No slots loaded for <em style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--cream)' }}>{siteName}</em>.
      </div>
    );
  }

  const grouped = slots.reduce<Record<string, TimeSlot[]>>((acc, slot) => {
    const dateKey = new Date(slot.date).toLocaleDateString('en-IN', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey]!.push(slot);
    return acc;
  }, {});

  const times = ['09:00', '11:00', '14:00', '16:00'];
  const dates = Object.keys(grouped);

  return (
    <div>
      <h3 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '1.35rem', fontWeight: 400,
        color: 'var(--cream)', marginBottom: '1.25rem',
      }}>
        {siteName}
      </h3>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 4,
          fontSize: '0.83rem',
        }}>
          <thead>
            <tr>
              <th style={{
                padding: '0.6rem 1rem',
                textAlign: 'left',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.68rem', fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--smoke)',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 6,
              }}>
                Slot
              </th>
              {dates.map((date) => (
                <th key={date} style={{
                  padding: '0.6rem 0.875rem',
                  textAlign: 'center',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.72rem', fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: 'var(--cream-dim)',
                  whiteSpace: 'nowrap',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 6,
                }}>
                  {date}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time) => (
              <tr key={time}>
                <td style={{
                  padding: '0.7rem 1rem',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1rem', fontWeight: 500,
                  color: 'var(--gold)',
                  whiteSpace: 'nowrap',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 6,
                }}>
                  {time}
                </td>
                {dates.map((date) => {
                  const daySlots = grouped[date] ?? [];
                  const slot = daySlots.find((s) => s.startTime === time);

                  if (!slot) {
                    return (
                      <td key={date} style={{
                        padding: '0.7rem 0.875rem',
                        textAlign: 'center',
                        color: 'var(--mist)',
                        background: 'rgba(255,255,255,0.01)',
                        borderRadius: 6,
                        fontSize: '0.9rem',
                      }}>
                        —
                      </td>
                    );
                  }

                  const pct = Math.round((slot.available_tickets / slot.totalCapacity) * 100);
                  const isSoldOut = slot.available_tickets === 0;
                  const prev = prevTickets.current[slot._id];
                  const flashing = prev !== undefined && prev !== slot.available_tickets;
                  prevTickets.current[slot._id] = slot.available_tickets;
                  const { background, color } = getCellStyle(pct, isSoldOut);

                  return (
                    <td
                      key={date}
                      className={flashing ? 'cell-flash' : ''}
                      style={{
                        padding: '0.7rem 0.875rem',
                        textAlign: 'center',
                        borderRadius: 6,
                        background,
                        transition: 'background 0.5s ease',
                      }}
                    >
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.83rem', color }}>
                        {slot.available_tickets}/{slot.totalCapacity}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', marginTop: 2, fontWeight: 400 }}>
                        {pct}%
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
