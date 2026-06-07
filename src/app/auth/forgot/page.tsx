"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';
import styles from './page.module.css';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      if (!auth || typeof auth.onAuthStateChanged !== 'function') {
        throw new Error('Authentication is not initialized properly.');
      }
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset link sent! Please check your email.');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtitle}>Enter your email to receive a password reset link</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="email">Email address</label>
              <input 
                type="email" 
                name="email" 
                id="email" 
                className="input" 
                placeholder="you@example.com" 
                required 
              />
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary ${styles.submitBtn}`} 
              disabled={loading}
            >
              {loading && <span className="spinner"></span>}
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className={styles.footerText}>
          Remembered your password? <Link href="/auth/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
