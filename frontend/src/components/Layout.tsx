import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { logout } from '../store/authSlice';

export default function Layout() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: scrolled ? 'rgba(8,8,13,0.97)' : 'rgba(8,8,13,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(201,167,100,0.18)' : 'rgba(255,255,255,0.04)'}`,
        transition: 'all 0.35s ease',
      }}>
        <div style={{
          maxWidth: 1320, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 66,
        }} className="nav-inner">
          {/* Brand */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38,
              background: 'linear-gradient(135deg, #d4b270 0%, #7a5a1a 100%)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: '#1a1000',
              flexShrink: 0,
            }}>
              ⬡
            </div>
            <div style={{ lineHeight: 1.2 }} className="brand-text">
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '1.4rem', fontWeight: 500,
                color: 'var(--cream)', letterSpacing: '0.01em',
              }}>
                Heritage
              </div>
              <div style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.58rem', fontWeight: 600,
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'var(--gold)', marginTop: 1,
              }} className="brand-subtitle">
                Reservations
              </div>
            </div>
          </Link>

          {/* Nav actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="nav-actions">
            {user ? (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginRight: 6, padding: '0.35rem 0.875rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.06)',
                  flexShrink: 0,
                }} className="nav-user-chip">
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--gold) 0%, #7a5a1a 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700, color: '#1a1000',
                    flexShrink: 0,
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--cream-dim)', fontWeight: 300 }} className="nav-username">
                    {user.name}
                  </span>
                </div>

                {user.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    className="btn btn-outline btn-sm"
                    style={({ isActive }) => isActive ? { borderColor: 'var(--gold)', color: 'var(--gold-light)' } : {}}
                  >
                    Dashboard
                  </NavLink>
                )}  
                {user.role !== 'admin' && <NavLink
                  to="/my-bookings"
                  className="btn btn-ghost btn-sm"
                  style={({ isActive }) => isActive ? { color: 'var(--gold)', borderBottom: '1px solid var(--gold)' } : {}}
                >
                  My Bookings
                </NavLink>}
                <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-ghost btn-sm">Sign In</NavLink>
                <NavLink to="/register" className="btn btn-gold btn-sm">Register</NavLink>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Page content ── */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '1.75rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '1rem', fontWeight: 400,
            color: 'var(--gold)', letterSpacing: '0.04em',
          }}>
            Heritage Reservations
          </span>
          <span style={{ color: 'var(--mist)', fontSize: '0.7rem' }}>·</span>
          <span style={{ color: 'var(--mist)', fontSize: '0.75rem', fontWeight: 300 }}>
            Preserving culture, one visit at a time
          </span>
        </div>
      </footer>
    </div>
  );
}
