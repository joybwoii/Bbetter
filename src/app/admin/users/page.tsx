import { getUsers } from '@/lib/actions/admin';
import styles from '../admin.module.css';

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>Users Management</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Export Users</button>
        </div>
      </div>

      <div className={styles.panelCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Joined Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map((user: any) => (
              <tr key={user.id}>
                <td style={{ fontWeight: 500 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className={styles.avatar} style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                        {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span>{user.displayName || 'Unnamed User'}</span>
                   </div>
                </td>
                <td>{user.email}</td>
                <td>{user.createdAt ? new Date(user.createdAt?.seconds * 1000 || user.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <span className={styles.badge} style={{ background: 'rgba(34,197,94,0.2)', color: 'var(--success)' }}>
                    Active
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                    View Profile
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5}>
                   <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>👥</div>
                    <h3>No users found</h3>
                    <p>When customers register, they will appear here.</p>
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
