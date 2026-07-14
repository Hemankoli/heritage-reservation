import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setCredentials } from '../store/authSlice';
import type { AuthResponse } from '../types/index';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post<AuthResponse>('/auth/register', data);
      dispatch(setCredentials({ user: res.user }));
      navigate('/');
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Registration failed' });
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 66px)',
      display: 'flex', alignItems: 'stretch',
    }}>
      {/* ── Right decorative panel (appears on right side for register) ── */}
      <div style={{
        flex: '0 0 44%',
        display: 'none',
        order: 2,
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--graphite)',
        borderLeft: '1px solid var(--border-subtle)',
      }} className="auth-panel">
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 70% at 70% 40%, rgba(201,167,100,0.14) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '3.5rem',
        }}>
          <p className="eyebrow" style={{ marginBottom: '1.25rem' }}>Join Us</p>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
            fontWeight: 300, lineHeight: 1.1,
            color: 'var(--cream)', marginBottom: '1.5rem',
          }}>
            Begin your<br />
            <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>heritage story</em>
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--smoke)', fontWeight: 300, lineHeight: 1.7, maxWidth: 320 }}>
            Create your account and unlock access to exclusive heritage site reservations, priority booking, and curated cultural experiences.
          </p>

          {/* Features list */}
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              'Real-time seat availability',
              'Instant booking confirmation',
              'Flexible date selection',
            ].map((feat) => (
              <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(201,167,100,0.15)', border: '1px solid var(--gold-dim)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ color: 'var(--gold)', fontSize: '0.65rem' }}>✓</span>
                </div>
                <span style={{ fontSize: '0.83rem', color: 'var(--smoke)', fontWeight: 300 }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form panel ── */}
      <div style={{
        flex: 1, order: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '3rem 2rem', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 50% at 30% 50%, rgba(201,167,100,0.06) 0%, transparent 65%)',
        }} />

        <div className="anim-up" style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>Create Account</p>
            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '2.25rem', fontWeight: 300,
              color: 'var(--cream)', lineHeight: 1.1,
            }}>
              Start your journey
            </h1>
          </div>

          {errors.root && (
            <div className="alert alert-error anim-down" style={{ marginBottom: '1.25rem' }}>
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label className="input-label">Full name</label>
              <input
                {...register('name')}
                placeholder="Your name"
                className="input"
                autoComplete="name"
              />
              {errors.name && <p className="input-error">{errors.name.message}</p>}
            </div>

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
                placeholder="Min. 8 characters"
                className="input"
                autoComplete="new-password"
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
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="gold-line" style={{ margin: '1.75rem 0' }} />

          <p style={{ textAlign: 'center', fontSize: '0.83rem', color: 'var(--smoke)', fontWeight: 300 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 500 }}
              onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}
            >
              Sign in
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
