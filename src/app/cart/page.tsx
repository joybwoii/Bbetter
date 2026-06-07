"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h1 className={styles.title}>Your Cart is Empty</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Looks like you haven&apos;t added any smart essentials to your cart yet.
        </p>
        <Link href="/" className="btn btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.cartContainer}>
        <h1 className={styles.title}>Your Cart</h1>
        
        <div className={styles.grid}>
          <div className={styles.cartList}>
            {cart.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  {item.image && (
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fill 
                      style={{ objectFit: 'contain' }}
                    />
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <div>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemPrice}>₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div className={styles.qtyControls}>
                      <button 
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >-</button>
                      <span>{item.quantity}</span>
                      <button 
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >+</button>
                    </div>
                    <button 
                      className={styles.removeBtn}
                      onClick={() => removeFromCart(item.id)}
                    >Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>
              
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span style={{ color: 'var(--success)', fontWeight: 500 }}>FREE</span>
              </div>
              
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>

              <button 
                className={`btn btn-primary ${styles.checkoutBtn}`}
                onClick={() => router.push('/checkout')}
              >
                Proceed to Checkout
              </button>

              <div className={styles.trustList}>
                <div className={styles.trustItem}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  <span>100% Secure Payments</span>
                </div>
                <div className={styles.trustItem}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                  <span>Ships within 24 Hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
