"use client";
import React, { useState } from 'react';
import { getPublicOrderById } from '@/lib/actions/firestore';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const fetchedOrder = await getPublicOrderById(orderId.trim(), email.trim());
      if (fetchedOrder) {
        setOrder(fetchedOrder);
      } else {
        setError('Order not found. Please check your Order ID and Email.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED': return 'var(--success)';
      case 'SHIPPED': return 'var(--primary)';
      case 'PROCESSING': return 'var(--warning)';
      case 'CANCELLED': return 'var(--error)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>Track Your Order</h1>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>
        Enter your Order ID and Email address to see real-time updates.
      </p>

      <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <form onSubmit={handleTrack} style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              Order ID
            </label>
            <input 
              type="text" 
              className="input" 
              placeholder="e.g. ord_123456789"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              Email Address
            </label>
            <input 
              type="email" 
              className="input" 
              placeholder="The email used during checkout"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Track Order'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {order && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }} className="animate-fade-in">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Order Status</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                backgroundColor: getStatusColor(order.status)
              }}></div>
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: getStatusColor(order.status) }}>
                {order.status || 'PENDING'}
              </span>
            </div>

            <div style={{ display: 'grid', gap: '1rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Order Date:</span>
                <span style={{ fontWeight: 500 }}>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                <span style={{ fontWeight: 500 }}>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                <span style={{ fontWeight: 600 }}>₹{(order.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Items</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {order.items?.map((item: any, index: number) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: index < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{item.quantity}x</span>
                      <span>{item.name}</span>
                    </div>
                    <span style={{ fontWeight: 500 }}>₹{item.price.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
