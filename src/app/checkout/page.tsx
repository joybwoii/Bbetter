"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useCart } from '@/context/CartContext';
import Script from 'next/script';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  // Calculate available payment methods based on cart items
  // Default to true, but if ANY item in cart has the flag set to false explicitly, disable it.
  const isCODAllowed = cart.length > 0 && cart.every(item => item.isCODEnabled !== false);
  const isOnlineAllowed = cart.length > 0 && cart.every(item => item.isOnlinePaymentEnabled !== false);

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
    paymentMethod: isCODAllowed ? 'cod' : (isOnlineAllowed ? 'online' : '')
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (cart.length === 0 && !orderSuccess) {
      router.replace('/cart');
    }
  }, [cart, router, orderSuccess]);

  const handlePayment = async () => {
    // Validate Mobile Number
    const phoneRegex = /^[0-9]{10,}$/;
    if (!phoneRegex.test(formData.phone.replace(/[\s-]/g, ''))) {
      alert('Please enter a valid mobile number (at least 10 digits).');
      return;
    }

    setIsProcessing(true);

    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderDetails: {
            items: cart,
            shipping: formData,
            total: cartTotal,
            paymentMethod: formData.paymentMethod === 'cod' ? 'COD' : 'ONLINE'
          }
        })
      });
      
      const orderData = await orderRes.json();
      
      if (orderData.error) {
        alert(orderData.error);
        setIsProcessing(false);
        return;
      }

      if (formData.paymentMethod === 'online' && orderData.orderId) {
        const rzpOrderRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: cartTotal })
        });
        const rzpOrderData = await rzpOrderRes.json();
        
        if (rzpOrderData.error) {
          alert('Failed to initialize payment gateway.');
          setIsProcessing(false);
          return;
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
          amount: rzpOrderData.amount,
          currency: rzpOrderData.currency,
          name: "Bbetter",
          description: "Premium Lifestyle & Scents",
          order_id: rzpOrderData.id,
          handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; }) {
            try {
              const verifyRes = await fetch('/api/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  local_order_id: orderData.documentId
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                if (clearCart) clearCart();
                setPlacedOrderId(orderData.documentId);
                setOrderSuccess(true);
                setIsProcessing(false);
              } else {
                alert('Payment verification failed.');
                setIsProcessing(false);
              }
            } catch (err) {
              alert('Error verifying payment.');
              setIsProcessing(false);
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone
          },
          theme: {
            color: "#d4af37" 
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false);
            }
          }
        };

        const rzp1 = new (window as unknown as { Razorpay: new (options: unknown) => { on: (event: string, handler: (resp: { error: { description: string } }) => void) => void; open: () => void; } }).Razorpay(options);
        rzp1.on('payment.failed', function (response: { error: { description: string } }) {
          alert('Payment Failed: ' + response.error.description);
          setIsProcessing(false);
        });
        rzp1.open();
        return; 
      }

      if (orderData.success) {
          if (clearCart) clearCart();
          setPlacedOrderId(orderData.documentId);
          setOrderSuccess(true);
          setIsProcessing(false);
      }

    } catch (err) {
      console.error(err);
      alert('Something went wrong!');
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !orderSuccess) return null;

  return (
    <div className={styles.checkoutContainer}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
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
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', marginTop: '1rem' }}>
                  Mobile Number <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  className={`input ${styles.fullWidth}`} 
                  placeholder="e.g. 9876543210" 
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

                <h2 className={styles.sectionTitle}>Payment</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Choose your preferred payment method.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  <label 
                    style={{ 
                      padding: '1.5rem', backgroundColor: formData.paymentMethod === 'cod' ? 'var(--surface-hover)' : 'var(--surface)', 
                      borderRadius: 'var(--radius-md)', border: formData.paymentMethod === 'cod' ? '2px solid var(--primary)' : '1px solid var(--border)', 
                      display: 'flex', alignItems: 'center', gap: '1rem', cursor: isCODAllowed ? 'pointer' : 'not-allowed', opacity: isCODAllowed ? 1 : 0.5 
                    }}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cod" 
                      checked={formData.paymentMethod === 'cod'} 
                      onChange={handleInputChange} 
                      disabled={!isCODAllowed}
                      style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)' }}
                    />
                    <div>
                      <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>Cash on Delivery (COD)</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {isCODAllowed ? 'Pay at your doorstep when the order arrives.' : 'Not available for some items in your cart.'}
                      </p>
                    </div>
                  </label>

                  <label 
                    style={{ 
                      padding: '1.5rem', backgroundColor: formData.paymentMethod === 'online' ? 'var(--surface-hover)' : 'var(--surface)', 
                      borderRadius: 'var(--radius-md)', border: formData.paymentMethod === 'online' ? '2px solid var(--primary)' : '1px solid var(--border)', 
                      display: 'flex', alignItems: 'center', gap: '1rem', cursor: isOnlineAllowed ? 'pointer' : 'not-allowed', opacity: isOnlineAllowed ? 1 : 0.5 
                    }}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="online" 
                      checked={formData.paymentMethod === 'online'} 
                      onChange={handleInputChange} 
                      disabled={!isOnlineAllowed}
                      style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)' }}
                    />
                    <div>
                      <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>Online Payment</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {isOnlineAllowed ? 'Pay securely via UPI, Credit/Debit Card, or Netbanking.' : 'Not available for some items in your cart.'}
                      </p>
                    </div>
                  </label>
                </div>

                {!isCODAllowed && !isOnlineAllowed && (
                  <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    No valid payment methods are available for the items in your cart. Please review your cart.
                  </div>
                )}

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

      {orderSuccess && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
          <div style={{ backgroundColor: 'var(--surface)', padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', maxWidth: '450px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid var(--border)', animation: 'slide-up 0.4s ease-out' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto', boxShadow: '0 10px 25px rgba(212, 175, 55, 0.4)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--foreground)' }}>Order Placed!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Your order has been successfully placed. We are preparing it for shipment.</p>
            {placedOrderId && (
              <div style={{ padding: '1rem', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px dashed var(--border)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Order ID</span>
                <p style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '1.125rem', color: 'var(--foreground)' }}>{placedOrderId}</p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link href={`/track-order?id=${placedOrderId}`} className="btn btn-primary">Track Order</Link>
              <Link href="/" className="btn btn-outline">Continue Shopping</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
