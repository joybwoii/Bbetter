import { getOrders } from '@/lib/actions/admin';
import Link from 'next/link';
import styles from '../admin.module.css';

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED': return { bg: 'rgba(34,197,94,0.2)', color: 'var(--success)' };
      case 'SHIPPED': return { bg: 'rgba(59,130,246,0.2)', color: 'var(--primary)' };
      case 'PROCESSING': return { bg: 'rgba(234,179,8,0.2)', color: '#ca8a04' };
      case 'CANCELLED': return { bg: 'rgba(239,68,68,0.2)', color: 'var(--danger)' };
      default: return { bg: 'rgba(107,114,128,0.2)', color: 'var(--text-muted)' };
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>Orders Management</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Export CSV</button>
        </div>
      </div>

      <div className={styles.panelCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Total</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? orders.map((order: any) => {
              const statusStyle = getStatusColor(order.status);
              return (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td>{new Date(order.createdAt?.seconds * 1000 || order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{order.shipping?.firstName} {order.shipping?.lastName}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.shipping?.email}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{order.paymentMethod || 'COD'}</span>
                  </td>
                  <td>
                    <span 
                      className={styles.badge} 
                      style={{ 
                        background: statusStyle.bg, 
                        color: statusStyle.color 
                      }}
                    >
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{order.total?.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/admin/orders/${order.id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                      Details
                    </Link>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={7}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📦</div>
                    <h3>No orders found</h3>
                    <p>When customers place orders, they will appear here.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
