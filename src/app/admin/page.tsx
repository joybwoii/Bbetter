import { getDashboardStats } from '@/lib/actions/admin';
import styles from './admin.module.css';

export default async function AdminDashboard() {
  const stats = await getDashboardStats() as any;

  if ('error' in stats) {
    return <div className={styles.error}>{stats.error}</div>;
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>Dashboard Overview</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Sales</span>
          <span className={styles.statValue}>₹{(stats.totalSales || 0).toLocaleString()}</span>
          <span className={styles.statTrend} style={{ color: 'var(--success)' }}>Updated just now</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Orders</span>
          <span className={styles.statValue}>{stats.activeOrders}</span>
          <span className={styles.statTrend} style={{ color: 'var(--text-muted)' }}>Requiring attention</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Customers</span>
          <span className={styles.statValue}>{stats.totalCustomers}</span>
          <span className={styles.statTrend} style={{ color: 'var(--success)' }}>Total registered</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Low Stock Items</span>
          <span className={styles.statValue}>{stats.lowStockItems}</span>
          <span className={styles.statTrend} style={{ color: stats.lowStockItems > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {stats.lowStockItems > 0 ? 'Requires immediate restock' : 'All items in stock'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div className={styles.panelCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className={styles.panelTitle} style={{ marginBottom: 0 }}>Recent Orders</h2>
            <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>View All</button>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length > 0 ? stats.recentOrders.map((order: any) => (
                <tr key={order.id}>
                  <td>#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td>{order.customerName || 'Guest'}</td>
                  <td>
                    <span 
                      className={styles.badge} 
                      style={{ 
                        background: order.status === 'DELIVERED' ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)', 
                        color: order.status === 'DELIVERED' ? 'var(--success)' : '#ca8a04' 
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>₹{order.total?.toLocaleString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.panelCard}>
          <h2 className={styles.panelTitle}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn btn-primary" style={{ width: '100%' }}>Add New Product</button>
            <button className="btn btn-outline" style={{ width: '100%' }}>Create Discount Code</button>
            <button className="btn btn-outline" style={{ width: '100%' }}>Update Stock Levels</button>
          </div>
          
          <h2 className={styles.panelTitle} style={{ marginTop: '2rem' }}>Recent Users</h2>
          {stats.recentUsers && stats.recentUsers.length > 0 ? (
            <ul className={styles.topProducts}>
              {stats.recentUsers.map((user: any) => (
                <li key={user.id} className={styles.topProductItem}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{user.displayName || user.email || 'Unknown User'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--success)', background: 'rgba(34,197,94,0.1)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>Active</span>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No recent users</div>
          )}
        </div>
      </div>
    </div>
  );
}
