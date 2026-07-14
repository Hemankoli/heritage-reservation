import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchSites, selectSite } from '../store/siteSlice';
import type { Site } from '../types/index';

export default function SitesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { sites, sitesLoading, error } = useAppSelector((s) => s.sites);

  useEffect(() => { dispatch(fetchSites()); }, [dispatch]);

  const handleBook = (site: Site) => {
    dispatch(selectSite(site));
    navigate(`/book/${site._id}`);
  };

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '6rem 2rem 4.5rem', textAlign: 'center', overflow: 'hidden' }}>
        {/* Radial glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(201,167,100,0.13) 0%, transparent 68%)',
        }} />
        {/* Vertical accent line */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 1, height: 72,
          background: 'linear-gradient(to bottom, var(--gold), transparent)',
        }} />

        <p className="eyebrow anim-up d-0" style={{ marginBottom: '1.5rem' }}>
          Cultural Heritage Sites
        </p>

        <h1 className="display anim-up d-80" style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', marginBottom: '1.5rem' }}>
          Discover the&nbsp;
          <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Living Past</em>
        </h1>

        <p className="anim-up d-160" style={{
          fontSize: '1rem', color: 'var(--smoke)', fontWeight: 300,
          maxWidth: 520, margin: '0 auto 3rem', lineHeight: 1.75,
        }}>
          Reserve your entry to UNESCO-recognised sites and experience centuries
          of heritage through curated, time-limited visits.
        </p>

        {/* Decorative dot divider */}
        <div className="anim-in d-320" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <div style={{ width: 56, height: 1, background: 'linear-gradient(to right, transparent, var(--gold-dim))' }} />
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold)' }} />
          <div style={{ width: 56, height: 1, background: 'linear-gradient(to left, transparent, var(--gold-dim))' }} />
        </div>
      </section>

      {/* ── Sites grid ─────────────────────────────────────── */}
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '1.5rem 2rem 6rem' }}>
        {sitesLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '6rem 0' }}>
            <div className="spinner" />
            <p className="eyebrow" style={{ fontSize: '0.65rem' }}>Loading Sites…</p>
          </div>
        ) : error ? (
          <div className="alert alert-error" style={{ maxWidth: 480, margin: '4rem auto', textAlign: 'center' }}>
            {error}
          </div>
        ) : sites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--smoke)' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--cream)' }}>
              No sites available
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: 300 }}>Check back soon for new heritage sites.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
          }}>
            {sites.map((site, i) => (
              <SiteCard key={site._id} site={site} index={i} onBook={handleBook} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SiteCard({ site, index, onBook }: { site: Site; index: number; onBook: (s: Site) => void }) {
  const delay = Math.min(index * 90, 540);

  return (
    <article
      className="card anim-up"
      style={{ animationDelay: `${delay}ms`, display: 'flex', flexDirection: 'column' }}
    >
      {/* Site image */}
      <div style={{ position: 'relative', height: 216, overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={site.imageUrl || 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80'}
          alt={site.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.65s cubic-bezier(0.22,1,0.36,1)' }}
          onMouseOver={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.06)'; }}
          onMouseOut={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(8,8,13,0.75) 0%, rgba(8,8,13,0.1) 55%, transparent 100%)',
        }} />
        {/* Capacity badge */}
        <div style={{ position: 'absolute', top: 14, right: 14 }}>
          <span className="badge badge-gold">{site.maxDailyCapacity} / day</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.55rem', fontWeight: 500,
          color: 'var(--cream)', lineHeight: 1.15,
          marginBottom: '0.5rem',
        }}>
          {site.name}
        </h2>

        <p style={{
          fontSize: '0.72rem', fontWeight: 600,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--gold)', marginBottom: '0.875rem',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <span style={{ opacity: 0.6 }}>◈</span>
          {site.location}
        </p>

        <p style={{
          fontSize: '0.875rem', color: 'var(--smoke)',
          lineHeight: 1.68, fontWeight: 300,
          flex: 1, marginBottom: '1.5rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {site.description}
        </p>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <button onClick={() => onBook(site)} className="btn btn-gold btn-full">
            Reserve Entry
          </button>
        </div>
      </div>
    </article>
  );
}
