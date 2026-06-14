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
import { Category } from '@/lib/actions/firestore';

export default function Header({ categories = [] }: { categories?: Category[] }) {
  const { cartCount, setIsCartOpen } = useCart();
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
            {categories.map((category) => (
              <div key={category.id}>
                {navLink(`/category/${category.id}`, category.name)}
              </div>
            ))}
            {categories.length === 0 && (
              <>
                {navLink('/category/kitchen', 'Kitchen')}
                {navLink('/category/organization', 'Organization')}
                {navLink('/category/gadgets', 'Gadgets')}
                {navLink('/category/beauty', 'Beauty')}
                {navLink('/category/home-gym', 'Home Gym')}
              </>
            )}
          </div>

          <div className={styles.actions}>
            <button className={styles.iconBtn} aria-label="Search">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
            
            <div style={{ position: 'relative' }}>
              {user && !loading ? (
                <>
                  <button 
                    className={styles.iconBtn} 
                    aria-label="Account Menu"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.displayName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}</span>
                    </div>
                  </button>
                  {showDropdown && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem', minWidth: '150px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', zIndex: 100 }}>
                      <div style={{ padding: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem', wordBreak: 'break-all' }}>
                        {user.email}
                      </div>
                      <Link href="/my-orders" className={styles.link} style={{ display: 'block', padding: '0.5rem', margin: 0, textAlign: 'left' }} onClick={() => setShowDropdown(false)}>
                        My Orders
                      </Link>
                      <button onClick={handleLogout} className={styles.link} style={{ display: 'block', width: '100%', padding: '0.5rem', margin: 0, textAlign: 'left', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Log Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/auth/login" className={styles.iconBtn} aria-label="Account">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </Link>
              )}
            </div>

            <button 
              className={styles.iconBtn} 
              aria-label="Cart" 
              style={{ position: 'relative' }}
              onClick={() => setIsCartOpen(true)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
