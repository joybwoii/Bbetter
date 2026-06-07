'use client';
import { useState } from 'react';
import { updateOrderStatus } from '@/lib/actions/admin';
import styles from '../../admin.module.css';

interface StatusUpdateFormProps {
  orderId: string;
  currentStatus: string;
}

export default function StatusUpdateForm({ orderId, currentStatus }: StatusUpdateFormProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);
    const result = await updateOrderStatus(orderId, newStatus);
    setLoading(false);
    if (!result.success) {
      alert(result.error || 'Failed to update status');
      setStatus(currentStatus);
    }
  };

  return (
    <div className={styles.panelCard} style={{ marginBottom: '2rem' }}>
      <h2 className={styles.sectionHeading}>Update Status</h2>
      <div style={{ position: 'relative' }}>
        <select 
          className={styles.select} 
          value={status} 
          onChange={handleUpdate}
          disabled={loading}
        >
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        {loading && (
          <div style={{ 
            position: 'absolute', 
            right: '2.5rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            fontSize: '0.75rem',
            color: 'var(--primary)'
          }}>
            Updating...
          </div>
        )}
      </div>
    </div>
  );
}
