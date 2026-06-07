"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Script from 'next/script';

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login?redirect=/checkout');
    }
  }, [user, loading, router]);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pinCode: '',
    phone: '',
    paymentMethod: 'online' // Default to online
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (cart.length === 0) {
      router.replace('/cart');
    }
  }, [cart, router]);

  const handleRazorpayPayment = async () => {
    try {
      // 1. Create Razorpay order
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          shippingData: formData
        })
      });

      const orderData = await res.json();
      if (orderData.error) throw new Error(orderData.error);

      // Handle mock mode to bypass loading real SDK iframe
      if (orderData.mock) {
        setIsProcessing(true);
        setTimeout(async () => {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: orderData.orderId,
                razorpay_payment_id: `mock_pay_${Date.now()}`,
                razorpay_signature: `mock_sig_${Date.now()}`,
                orderDetails: {
                  items: cart,
                  shipping: formData,
                  total: cartTotal,
                  paymentMethod: 'Online'
                }
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              if (clearCart) clearCart();
              router.push(`/checkout/success?orderId=${verifyData.documentId}`);
            } else {
              alert('Payment verification failed: ' + (verifyData.error || 'Unknown error'));
              setIsProcessing(false);
            }
          } catch (err: any) {
            console.error(err);
            alert(err.message || 'Payment failed');
            setIsProcessing(false);
          }
        }, 1500);
        return;
      }

      // 2. Initialize Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Bbetter',
        description: 'Order Payment',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          // 3. Verify payment
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: {
                items: cart,
                shipping: formData,
                total: cartTotal,
                paymentMethod: 'Online'
              }
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            if (clearCart) clearCart();
            router.push(`/checkout/success?orderId=${verifyData.documentId}`);
          } else {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: () => setIsProcessing(false)
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Payment failed');
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    if (formData.paymentMethod === 'online') {
      return handleRazorpayPayment();
    }

    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderDetails: {
            items: cart,
            shipping: formData,
            total: cartTotal,
            paymentMethod: 'COD'
          }
        })
      });
      
      const orderData = await orderRes.json();
      
      if (orderData.error) {
        alert(orderData.error);
        setIsProcessing(false);
        return;
      }

      if (orderData.success) {
          if (clearCart) clearCart();
          router.push(`/checkout/success?orderId=${orderData.documentId}`);
      }

    } catch (err) {
      console.error(err);
      alert('Something went wrong!');
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.checkoutGrid}>
        
        {/* Left Column: Forms */}
        <div className={styles.mainCol}>
          <div className={styles.header}>
            <Link href="/" className={styles.logoLink}>
               <h2 style={{ fontWeight: 700, letterSpacing: '-0.025em' }}><span style={{ color: 'var(--primary)' }}>B</span>better</h2>
            </Link>
            <div className={styles.steps}>
              <span className={`${styles.stepIndicator} ${step >= 1 ? styles.active : ''}`}>1. Shipping</span>
              <span className={styles.stepDivider}></span>
              <span className={`${styles.stepIndicator} ${step >= 2 ? styles.active : ''}`}>2. Payment</span>
            </div>
          </div>

          <div className={styles.formContainer}>
            {step === 1 ? (
              <div className={styles.shippingSection}>
                <h2 className={styles.sectionTitle}>Contact Information</h2>
                <input 
                  type="email" 
                  name="email"
                  className="input" 
                  placeholder="Email address" 
                  style={{ marginBottom: '1rem' }} 
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                
                <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Shipping Address</h2>
                <div className={styles.formGrid}>
                  <input 
                    type="text" 
                    name="firstName"
                    className="input" 
                    placeholder="First Name" 
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                  <input 
                    type="text" 
                    name="lastName"
                    className="input" 
                    placeholder="Last Name" 
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <input 
                  type="text" 
                  name="address"
                  className={`input ${styles.fullWidth}`} 
                  placeholder="Address (House No, Building, Street, Area)" 
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
                <input 
                  type="text" 
                  name="apartment"
                  className={`input ${styles.fullWidth}`} 
                  placeholder="Apartment, suite, etc. (optional)" 
                  value={formData.apartment}
                  onChange={handleInputChange}
                />
                <div className={styles.formGrid}>
                  <input 
                    type="text" 
                    name="city"
                    className="input" 
                    placeholder="City" 
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                  <input 
                    type="text" 
                    name="state"
                    className="input" 
                    placeholder="State" 
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                  <input 
                    type="text" 
                    name="pinCode"
                    className="input" 
                    placeholder="PIN Code" 
                    value={formData.pinCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <input 
                  type="tel" 
                  name="phone"
                  className={`input ${styles.fullWidth}`} 
                  placeholder="Phone Number" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />

                <button 
                  className={`btn btn-primary ${styles.actionBtn}`} 
                  onClick={() => setStep(2)}
                >
                  Continue to Payment
                </button>
              </div>
            ) : (
              <div className={styles.paymentSection}>
                <div className={styles.shippingSummary}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Contact</span>
                    <span className={styles.summaryValue}>{formData.email}</span>
                    <button className={styles.changeBtn} onClick={() => setStep(1)}>Change</button>
                  </div>
                  <div className={styles.summaryDivider}></div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Ship to</span>
                    <span className={styles.summaryValue}>
                      {formData.address}, {formData.city}, {formData.state}, {formData.pinCode}
                    </span>
                    <button className={styles.changeBtn} onClick={() => setStep(1)}>Change</button>
                  </div>
                </div>

                <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Payment</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>All transactions are secure and encrypted.</p>

                <div className={styles.paymentMethods}>
                  <label className={`${styles.paymentMethod} ${formData.paymentMethod === 'online' ? styles.selected : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="online" 
                        checked={formData.paymentMethod === 'online'} 
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>Online Payment (UPI, Card, NetBanking)</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Secure payment via Razorpay</span>
                      </div>
                    </div>
                  </label>
                  <label className={`${styles.paymentMethod} ${formData.paymentMethod === 'cod' ? styles.selected : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cod" 
                        checked={formData.paymentMethod === 'cod'} 
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>Cash on Delivery (COD)</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pay when you receive the order</span>
                      </div>
                    </div>
                  </label>
                </div>

                <div className={styles.actionRow}>
                  <button className={styles.backBtn} onClick={() => setStep(1)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Return to shipping
                  </button>
                  <button 
                    className={`btn btn-primary ${styles.payBtn}`}
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing && <span className="spinner"></span>}
                    {isProcessing ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className={styles.summaryCol}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            
            <div className={styles.cartItems}>
              {cart.map(item => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemImage}>
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill style={{ objectFit: 'contain' }} />
                    )}
                    <span className={styles.itemQty}>{item.quantity}</span>
                  </div>
                  <div className={styles.itemDetails}>
                    <span className={styles.itemName}>{item.name}</span>
                  </div>
                  <span className={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className={styles.discountCode}>
              <input type="text" className="input" placeholder="Discount code" />
              <button className={`btn btn-outline ${styles.applyBtn}`}>Apply</button>
            </div>

            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Subtotal</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Shipping</span>
                <span>Free</span>
              </div>
              <div className={styles.totalDivider}></div>
              <div className={styles.totalRow} style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)' }}>
                <span className={styles.totalLabel}>Total</span>
                <span><span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400, marginRight: '0.5rem'}}>INR</span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </div>
  );
}
