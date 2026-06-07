import { getProducts } from '@/lib/actions/admin';
import Link from 'next/link';
import styles from '../admin.module.css';
import DeleteProductButton from './components/DeleteProductButton';
import ToggleProductStatusButton from './components/ToggleProductStatusButton';

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>Products Management</h1>
        <Link href="/admin/products/new" className="btn btn-primary">
          Add New Product
        </Link>
      </div>

      <div className={styles.panelCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? products.map((product: any) => (
              <tr key={product.id}>
                <td style={{ fontWeight: 500 }}>{product.name}</td>
                <td>{product.category}</td>
                <td>₹{product.price?.toLocaleString()}</td>
                <td>{product.stock || 0}</td>
                <td>
                  <span 
                    className={styles.badge} 
                    style={{ 
                      background: product.isActive !== false ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', 
                      color: product.isActive !== false ? 'var(--success)' : 'var(--danger)' 
                    }}
                  >
                    {product.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <Link href={`/admin/products/${product.id}/edit`} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                      Edit
                    </Link>
                    <ToggleProductStatusButton id={product.id} isActive={product.isActive !== false} />
                    <DeleteProductButton id={product.id} />
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
