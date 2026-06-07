"use client";
import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { registerUser, loginUser } from '@/lib/actions/auth';
import styles from './page.module.css';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // 1. Register user on server (creates Firebase User + Firestore doc)
      const res = await registerUser(formData);
      
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      // 2. Sign in on client to get ID Token
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // 3. Set session cookie via server action
      const loginRes = await loginUser(idToken);
      
      if (loginRes.error) {
        setError(loginRes.error);
        setLoading(false);
        return;
      }

      // 4. Success! Redirect
      if (redirect) {
        router.push(redirect);
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className={styles.title}>Join <span style={{ color: 'var(--primary)' }}>B</span>better</h1>
          <p className={styles.subtitle}>Create an account to start shopping smarter.</p>
        </div>

        <div className={styles.tabs}>
          <button 
            type="button"
            className={`${styles.tab} ${method === 'email' ? styles.active : ''}`}
            onClick={() => setMethod('email')}
          >
            Email
          </button>
          <button 
            type="button"
            className={`${styles.tab} ${method === 'phone' ? styles.active : ''}`}
            onClick={() => setMethod('phone')}
          >
            Phone Number
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {method === 'email' ? (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="name">Full Name</label>
                <input type="text" name="name" id="name" className="input" placeholder="Your Name" required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="email">Email address</label>
                <input type="email" name="email" id="email" className="input" placeholder="you@example.com" required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="password">Password</label>
                <input type="password" name="password" id="password" className="input" placeholder="Create a password" required minLength={6} />
              </div>
            </>
          ) : (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="name-phone">Full Name</label>
                <input type="text" name="name" id="name-phone" className="input" placeholder="Your Name" required />
              </div>
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
            className={`btn btn-primary ${styles.submitBtn}`} 
            disabled={loading || method === 'phone'}
          >
            {loading && <span className="spinner"></span>}
            {loading ? 'Processing...' : (method === 'email' ? 'Create Account' : 'Send OTP')}
          </button>
        </form>

        <div className={styles.divider}>or</div>

        <button className={`btn ${styles.socialBtn}`} disabled={loading}>
          <svg style={{ marginRight: '0.5rem' }} width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Sign up with Google
        </button>

        <p className={styles.footerText}>
          Already have an account? <Link href="/auth/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className={styles.authContainer}>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
