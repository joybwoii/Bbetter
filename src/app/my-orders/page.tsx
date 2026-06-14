"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserOrdersByEmail } from '@/lib/actions/firestore';
import Link from 'next/link';

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.email) {
        setLoading(false);
        return;
      }
      try {
        const fetchedOrders = await getUserOrdersByEmail(user.email);
        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
      setLoading(false);
    }

    if (!authLoading) {
      fetchOrders();
    }
  }, [user, authLoading]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED': return 'var(--success)';
      case 'SHIPPED': return 'var(--primary)';
      case 'PROCESSING': return 'var(--warning)';
      case 'CANCELLED': return 'var(--error)';
      default: return 'var(--text-muted)';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
        <span className="spinner" style={{ width: '2rem', height: '2rem', borderTopColor: 'var(--primary)' }}></span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>My Orders</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please log in to view your order history.</p>
        <Link href="/auth/login" className="btn btn-primary">Log In</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>My Orders</h1>
      
      {orders.length === 0 ? (
        <div style={{ backgroundColor: 'var(--surface)', padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No orders yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>When you place orders, they will appear here.</p>
          <Link href="/" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order.id} style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Order #{order.orderNumber || order.id.slice(0, 8)}</div>
                  <div style={{ fontWeight: 500 }}>Placed on {new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>₹{(order.total || 0).toLocaleString('en-IN')}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(order.status) }}></div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: getStatusColor(order.status) }}>{order.status || 'PENDING'}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-muted)' }}>ITEMS</h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {order.items?.map((item: any, index: number) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>{item.quantity}x</span>
                        <span>{item.name}</span>
                      </div>
                      <span style={{ fontWeight: 500 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
