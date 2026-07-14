import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setCredentials } from '../store/authSlice';
import type { AuthResponse } from '../types/index';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post<AuthResponse>('/auth/login', data);
      dispatch(setCredentials({ user: res.user }));
      navigate(res.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Login failed' });
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 66px)',
      display: 'flex',
      alignItems: 'stretch',
    }}>
      {/* ── Left decorative panel ── */}
      <div style={{
        flex: '0 0 44%',
        display: 'none',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--graphite)',
        borderRight: '1px solid var(--border-subtle)',
      }}
        className="auth-panel"
      >
        {/* Radial glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 70% at 30% 40%, rgba(201,167,100,0.14) 0%, transparent 65%)',
        }} />
        {/* Large serif text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '3.5rem',
        }}>
          <p className="eyebrow" style={{ marginBottom: '1.25rem' }}>Welcome Back</p>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
            fontWeight: 300, lineHeight: 1.1,
            color: 'var(--cream)', marginBottom: '1.5rem',
          }}>
            Continue your<br />
            <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>cultural journey</em>
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--smoke)', fontWeight: 300, lineHeight: 1.7, maxWidth: 320 }}>
            Access your reservations and explore curated heritage experiences across our network of protected sites.
          </p>

          {/* Decorative quote */}
          <div style={{
            marginTop: '3rem',
            padding: '1.25rem 1.5rem',
            borderLeft: '2px solid var(--gold-dim)',
            background: 'rgba(201,167,100,0.05)',
            borderRadius: '0 8px 8px 0',
          }}>
            <p style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.05rem', fontStyle: 'italic',
              color: 'var(--cream-dim)', lineHeight: 1.6,
            }}>
              "The past is never dead. It's not even past."
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--mist)', marginTop: '0.5rem', letterSpacing: '0.08em' }}>
              — William Faulkner
            </p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '3rem 2rem',
        position: 'relative',
      }}>
        {/* Subtle background radial */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(201,167,100,0.06) 0%, transparent 65%)',
        }} />

        <div className="anim-up" style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>Sign In</p>
            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '2.25rem', fontWeight: 300,
              color: 'var(--cream)', lineHeight: 1.1,
            }}>
              Welcome back
            </h1>
          </div>

          {/* Error */}
          {errors.root && (
            <div className="alert alert-error anim-down" style={{ marginBottom: '1.25rem' }}>
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label className="input-label">Email address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="input"
                autoComplete="email"
              />
              {errors.email && <p className="input-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="input-label">Password</label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="input"
                autoComplete="current-password"
              />
              {errors.password && <p className="input-error">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-gold btn-full btn-lg"
              style={{ marginTop: '0.5rem' }}
            >
              {isSubmitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="spinner-sm" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="gold-line" style={{ margin: '1.75rem 0' }} />

          <p style={{ textAlign: 'center', fontSize: '0.83rem', color: 'var(--smoke)', fontWeight: 300 }}>
            New to Heritage Reservations?{' '}
            <Link to="/register" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 500 }}
              onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) { .auth-panel { display: block !important; } }
      `}</style>
    </div>
  );
}
