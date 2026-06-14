"use client";
import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { loginUser, logoutUser } from '@/lib/actions/auth';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await logoutUser();
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // 1. Sign in on client to get ID Token
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // 2. Set session cookie via server action
      const res = await loginUser(idToken);
      
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      // 3. Success! Redirect
      if (email === 'adminbbetter@gmail.com') {
        router.push('/admin');
      } else if (redirect) {
        router.push(redirect);
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else {
        setError(err.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className={styles.authContainer}><span className="spinner"></span></div>;
  }

  if (user) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 className={styles.title}>My Account</h1>
            <p className={styles.subtitle}>Manage your orders and details</p>
          </div>
          
          <div style={{ backgroundColor: 'var(--surface-hover)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, margin: '0 auto 1rem auto' }}>
              {user.email?.[0].toUpperCase()}
            </div>
            <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>{user.email}</p>
            {user.email === 'adminbbetter@gmail.com' && (
              <p style={{ color: 'var(--success)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Administrator</p>
            )}
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {user.email === 'adminbbetter@gmail.com' && (
              <button onClick={() => router.push('/admin')} className="btn btn-primary" style={{ width: '100%' }}>
                Go to Admin Dashboard
              </button>
            )}
            <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', color: 'var(--error)', borderColor: 'var(--error)' }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className={styles.title}>Welcome to <span style={{ color: 'var(--primary)' }}>B</span>better</h1>
          <p className={styles.subtitle}>Sign in to access your orders and wishlist</p>
        </div>

        <div className={styles.tabs}>
          <button 
            type="button"
            className={`${styles.tab} ${loginMethod === 'email' ? styles.active : ''}`}
            onClick={() => setLoginMethod('email')}
          >
            Email
          </button>
          <button 
            type="button"
            className={`${styles.tab} ${loginMethod === 'phone' ? styles.active : ''}`}
            onClick={() => setLoginMethod('phone')}
          >
            Phone & OTP
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {loginMethod === 'email' ? (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="email">Email address</label>
                <input type="email" name="email" id="email" className="input" placeholder="you@example.com" required />
              </div>
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className={styles.label} htmlFor="password">Password</label>
                  <Link href="/auth/forgot" className={styles.forgotLink}>Forgot?</Link>
                </div>
                <input type="password" name="password" id="password" className="input" placeholder="••••••••" required />
              </div>
            </>
          ) : (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="phone">Phone Number</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" className="input" value="+91" readOnly style={{ width: '60px', textAlign: 'center' }} />
                  <input type="tel" name="phone" id="phone" className="input" placeholder="99999 99999" required />
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                * Phone authentication is coming soon. Please use email for now.
              </p>
            </>
          )}

          <button 
            type="submit" 
            className={`btn btn-primary ${styles.loginBtn}`} 
            disabled={loading || loginMethod === 'phone'}
          >
            {loading && <span className="spinner"></span>}
            {loading ? 'Signing in...' : (loginMethod === 'email' ? 'Sign In' : 'Get OTP')}
          </button>
        </form>

        <div className={styles.divider}>or</div>

        <button className={`btn ${styles.socialBtn}`} disabled={loading}>
          <svg style={{ marginRight: '0.5rem' }} width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <p className={styles.footerText}>
          Don&apos;t have an account? <Link href="/auth/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.authContainer}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
