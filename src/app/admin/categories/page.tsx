import { getCategories } from '@/lib/actions/firestore';
import styles from '../admin.module.css';
import { createCategory } from '@/lib/actions/admin';
import { revalidatePath } from 'next/cache';

export default async function CategoriesPage() {
  const categories = await getCategories();

  async function handleAddCategory(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    
    if (name) {
      await createCategory({ name, description });
      revalidatePath('/admin/categories');
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
      <div>
        <h1 className={styles.pageTitle}>Product Categories</h1>
        <div className={styles.panelCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug (ID)</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat: any) => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 600 }}>{cat.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{cat.id}</td>
                  <td>{cat.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <aside>
        <div className={styles.panelCard}>
          <h2 className={styles.panelTitle}>Add New Category</h2>
          <form action={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className={styles.statLabel}>Category Name</label>
              <input type="text" name="name" className="input" required placeholder="e.g. Smart Home" />
            </div>
            <div>
              <label className={styles.statLabel}>Description</label>
              <textarea name="description" className="input" rows={3} placeholder="Short description..."></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Create Category
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
