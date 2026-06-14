export const dynamic = 'force-dynamic';
import { getCategories } from '@/lib/actions/firestore';
import ProductForm from '../components/ProductForm';
import styles from '../../admin.module.css';

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className={styles.pageTitle}>Add New Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
