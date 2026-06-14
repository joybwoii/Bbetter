import { getOrderById } from '@/lib/actions/admin';
import Link from 'next/link';
import styles from '../../admin.module.css';
import StatusUpdateForm from './StatusUpdateForm';

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const order = await getOrderById(resolvedParams.id) as any;

  if (!order) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🔍</div>
        <h3>Order not found</h3>
        <p>The order you are looking for does not exist or has been removed.</p>
        <Link href="/admin/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Orders</Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED': return { bg: 'rgba(34,197,94,0.2)', color: 'var(--success)' };
      case 'SHIPPED': return { bg: 'rgba(59,130,246,0.2)', color: 'var(--primary)' };
      case 'PROCESSING': return { bg: 'rgba(234,179,8,0.2)', color: '#ca8a04' };
      case 'CANCELLED': return { bg: 'rgba(239,68,68,0.2)', color: 'var(--danger)' };
      default: return { bg: 'rgba(107,114,128,0.2)', color: 'var(--text-muted)' };
    }
  };

  const statusStyle = getStatusColor(order.status);

  return (
    <div>
      <div className={styles.orderHeader}>
        <div className={styles.orderMeta}>
          <Link href="/admin/orders" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textDecoration: 'none' }}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
             Back to Orders
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className={styles.orderId}>Order #{order.id.slice(0, 8).toUpperCase()}</h1>
            <span className={styles.badge} style={{ background: statusStyle.bg, color: statusStyle.color }}>
              {order.status || 'Pending'}
            </span>
          </div>
          <span className={styles.orderDate}>Placed on {new Date(order.createdAt?.seconds * 1000 || order.createdAt).toLocaleString()}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline">Print Packing Slip</button>
        </div>
      </div>

      <div className={styles.orderGrid}>
        <div className={styles.mainCol}>
          <div className={styles.panelCard} style={{ marginBottom: '2rem' }}>
            <h2 className={styles.sectionHeading}>Order Items</h2>
            <div className={styles.itemList}>
              {order.items?.map((item: any) => (
                <div key={item.id} className={styles.itemRow}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemThumb}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No Img</span>
                      )}
                    </div>
                    <div>
                      <div className={styles.itemName}>{item.name}</div>
                      <div className={styles.itemPrice}>₹{item.price?.toLocaleString()} × {item.quantity}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span color="var(--text-muted)">Subtotal</span>
                <span>₹{order.total?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span color="var(--text-muted)">Shipping</span>
                <span style={{ color: 'var(--success)' }}>Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontWeight: 700, fontSize: '1.125rem' }}>
                <span>Total</span>
                <span>₹{order.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className={styles.panelCard}>
            <h2 className={styles.sectionHeading}>Payment Information</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{order.paymentMethod || 'Cash on Delivery (COD)'}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Status: {order.paymentStatus || 'Pending'}</div>
              </div>
              <span className={styles.badge} style={{ background: 'rgba(234,179,8,0.2)', color: '#ca8a04' }}>
                {order.paymentStatus || 'Awaiting Payment'}
              </span>
            </div>
          </div>
        </div>

        <aside className={styles.sideCol}>
          <StatusUpdateForm orderId={resolvedParams.id} currentStatus={order.status} />

          <div className={styles.panelCard}>
            <h2 className={styles.sectionHeading}>Shipping Address</h2>
            <div className={styles.addressCard}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{order.shipping?.firstName} {order.shipping?.lastName}</div>
              <div>{order.shipping?.address}</div>
              {order.shipping?.apartment && <div>{order.shipping?.apartment}</div>}
              <div>{order.shipping?.city}, {order.shipping?.state} - {order.shipping?.pinCode}</div>
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', color: 'var(--primary)' }}>
                {order.shipping?.phone}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.shipping?.email}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
