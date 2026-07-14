import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchSites, fetchSlots } from '../store/siteSlice';
import CapacityMatrix from '../components/CapacityMatrix';
import type { Site } from '../types/index';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { sites, slots, sitesLoading } = useAppSelector((s) => s.sites);
  const [activeSite, setActiveSite] = useState<Site | null>(null);

  useEffect(() => { dispatch(fetchSites()); }, [dispatch]);

  useEffect(() => {
    if (activeSite) dispatch(fetchSlots({ siteId: activeSite._id }));
  }, [dispatch, activeSite]);

  useEffect(() => {
    if (sites.length > 0 && !activeSite) setActiveSite(sites[0]!);
  }, [sites, activeSite]);

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: '2.5rem 2rem 5rem' }}>
      {/* ── Header ── */}
      <div className="anim-up d-0" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Admin Portal</p>
            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 300, color: 'var(--cream)', lineHeight: 1.1,
            }}>
              Capacity Dashboard
            </h1>
          </div>
          {/* Live indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '0.5rem 1rem',
            background: 'rgba(79,168,126,0.1)',
            border: '1px solid rgba(79,168,126,0.3)',
            borderRadius: 8,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--jade)',
              boxShadow: '0 0 8px rgba(79,168,126,0.7)',
              animation: 'pulseGold 2s ease infinite',
            }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6dcba0' }}>
              Live Updates
            </span>
          </div>
        </div>
        <div className="gold-line" style={{ marginTop: '1.5rem' }} />
      </div>

      {/* ── Stats row ── */}
      <div className="anim-up d-80" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {[
          { label: 'Total Sites', value: sites.length, icon: '🏛' },
          { label: 'Slots Loaded', value: slots.length, icon: '📅' },
          { label: 'Total Capacity', value: slots.reduce((a, s) => a + s.totalCapacity, 0), icon: '🎟' },
          { label: 'Available Now', value: slots.reduce((a, s) => a + s.available_tickets, 0), icon: '✅' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card-panel" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{icon}</div>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '2rem', fontWeight: 400, color: 'var(--gold-light)',
              lineHeight: 1,
            }}>
              {value.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--smoke)', marginTop: '0.25rem' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Site tabs ── */}
      <div className="anim-up d-160" style={{ marginBottom: '1.25rem' }}>
        {sitesLoading ? (
          <div className="spinner spinner-sm" />
        ) : (
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            {sites.map((site) => (
              <button
                key={site._id}
                onClick={() => setActiveSite(site)}
                className={`tab-btn ${activeSite?._id === site._id ? 'tab-active' : 'tab-inactive'}`}
              >
                {site.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Capacity matrix ── */}
      <div className="anim-up d-240" style={{
        background: 'var(--panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        padding: '1.75rem',
      }}>
        {/* Legend */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1.25rem',
          marginBottom: '1.5rem', flexWrap: 'wrap',
        }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--smoke)' }}>
            Capacity Legend
          </p>
          {[
            { label: '≥ 60% available', color: 'rgba(79,168,126,0.3)', text: '#6dcba0' },
            { label: '25 – 59%', color: 'rgba(201,167,100,0.3)', text: 'var(--gold)' },
            { label: '< 25%', color: 'rgba(212,97,74,0.25)', text: '#e8886f' },
            { label: 'Sold Out', color: 'rgba(212,97,74,0.4)', text: '#e8886f' },
          ].map(({ label, color, text }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--smoke)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ color: text }}>{label}</span>
            </span>
          ))}
        </div>

        <div className="gold-line" style={{ marginBottom: '1.5rem' }} />

        {activeSite ? (
          <CapacityMatrix slots={slots} siteName={activeSite.name} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--smoke)', fontSize: '0.875rem' }}>
            <div className="spinner spinner-sm" />
            Loading matrix…
          </div>
        )}
      </div>
    </div>
  );
}
