"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Header.module.css';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { logoutUser } from '@/lib/actions/auth';

export default function Header() {
  const { cartCount } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);

  const navLink = (href: string, label: string) => (
    <Link 
      href={href} 
      className={`${styles.link} ${pathname === href ? styles.activeLink : ''}`}
    >
      {label}
    </Link>
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await logoutUser();
      router.push('/');
      router.refresh();
      setShowDropdown(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className={`${styles.header} glass`}>
      <div className="container">
        <nav className={styles.nav}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandB}>B</span>better
          </Link>

          <div className={styles.links}>
            {navLink('/category/kitchen', 'Kitchen')}
            {navLink('/category/organization', 'Organization')}
            {navLink('/category/gadgets', 'Gadgets')}
            {navLink('/category/beauty', 'Beauty')}
            {navLink('/category/home-gym', 'Home Gym')}
          </div>

          <div className={styles.actions}>
            <button className={styles.iconBtn} aria-label="Search">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
            
            {!loading && user ? (
              <div style={{ position: 'relative' }}>
                <button 
                  className={styles.iconBtn} 
                  aria-label="Account"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </button>
                {showDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem',
                    minWidth: '150px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 50,
                  }}>
                    <div style={{ padding: '0.5rem', fontSize: '0.875rem', fontWeight: 600, borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                      {user.email}
                    </div>
                    {/* Add links to orders/profile later if needed */}
                    <button 
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem',
                        fontSize: '0.875rem',
                        color: 'var(--error)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className={styles.iconBtn} aria-label="Account">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </Link>
            )}

            <Link href="/cart" className={styles.iconBtn} aria-label="Cart" style={{ position: 'relative' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
