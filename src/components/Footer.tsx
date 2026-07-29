import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brandInfo}>
            <Link href="/" className={styles.brand}>
              <span className={styles.brandB}>B</span>better
            </Link>
            <p className={styles.description}>
              Elevating your presence with exclusive, premium fragrances crafted for elegance.
            </p>
          </div>
          
          <div>
            <h3 className={styles.heading}>Shop</h3>
            <ul className={styles.list}>
              <li><Link href="/category/men" className={styles.link}>Men</Link></li>
              <li><Link href="/category/women" className={styles.link}>Women</Link></li>
              <li><Link href="/#trending" className={styles.link}>Best Sellers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className={styles.heading}>Support</h3>
            <ul className={styles.list}>
              <li><Link href="/faq" className={styles.link}>FAQ</Link></li>
              <li><Link href="/track-order" className={styles.link}>Track Order</Link></li>
              <li><Link href="/shipping-returns" className={styles.link}>Shipping & Returns</Link></li>
              <li><Link href="/contact" className={styles.link}>Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className={styles.heading}>Legal</h3>
            <ul className={styles.list}>
              <li><Link href="/terms" className={styles.link}>Terms of Service</Link></li>
              <li><Link href="/privacy" className={styles.link}>Privacy Policy</Link></li>
              <li><Link href="/refund" className={styles.link}>Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} Bbetter. All rights reserved.</p>
          <p>Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}
